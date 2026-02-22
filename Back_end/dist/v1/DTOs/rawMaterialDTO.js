"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ALLOWED_CREATE_FIELDS = ['itemName', 'unit', 'quantity', 'pricePerUnit', 'totalPrice', 'date', 'purchasedBy', 'userId'];
const ALLOWED_UPDATE_FIELDS = ['itemName', 'unit', 'quantity', 'pricePerUnit', 'totalPrice', 'date', 'purchasedBy'];
const RawMaterialDTO = {
    sanitizeCreateData: (data) => {
        const sanitized = {};
        for (const key of ALLOWED_CREATE_FIELDS) {
            if (data[key] !== undefined && data[key] !== null) {
                sanitized[key] = data[key];
            }
        }
        return sanitized;
    },
    sanitizeUpdateData: (data) => {
        const sanitized = {};
        for (const key of ALLOWED_UPDATE_FIELDS) {
            if (data[key] !== undefined) {
                sanitized[key] = data[key];
            }
        }
        return sanitized;
    },
    createRawMaterialDTO: (rawMaterial) => ({
        itemName: rawMaterial.itemName,
        unit: rawMaterial.unit,
        quantity: rawMaterial.quantity,
        pricePerUnit: rawMaterial.pricePerUnit,
        totalPrice: rawMaterial.totalPrice,
        date: rawMaterial.date,
        purchasedBy: rawMaterial.purchasedBy,
        userId: rawMaterial.userId,
    }),
    getRawMaterialDTO: (rawMaterial) => ({
        id: rawMaterial.id,
        itemName: rawMaterial.itemName,
        unit: rawMaterial.unit ?? '',
        quantity: rawMaterial.quantity,
        pricePerUnit: rawMaterial.pricePerUnit,
        totalPrice: rawMaterial.totalPrice,
        date: rawMaterial.date,
        purchasedBy: rawMaterial.purchasedBy,
        createdAt: rawMaterial.createdAt,
    }),
};
exports.default = RawMaterialDTO;
//# sourceMappingURL=rawMaterialDTO.js.map