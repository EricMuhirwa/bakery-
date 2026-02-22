"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  useRawMaterialsQuery,
  useCreateRawMaterialMutation,
  useDeleteRawMaterialMutation,
  useUpdateRawMaterialMutation,
} from "@/lib/redux/slices/RawMaterialSlice";

interface RawMaterial {
  id?: string;
  itemName: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  date: string;
  purchasedBy: string;
}

const RawMaterialManagement: React.FC = () => {
  const { data: sessionData } = useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentRawMaterial, setCurrentRawMaterial] = useState<RawMaterial>({
    itemName: "",
    unit: "",
    quantity: 0,
    pricePerUnit: 0,
    totalPrice: 0,
    date: "",
    purchasedBy: "",
  });

  const { data: rawMaterials = [], refetch } = useRawMaterialsQuery({});
  const [createRawMaterial] = useCreateRawMaterialMutation();
  const [updateRawMaterial] = useUpdateRawMaterialMutation();
  const [deleteRawMaterial] = useDeleteRawMaterialMutation();

  const rawMaterialsArray = Array.isArray(rawMaterials) ? rawMaterials : [];
  const filteredRawMaterials = rawMaterialsArray.filter(
    (item: RawMaterial) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.purchasedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentRawMaterial((prev) => {
      const updated = {
        ...prev,
        [name]:
          name === "quantity" || name === "pricePerUnit"
            ? parseFloat(value) || 0
            : value,
      };
      updated.totalPrice = updated.quantity * updated.pricePerUnit;
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await createRawMaterial({
          ...currentRawMaterial,
          userId: sessionData?.user?.id,
        }).unwrap();
      } else if (currentRawMaterial.id) {
        await updateRawMaterial({
          id: currentRawMaterial.id,
          data: currentRawMaterial,
        }).unwrap();
      }

      setIsModalOpen(false);
      setCurrentRawMaterial({
        itemName: "",
        unit: "",
        quantity: 0,
        pricePerUnit: 0,
        totalPrice: 0,
        date: "",
        purchasedBy: "",
      });
      refetch();
    } catch {
      alert("Error saving raw material");
    }
  };

  const handleEdit = (item: RawMaterial) => {
    setCurrentRawMaterial(item);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteRawMaterial(id).unwrap();
      refetch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        IFISHI Y&apos;IBYO TWARANGUYE (RAW MATERIALS PURCHASE FORM)
      </h1>

      <div className="flex justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-1/3"
        />
        <button
          onClick={() => {
            setModalMode("create");
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Raw Material
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200 text-gray-700">
            <tr className="text-center">
              <th className="px-4 py-3 border">No</th>
              <th className="px-4 py-3 border text-left">
                Izina ry’igicuruzwa
              </th>
              <th className="px-4 py-3 border">Igipimo (kg/l)</th>
              <th className="px-4 py-3 border">Ingano yaguzwe</th>
              <th className="px-4 py-3 border">Igiciro/unit</th>
              <th className="px-4 py-3 border">Igiciro cyose</th>
              <th className="px-4 py-3 border">Uwaguzwe (Purchased by)</th>
              <th className="px-4 py-3 border">Itariki</th>
              <th className="px-4 py-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRawMaterials.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  No data available
                </td>
              </tr>
            )}

            {filteredRawMaterials.map((item, index) => (
              <tr
                key={item.id}
                className={`text-center ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
              >
                <td className="px-4 py-3 border">{index + 1}</td>

                {/* Only this column left aligned */}
                <td className="px-4 py-3 border text-left font-medium">
                  {item.itemName}
                </td>

                <td className="px-4 py-3 border">{item.unit}</td>
                <td className="px-4 py-3 border">{item.quantity}</td>
                <td className="px-4 py-3 border">{item.pricePerUnit}</td>
                <td className="px-4 py-3 border font-semibold">
                  {item.totalPrice}
                </td>
                <td className="px-4 py-3 border">{item.purchasedBy || "-"}</td>
                <td className="px-4 py-3 border">
                  {item.date
                    ? new Date(item.date).toLocaleDateString()
                    : "N/A"}
                </td>

                <td className="px-4 py-3 border">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === "create"
                ? "Add Raw Material"
                : "Edit Raw Material"}
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="itemName"
                placeholder="Izina ry’igicuruzwa"
                value={currentRawMaterial.itemName}
                onChange={handleInputChange}
                className="border w-full mb-2 px-3 py-2 rounded"
                required
              />

              <input
                type="text"
                name="purchasedBy"
                placeholder="Uwaguzwe (Purchased by)"
                value={currentRawMaterial.purchasedBy}
                onChange={handleInputChange}
                className="border w-full mb-2 px-3 py-2 rounded"
                required
              />

              <input
                type="date"
                name="date"
                value={currentRawMaterial.date}
                onChange={handleInputChange}
                className="border w-full mb-2 px-3 py-2 rounded"
                required
              />

              <input
                type="text"
                name="unit"
                placeholder="Igipimo (kg/l)"
                value={currentRawMaterial.unit}
                onChange={handleInputChange}
                className="border w-full mb-2 px-3 py-2 rounded"
                required
              />

              <input
                type="number"
                name="quantity"
                placeholder="Ingano yaguzwe"
                value={currentRawMaterial.quantity}
                onChange={handleInputChange}
                className="border w-full mb-2 px-3 py-2 rounded"
                required
              />

              <input
                type="number"
                name="pricePerUnit"
                placeholder="Igiciro/unit"
                value={currentRawMaterial.pricePerUnit}
                onChange={handleInputChange}
                className="border w-full mb-2 px-3 py-2 rounded"
                required
              />

              <input
                type="number"
                value={currentRawMaterial.totalPrice}
                readOnly
                className="border w-full mb-4 px-3 py-2 rounded bg-gray-100"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
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

export default RawMaterialManagement;
