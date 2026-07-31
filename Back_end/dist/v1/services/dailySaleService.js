"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dailySaleDTO_1 = __importDefault(require("../DTOs/dailySaleDTO"));
const database_1 = require("../config/database");
const dailySaleService = {
    createDailySale: async (dailySaleData) => {
        const dailySale = await database_1.prisma.dailySale.create({
            data: dailySaleDTO_1.default.createDailySaleDTO(dailySaleData)
        });
        return dailySaleDTO_1.default.getDailySaleDTO(dailySale);
    },
    getDailySales: async () => {
        const dailySales = await database_1.prisma.dailySale.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return dailySales.map(dailySaleDTO_1.default.getDailySaleDTO);
    },
    getDailySaleById: async (id) => {
        const dailySale = await database_1.prisma.dailySale.findUnique({
            where: { id }
        });
        return dailySale ? dailySaleDTO_1.default.getDailySaleDTO(dailySale) : null;
    },
    deleteDailySale: async (id) => {
        await database_1.prisma.dailySale.delete({ where: { id } });
    },
    updateDailySale: async (id, dailySaleData) => {
        const updatedDailySale = await database_1.prisma.dailySale.update({
            where: { id },
            data: dailySaleDTO_1.default.updateDailySaleDTO(dailySaleData)
        });
        return dailySaleDTO_1.default.getDailySaleDTO(updatedDailySale);
    }
};
exports.default = dailySaleService;
//# sourceMappingURL=dailySaleService.js.map