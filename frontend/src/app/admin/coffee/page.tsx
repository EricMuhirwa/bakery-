"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useSession } from "next-auth/react";
import {
    useCoffeesQuery,
    useCreateCoffeeMutation,
    useDeleteCoffeeMutation,
    useUpdateCoffeeMutation,
} from "@/lib/redux/slices/CoffeeSlice";

interface Coffee {
    id?: string;
    image: string;
    title: string;
    description: string;
    price: number;
}

interface CoffeeUpdateData {
    id: string;
    data: Omit<Coffee, "id">;
}

const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset as string);

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Image upload failed");
    }

    return data.secure_url;
};

const CoffeeManagement: React.FC = () => {
    const { data: sessionData } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentCoffee, setCurrentCoffee] = useState<Coffee>({
        image: "",
        title: "",
        description: "",
        price: 0,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { data: coffees = [], isLoading, refetch, isError, error } = useCoffeesQuery({});
    const [createCoffee] = useCreateCoffeeMutation();
    const [updateCoffee] = useUpdateCoffeeMutation();
    const [deleteCoffee] = useDeleteCoffeeMutation();

    const filteredCoffees = coffees?.filter((coffee: Coffee) =>
        coffee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coffee.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentCoffee((prev) => ({
            ...prev,
            [name]: name === "price" ? parseFloat(value) : value,
        }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            let imageUrl = currentCoffee.image;

            // Upload image if a file is selected
            if (imageFile) {
                imageUrl = await uploadImageToCloudinary(imageFile);
            }

            if (modalMode === "create") {
                await createCoffee({
                    ...currentCoffee,
                    image: imageUrl,
                    userId: sessionData?.user?.id,
                }).unwrap();
            } else if (currentCoffee.id) {
                const updateData: CoffeeUpdateData = {
                    id: currentCoffee.id,
                    data: { ...currentCoffee, image: imageUrl },
                };
                await updateCoffee(updateData).unwrap();
            }

            setIsModalOpen(false);
            resetForm();
            refetch();
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'message' in error) {
                const err = error as { message?: string; data?: { message?: string } };
                alert(`Error saving coffee: ${err.data?.message || err.message}`);
            } else {
                alert('An unknown error occurred while saving coffee.');
            }
        }

    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this coffee?")) {
            try {
                await deleteCoffee(id).unwrap();
                refetch();
            } catch (error: unknown) {
                if (error && typeof error === 'object' && 'data' in error) {
                    const err = error as FetchBaseQueryError & { data?: { message?: string } };
                    alert(`Error deleting coffee: ${err.data?.message || 'An error occurred'}`);
                } else {
                    alert('An unknown error occurred while deleting coffee.');
                }
            }
        }
    };

    const handleEdit = (coffee: Coffee) => {
        setCurrentCoffee(coffee);
        setModalMode("edit");
        setIsModalOpen(true);
        setImageFile(null);
    };

    const resetForm = () => {
        setCurrentCoffee({
            image: "",
            title: "",
            description: "",
            price: 0,
        });
        setImageFile(null);
    };

    useEffect(() => {
        if (isError) {
            if ("data" in error) {
                const errorMessage = (error.data as { message?: string })?.message || "Unknown error";
                alert(`Error fetching coffees: ${errorMessage}`);
            } else {
                alert("Unknown error occurred");
            }
        }
    }, [isError, error]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">CEBK Products and Prices</h1>

            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search bakery items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border px-4 py-2 rounded w-1/2"
                />
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                        setModalMode("create");
                        setIsModalOpen(true);
                        resetForm();
                    }}
                >
                    Add Item
                </button>
            </div>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredCoffees.map((coffee: Coffee) => (
                        <div key={coffee.id} className="border rounded p-4 shadow">
                            <Image
                                src={coffee.image}
                                alt={coffee.title}
                                width={100}
                                height={150}
                                className="w-full h-40 object-cover rounded mb-2"
                                unoptimized // Add this if you're using external domains not configured in next.config.js
                            />
                            <h2 className="text-xl font-semibold mb-1">{coffee.title}</h2>
                            <p className="text-gray-600 mb-2">{coffee.description}</p>
                            <p className="text-green-700 font-bold mb-4">RWF {coffee.price.toFixed(2)}</p>
                            <div className="flex gap-2">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleEdit(coffee)}>
                                    Edit
                                </button>
                                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(coffee.id!)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {modalMode === "create" ? "Add New item" : "Edit item"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="border w-full mb-2 px-3 py-2 rounded"
                            />
                            <input
                                type="text"
                                name="title"
                                placeholder="Title"
                                value={currentCoffee.title}
                                onChange={handleInputChange}
                                className="border w-full mb-2 px-3 py-2 rounded"
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={currentCoffee.description}
                                onChange={handleInputChange}
                                className="border w-full mb-2 px-3 py-2 rounded"
                                required
                            />
                            <input
                                type="number"
                                name="price"
                                placeholder="Price"
                                value={currentCoffee.price}
                                onChange={handleInputChange}
                                className="border w-full mb-4 px-3 py-2 rounded"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                                    {modalMode === "create" ? "Add" : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoffeeManagement;