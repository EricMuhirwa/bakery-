"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DailySaleDTO = {
    createDailySaleDTO: (dailySale) => ({
        item: dailySale.item,
        openingStock: dailySale.openingStock,
        quantitySold: dailySale.quantitySold,
        pricePerUnit: dailySale.pricePerUnit,
        totalPrice: dailySale.totalPrice,
        userId: dailySale.userId,
    }),
    getDailySaleDTO: (dailySale) => ({
        id: dailySale.id,
        item: dailySale.item,
        openingStock: dailySale.openingStock,
        quantitySold: dailySale.quantitySold,
        pricePerUnit: dailySale.pricePerUnit,
        totalPrice: dailySale.totalPrice,
        createdAt: dailySale.createdAt,
    }),
    updateDailySaleDTO: (dailySale) => ({
        item: dailySale.item,
        openingStock: dailySale.openingStock,
        quantitySold: dailySale.quantitySold,
        pricePerUnit: dailySale.pricePerUnit,
        totalPrice: dailySale.totalPrice,
        userId: dailySale.userId,
    }),
};
exports.default = DailySaleDTO;
//# sourceMappingURL=dailySaleDTO.js.map