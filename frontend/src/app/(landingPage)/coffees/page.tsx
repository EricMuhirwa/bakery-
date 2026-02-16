"use client";
import Image from "next/image";
import Link from "next/link";
import { useCoffeesQuery } from "../../../lib/redux/slices/CoffeeSlice";
import { useState } from "react";

interface Coffee {
    id: string;
    image?: string;
    title: string;
    price: number;
}

const CoffeesPage: React.FC = () => {
    const { data: coffees, isLoading, isError } = useCoffeesQuery({});
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 16; // 16 items per page

    if (isLoading) {
        return <div className="text-center py-12 mt-32">Loading coffees...</div>;
    }

    if (isError) {
        return <div className="text-center py-12 mt-32 text-red-500">Error loading coffees.</div>;
    }

    // Pagination logic
    const pageCount = Math.ceil((coffees?.length || 0) / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentCoffees = coffees?.slice(offset, offset + itemsPerPage) || [];


    return (
        <section className="pt-32 pb-8 bg-gray-100">
            <div className="container mx-auto px-6">
                {/* Go Back Button */}
                <div className="mb-6">
                    <Link href="/">
                        <button className="bg-black text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all hover:bg-gray-800">
                            Go Back
                        </button>
                    </Link>
                </div>

                {/* Coffee Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentCoffees.map((coffee: Coffee) => (
                        <Link key={coffee.id} href={`/coffees/${coffee.id}`}>
                            <div className="bg-white shadow-lg p-4 rounded-lg transform transition-all hover:scale-105 cursor-pointer">
                                <div className="relative w-full h-64">
                                    <Image
                                        src={coffee.image || "/images/default-coffee.jpg"}
                                        alt={coffee.title}
                                        fill
                                        className="rounded-md object-cover"
                                        unoptimized={!coffee.image?.startsWith("/")}
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-800">{coffee.title}</h3>
                                <p className="text-gray-600">RWF {coffee.price.toFixed(2)}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 mb-4 flex justify-center">
                    <nav className="inline-flex rounded-md shadow-sm">
                        {Array.from({ length: pageCount }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index)}
                                className={`px-4 py-2 text-sm font-medium ${currentPage === index
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    } border border-gray-300 rounded-md mx-1`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </section>
    );
};

export default CoffeesPage;