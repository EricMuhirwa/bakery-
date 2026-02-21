export interface RawMaterial {
    id?: string;
    itemName: string;
    unit: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    date: Date | string;
    purchasedBy: string;
    userId?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
}

const ALLOWED_CREATE_FIELDS = ['itemName', 'unit', 'quantity', 'pricePerUnit', 'totalPrice', 'date', 'purchasedBy', 'userId'] as const;
const ALLOWED_UPDATE_FIELDS = ['itemName', 'unit', 'quantity', 'pricePerUnit', 'totalPrice', 'date', 'purchasedBy'] as const;

const RawMaterialDTO = {
    sanitizeCreateData: (data: any): Record<string, unknown> => {
        const sanitized: Record<string, unknown> = {};
        for (const key of ALLOWED_CREATE_FIELDS) {
            if (data[key] !== undefined && data[key] !== null) {
                sanitized[key] = data[key];
            }
        }
        return sanitized;
    },
    sanitizeUpdateData: (data: any): Record<string, unknown> => {
        const sanitized: Record<string, unknown> = {};
        for (const key of ALLOWED_UPDATE_FIELDS) {
            if (data[key] !== undefined) {
                sanitized[key] = data[key];
            }
        }
        return sanitized;
    },
    createRawMaterialDTO: (rawMaterial: RawMaterial) => ({
        itemName: rawMaterial.itemName,
        unit: rawMaterial.unit,
        quantity: rawMaterial.quantity,
        pricePerUnit: rawMaterial.pricePerUnit,
        totalPrice: rawMaterial.totalPrice,
        date: rawMaterial.date,
        purchasedBy: rawMaterial.purchasedBy,
        userId: rawMaterial.userId,
    }),
    getRawMaterialDTO: (rawMaterial: Omit<RawMaterial, 'unit'> & { unit?: string | null }) => ({
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

export default RawMaterialDTO;

