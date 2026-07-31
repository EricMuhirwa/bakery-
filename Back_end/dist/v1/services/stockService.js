"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockService = void 0;
const stockDTO_1 = __importDefault(require("../DTOs/stockDTO"));
const database_1 = require("../config/database");
exports.stockService = {
    // Get all stock items
    getAllStockItems: async () => {
        const items = await database_1.prisma.stockItem.findMany({
            orderBy: { name: 'asc' },
        });
        return items.map(stockDTO_1.default.getStockItemDTO);
    },
    // Get stock item by ID
    getStockItemById: async (itemId) => {
        const item = await database_1.prisma.stockItem.findUnique({
            where: { id: itemId },
        });
        return item ? stockDTO_1.default.getStockItemDTO(item) : null;
    },
    // Create new stock item
    createStockItem: async (itemData) => {
        // Ensure currentStock has a default value if not provided
        const currentStock = itemData.currentStock ?? 0;
        const item = await database_1.prisma.stockItem.create({
            data: {
                name: itemData.name,
                category: itemData.category,
                currentStock: currentStock,
                unit: itemData.unit,
                minStock: itemData.minStock,
                maxStock: itemData.maxStock,
                reorderPoint: itemData.reorderPoint,
                supplier: itemData.supplier,
                costPerUnit: itemData.costPerUnit,
                lastRestocked: currentStock > 0 ? new Date() : null,
            },
        });
        return stockDTO_1.default.getStockItemDTO(item);
    },
    // Update stock item
    updateStockItem: async (itemId, itemData) => {
        const item = await database_1.prisma.stockItem.update({
            where: { id: itemId },
            data: {
                ...itemData,
                updatedAt: new Date(),
            },
        });
        return stockDTO_1.default.getStockItemDTO(item);
    },
    // Delete stock item
    deleteStockItem: async (itemId) => {
        await database_1.prisma.stockMovement.deleteMany({
            where: { itemId: itemId },
        });
        await database_1.prisma.stockItem.delete({
            where: { id: itemId },
        });
        return { message: 'Stock item deleted successfully' };
    },
    // Stock IN - Add stock
    stockIn: async (stockInData, userId) => {
        // Get current stock item
        const stockItem = await database_1.prisma.stockItem.findUnique({
            where: { id: stockInData.itemId },
        });
        if (!stockItem) {
            throw new Error('Stock item not found');
        }
        const previousStock = stockItem.currentStock;
        const newStock = previousStock + stockInData.quantity;
        // Update stock item
        const updatedItem = await database_1.prisma.stockItem.update({
            where: { id: stockInData.itemId },
            data: {
                currentStock: newStock,
                lastRestocked: new Date(),
                updatedAt: new Date(),
            },
        });
        // Create stock movement record
        const movement = await database_1.prisma.stockMovement.create({
            data: {
                itemId: stockInData.itemId,
                type: 'IN',
                quantity: stockInData.quantity,
                previousStock: previousStock,
                newStock: newStock,
                reference: stockInData.reference || `STOCK-IN-${Date.now()}`,
                userId: userId,
                reason: 'Purchase Order',
                notes: stockInData.notes,
                supplier: stockInData.supplier,
                batchNumber: stockInData.batchNumber,
                expiryDate: stockInData.expiryDate ? new Date(stockInData.expiryDate) : null,
                purchasePrice: stockInData.purchasePrice,
            },
            include: {
                item: true,
                user: true,
            },
        });
        return {
            item: stockDTO_1.default.getStockItemDTO(updatedItem),
            movement: stockDTO_1.default.getStockMovementDTO(movement, movement.item.name, movement.user?.email || undefined),
        };
    },
    // Stock OUT - Remove stock
    stockOut: async (stockOutData, userId) => {
        // Get current stock item
        const stockItem = await database_1.prisma.stockItem.findUnique({
            where: { id: stockOutData.itemId },
        });
        if (!stockItem) {
            throw new Error('Stock item not found');
        }
        if (stockItem.currentStock < stockOutData.quantity) {
            throw new Error('Insufficient stock available');
        }
        const previousStock = stockItem.currentStock;
        const newStock = previousStock - stockOutData.quantity;
        // Update stock item
        const updatedItem = await database_1.prisma.stockItem.update({
            where: { id: stockOutData.itemId },
            data: {
                currentStock: newStock,
                updatedAt: new Date(),
            },
        });
        // Create stock movement record
        const movement = await database_1.prisma.stockMovement.create({
            data: {
                itemId: stockOutData.itemId,
                type: 'OUT',
                quantity: stockOutData.quantity,
                previousStock: previousStock,
                newStock: newStock,
                reference: stockOutData.reference,
                userId: userId,
                reason: stockOutData.reason,
                notes: stockOutData.notes,
            },
            include: {
                item: true,
                user: true,
            },
        });
        return {
            item: stockDTO_1.default.getStockItemDTO(updatedItem),
            movement: stockDTO_1.default.getStockMovementDTO(movement, movement.item.name, movement.user?.email || undefined),
        };
    },
    // Get all stock movements with filters
    getStockMovements: async (filters) => {
        const where = {};
        if (filters?.itemId) {
            where.itemId = filters.itemId;
        }
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.dateFrom || filters?.dateTo) {
            where.date = {};
            if (filters.dateFrom) {
                where.date.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                dateTo.setHours(23, 59, 59, 999);
                where.date.lte = dateTo;
            }
        }
        if (filters?.search) {
            // MongoDB doesn't support case-insensitive search directly in Prisma
            // We'll filter in memory after fetching
            where.OR = [
                { reference: { contains: filters.search } },
                { reason: { contains: filters.search } },
            ];
        }
        let movements = await database_1.prisma.stockMovement.findMany({
            where,
            include: {
                item: true,
                user: true,
            },
            orderBy: { date: 'desc' },
        });
        // Filter by search term if provided (case-insensitive)
        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            movements = movements.filter((movement) => movement.reference.toLowerCase().includes(searchLower) ||
                movement.reason.toLowerCase().includes(searchLower) ||
                movement.item.name.toLowerCase().includes(searchLower) ||
                (movement.user?.email && movement.user.email.toLowerCase().includes(searchLower)));
        }
        return movements.map((movement) => stockDTO_1.default.getStockMovementDTO(movement, movement.item.name, movement.user?.email || undefined));
    },
    // Get stock movement by ID
    getStockMovementById: async (movementId) => {
        const movement = await database_1.prisma.stockMovement.findUnique({
            where: { id: movementId },
            include: {
                item: true,
                user: true,
            },
        });
        return movement
            ? stockDTO_1.default.getStockMovementDTO(movement, movement.item.name, movement.user?.email || undefined)
            : null;
    },
    // Get low stock items
    getLowStockItems: async () => {
        const items = await database_1.prisma.stockItem.findMany({
            orderBy: { currentStock: 'asc' },
        });
        // Filter items where currentStock < minStock
        const lowStockItems = items.filter(item => item.currentStock < item.minStock);
        return lowStockItems.map(stockDTO_1.default.getStockItemDTO);
    },
    // Get stock statistics
    getStockStatistics: async () => {
        const totalItems = await database_1.prisma.stockItem.count();
        // Get all items and filter for low stock
        const allItems = await database_1.prisma.stockItem.findMany();
        const lowStockItems = allItems.filter(item => item.currentStock < item.minStock).length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayMovements = await database_1.prisma.stockMovement.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        const stockInToday = todayMovements
            .filter((m) => m.type === 'IN')
            .reduce((sum, m) => sum + m.quantity, 0);
        const stockOutToday = todayMovements
            .filter((m) => m.type === 'OUT')
            .reduce((sum, m) => sum + m.quantity, 0);
        return {
            totalItems,
            lowStockItems,
            stockInToday,
            stockOutToday,
        };
    },
};
//# sourceMappingURL=stockService.js.map