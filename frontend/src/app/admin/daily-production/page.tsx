"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useSession } from "next-auth/react";
import {
    useDailyProductionsQuery,
    useCreateDailyProductionMutation,
    useDeleteDailyProductionMutation,
    useUpdateDailyProductionMutation,
} from "@/lib/redux/slices/DailyProductionSlice";

interface DailyProduction {
    id?: string;
    item: string;
    quantityProduced: number;
    timeProduced: string;
    remark?: string;
}

interface DailyProductionUpdateData {
    id: string;
    data: Omit<DailyProduction, "id">;
}

const DailyProductionManagement: React.FC = () => {
    const { data: sessionData } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentDailyProduction, setCurrentDailyProduction] =
        useState<DailyProduction>({
            item: "",
            quantityProduced: 0,
            timeProduced: "",
            remark: "",
        });

    const {
        data: dailyProductions = [],
        isLoading,
        refetch,
        isError,
        error,
    } = useDailyProductionsQuery({});

    const [createDailyProduction] = useCreateDailyProductionMutation();
    const [updateDailyProduction] = useUpdateDailyProductionMutation();
    const [deleteDailyProduction] = useDeleteDailyProductionMutation();

    const dailyProductionsArray = Array.isArray(dailyProductions) ? dailyProductions : [];
    const filteredDailyProductions = dailyProductionsArray.filter(
        (dailyProduction: DailyProduction) =>
            dailyProduction.item
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (dailyProduction.remark &&
                dailyProduction.remark
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
    );

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setCurrentDailyProduction((prev) => ({
            ...prev,
            [name]:
                name === "quantityProduced" ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (modalMode === "create") {
                await createDailyProduction({
                    ...currentDailyProduction,
                    userId: sessionData?.user?.id,
                }).unwrap();
            } else if (currentDailyProduction.id) {
                const updateData: DailyProductionUpdateData = {
                    id: currentDailyProduction.id,
                    data: { ...currentDailyProduction },
                };
                await updateDailyProduction(updateData).unwrap();
            }

            setIsModalOpen(false);
            resetForm();
            refetch();
        } catch (error: unknown) {
            if (error && typeof error === "object" && "message" in error) {
                const err = error as {
                    message?: string;
                    data?: { message?: string };
                };
                alert(
                    `Error saving daily production: ${err.data?.message || err.message
                    }`
                );
            } else {
                alert(
                    "An unknown error occurred while saving daily production."
                );
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this daily production?")) {
            try {
                await deleteDailyProduction(id).unwrap();
                refetch();
            } catch (error: unknown) {
                if (error && typeof error === "object" && "data" in error) {
                    const err = error as FetchBaseQueryError & {
                        data?: { message?: string };
                    };
                    alert(
                        `Error deleting daily production: ${err.data?.message || "An error occurred"
                        }`
                    );
                } else {
                    alert(
                        "An unknown error occurred while deleting daily production."
                    );
                }
            }
        }
    };

    const handleEdit = (dailyProduction: DailyProduction) => {
        setCurrentDailyProduction(dailyProduction);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setCurrentDailyProduction({
            item: "",
            quantityProduced: 0,
            timeProduced: "",
            remark: "",
        });
    };

    useEffect(() => {
        if (isError) {
            if ("data" in error) {
                const errorMessage =
                    (error.data as { message?: string })?.message ||
                    "Unknown error";
                alert(`Error fetching daily productions: ${errorMessage}`);
            } else {
                alert("Unknown error occurred");
            }
        }
    }, [isError, error]);

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-extrabold mb-6">
                IFISHI Y’IBYAKOZWE (Daily Production)
            </h1>

            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
                <input
                    type="text"
                    placeholder="Search daily productions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded shadow-sm w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow-sm transition"
                    onClick={() => {
                        setModalMode("create");
                        setIsModalOpen(true);
                        resetForm();
                    }}
                >
                    Add Daily Production
                </button>
            </div>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                    Time Produced
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                    Remark
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDailyProductions.length > 0 ? (
                                filteredDailyProductions.map(
                                    (dailyProduction: DailyProduction) => (
                                        <tr
                                            key={dailyProduction.id}
                                            className="hover:bg-gray-200"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                {dailyProduction.item}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                {dailyProduction.quantityProduced}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                {new Date(
                                                    dailyProduction.timeProduced
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                {dailyProduction.remark || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                                                        onClick={() =>
                                                            handleEdit(
                                                                dailyProduction
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                                                        onClick={() =>
                                                            handleDelete(
                                                                dailyProduction.id!
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-6 text-gray-500"
                                    >
                                        No daily productions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-5 text-center">
                            {modalMode === "create"
                                ? "Add New Daily Production"
                                : "Edit Daily Production"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="item"
                                placeholder="Item"
                                value={currentDailyProduction.item}
                                onChange={handleInputChange}
                                className="border border-gray-300 w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                            <input
                                type="number"
                                name="quantityProduced"
                                placeholder="Quantity Produced"
                                value={
                                    currentDailyProduction.quantityProduced
                                }
                                onChange={handleInputChange}
                                className="border border-gray-300 w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                            <input
                                type="datetime-local"
                                name="timeProduced"
                                value={currentDailyProduction.timeProduced}
                                onChange={handleInputChange}
                                className="border border-gray-300 w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                            <textarea
                                name="remark"
                                placeholder="Remark"
                                value={currentDailyProduction.remark}
                                onChange={handleInputChange}
                                className="border border-gray-300 w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition"
                                >
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

export default DailyProductionManagement;
