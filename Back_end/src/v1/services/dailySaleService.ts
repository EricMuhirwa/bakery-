import DailySaleDTO from '../DTOs/dailySaleDTO';
import { prisma as prismaClient } from '../config/database';

const dailySaleService = {
    createDailySale: async (dailySaleData: any): Promise<ReturnType<typeof DailySaleDTO.getDailySaleDTO>> => {
        const dailySale = await prismaClient.dailySale.create({ 
            data: DailySaleDTO.createDailySaleDTO(dailySaleData)
        });
        return DailySaleDTO.getDailySaleDTO(dailySale);
    },

    getDailySales: async (): Promise<ReturnType<typeof DailySaleDTO.getDailySaleDTO>[]> => {
        const dailySales = await prismaClient.dailySale.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return dailySales.map(DailySaleDTO.getDailySaleDTO);
    },

    getDailySaleById: async (id: string): Promise<ReturnType<typeof DailySaleDTO.getDailySaleDTO> | null> => {
        const dailySale = await prismaClient.dailySale.findUnique({
            where: { id }
        });
        return dailySale ? DailySaleDTO.getDailySaleDTO(dailySale) : null;
    },

    deleteDailySale: async (id: string): Promise<void> => {
        await prismaClient.dailySale.delete({ where: { id } });
    },

    updateDailySale: async (id: string, dailySaleData: any): Promise<ReturnType<typeof DailySaleDTO.getDailySaleDTO>> => {
        const updatedDailySale = await prismaClient.dailySale.update({
            where: { id },
            data: DailySaleDTO.updateDailySaleDTO(dailySaleData)
        });
        return DailySaleDTO.getDailySaleDTO(updatedDailySale);
    }
};

export default dailySaleService;

