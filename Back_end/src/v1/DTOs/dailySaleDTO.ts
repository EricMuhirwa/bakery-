export interface DailySale {
    id?: string;
    item: string;
    openingStock: number;
    quantitySold: number;
    pricePerUnit: number;
    totalPrice: number;
    remainingStock?: number;
    saleDate?: string;
    userId?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
}

const DailySaleDTO = {
    createDailySaleDTO: (dailySale: DailySale) => ({
        item: dailySale.item,
        openingStock: dailySale.openingStock,
        quantitySold: dailySale.quantitySold,
        pricePerUnit: dailySale.pricePerUnit,
        totalPrice: dailySale.totalPrice,
        userId: dailySale.userId,
    }),
    getDailySaleDTO: (dailySale: any) => ({
        id: dailySale.id,
        item: dailySale.item,
        openingStock: dailySale.openingStock,
        quantitySold: dailySale.quantitySold,
        pricePerUnit: dailySale.pricePerUnit,
        totalPrice: dailySale.totalPrice,
        createdAt: dailySale.createdAt,
    }),
    updateDailySaleDTO: (dailySale: DailySale) => ({
        item: dailySale.item,
        openingStock: dailySale.openingStock,
        quantitySold: dailySale.quantitySold,
        pricePerUnit: dailySale.pricePerUnit,
        totalPrice: dailySale.totalPrice,
        userId: dailySale.userId,
    }),
};

export default DailySaleDTO;

