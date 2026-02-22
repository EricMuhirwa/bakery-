"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
    useDailySalesQuery,
    useCreateDailySaleMutation,
    useDeleteDailySaleMutation,
    useUpdateDailySaleMutation,
} from "@/lib/redux/slices/DailySalesSlice";

interface DailySale {
    id?: string;
    item: string;
    openingStock: number;
    quantitySold: number;
    pricePerUnit: number;
    totalPrice: number;
    remainingStock: number;
    saleDate: string;
}

interface DailySaleUpdateData {
    id: string;
    data: Omit<DailySale, "id">;
}

const DailySalesManagement: React.FC = () => {
    const { data: sessionData } = useSession();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [currentDailySale, setCurrentDailySale] = useState<DailySale>({
        item: "",
        openingStock: 0,
        quantitySold: 0,
        pricePerUnit: 0,
        totalPrice: 0,
        remainingStock: 0,
        saleDate: "",
    });

    const { data: dailySales = [], isLoading, refetch } =
        useDailySalesQuery({});

    const [createDailySale] = useCreateDailySaleMutation();
    const [updateDailySale] = useUpdateDailySaleMutation();
    const [deleteDailySale] = useDeleteDailySaleMutation();

    const dailySalesArray = Array.isArray(dailySales) ? dailySales : [];
    const filteredDailySales = dailySalesArray
        .filter((sale: DailySale) =>
            sale.item.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((sale: DailySale) =>
            selectedDate ? sale.saleDate === selectedDate : true
        )
        .sort(
            (a: DailySale, b: DailySale) =>
                new Date(b.saleDate).getTime() -
                new Date(a.saleDate).getTime()
        );

    // 🔥 AUTO FORMULAS
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        const numericFields = ["openingStock", "quantitySold", "pricePerUnit"];
        const updatedValue = numericFields.includes(name)
            ? parseFloat(value) || 0
            : value;

        setCurrentDailySale((prev) => {
            const updated = { ...prev, [name]: updatedValue };

            // Amafaranga
            updated.totalPrice =
                updated.quantitySold * updated.pricePerUnit;

            // Ibyasigaye
            updated.remainingStock =
                updated.openingStock - updated.quantitySold;

            return updated;
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (modalMode === "create") {
            await createDailySale({
                ...currentDailySale,
                userId: sessionData?.user?.id,
            }).unwrap();
        } else if (currentDailySale.id) {
            const updateData: DailySaleUpdateData = {
                id: currentDailySale.id,
                data: { ...currentDailySale },
            };
            await updateDailySale(updateData).unwrap();
        }

        setIsModalOpen(false);
        resetForm();
        refetch();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            await deleteDailySale(id).unwrap();
            refetch();
        }
    };

    const handleEdit = (sale: DailySale) => {
        setCurrentDailySale(sale);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setCurrentDailySale({
            item: "",
            openingStock: 0,
            quantitySold: 0,
            pricePerUnit: 0,
            totalPrice: 0,
            remainingStock: 0,
            saleDate: "",
        });
    };

    // 🔥 TOTAL SALES
    const totalSalesAmount = filteredDailySales.reduce(
        (sum: number, sale: DailySale) => sum + sale.totalPrice,
        0
    );

    // 🔥 EXPORT CSV
    const exportToCSV = () => {
        if (!filteredDailySales.length) {
            alert("No data to export.");
            return;
        }

        const headers = [
            "Date",
            "Item",
            "Opening Stock",
            "Quantity Sold",
            "Price Per Unit",
            "Total Price",
            "Remaining Stock",
        ];

        const rows = filteredDailySales.map((sale: DailySale) => [
            sale.saleDate,
            sale.item,
            sale.openingStock,
            sale.quantitySold,
            sale.pricePerUnit,
            sale.totalPrice,
            sale.remainingStock,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers, ...rows].map((e) => e.join(",")).join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `Daily_Sales_${selectedDate || "All"}.csv`;
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">
                IFISHI Y’IGURISHWA RYA BURI MUNSI
            </h1>

            <div className="flex gap-4 mb-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border px-3 py-2 rounded"
                />

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border px-3 py-2 rounded"
                />

                <button
                    onClick={() => {
                        setModalMode("create");
                        setIsModalOpen(true);
                        resetForm();
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Add Sale
                </button>

                <button
                    onClick={exportToCSV}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Export CSV
                </button>
            </div>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border px-4 py-2">No</th>
                                <th className="border px-4 py-2">Italiki</th>
                                <th className="border px-4 py-2">Ibicuruzwa</th>
                                <th className="border px-4 py-2">Opening</th>
                                <th className="border px-4 py-2">Ibyagurishijwe(kg,pcs)</th>
                                <th className="border px-4 py-2">P/unit</th>
                                <th className="border px-4 py-2">Total</th>
                                <th className="border px-4 py-2">Ibyasigaye</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDailySales.map((sale: DailySale, index: number) => (
                                <tr key={sale.id} className="text-center">
                                    <td className="border px-4 py-2">{index + 1}</td>
                                    <td className="border px-4 py-2">{sale.saleDate}</td>
                                    <td className="border px-4 py-2">{sale.item}</td>
                                    <td className="border px-4 py-2">{sale.openingStock}</td>
                                    <td className="border px-4 py-2">{sale.quantitySold}</td>
                                    <td className="border px-4 py-2">
                                        {sale.pricePerUnit}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {sale.totalPrice}
                                    </td>
                                    <td className="border px-4 py-2 font-bold text-green-600">
                                        {sale.remainingStock}
                                    </td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() => handleEdit(sale)}
                                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sale.id!)}
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr className="bg-gray-100 font-bold">
                                <td colSpan={6} className="border px-4 py-2 text-right">
                                    Amafaranga y&apos;Ibyagurishijwe byose:
                                </td>
                                <td className="border px-4 py-2">
                                    {totalSalesAmount}
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {modalMode === "create" ? "Add Sale" : "Edit Sale"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="date"
                                name="saleDate"
                                value={currentDailySale.saleDate}
                                onChange={handleInputChange}
                                className="border w-full mb-2 px-3 py-2 rounded"
                                required
                            />

                            <input
                                type="text"
                                name="item"
                                placeholder="Item"
                                value={currentDailySale.item}
                                onChange={handleInputChange}
                                className="border w-full mb-2 px-3 py-2 rounded"
                                required
                            />

                            <input
                                type="number"
                                name="openingStock"
                                placeholder="Opening Stock"
                                value={currentDailySale.openingStock}
                                onChange={handleInputChange}
                                className="border w-full mb-2 px-3 py-2 rounded"
                                required
                            />

                            <input
                                type="number"
                                name="quantitySold"
                                placeholder="Quantity Sold"
                                value={currentDailySale.quantitySold}
                                onChange={handleInputChange}
                                className="border w-full mb-2 px-3 py-2 rounded"
                                required
                            />

                            <input
                                type="number"
                                name="pricePerUnit"
                                placeholder="Price Per Unit"
                                value={currentDailySale.pricePerUnit}
                                onChange={handleInputChange}
                                className="border w-full mb-2 px-3 py-2 rounded"
                                required
                            />

                            <input
                                type="number"
                                value={currentDailySale.totalPrice}
                                readOnly
                                className="border w-full mb-2 px-3 py-2 rounded bg-gray-100"
                                placeholder="Total"
                            />

                            <input
                                type="number"
                                value={currentDailySale.remainingStock}
                                readOnly
                                className="border w-full mb-4 px-3 py-2 rounded bg-gray-100"
                                placeholder="Remaining"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailySalesManagement;
