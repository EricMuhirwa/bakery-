import stockDTO from '../DTOs/stockDTO';
import { prisma } from '../config/database';
import { StockCategory } from '@prisma/client';

// Define types inline if stockDTO doesn't export them
interface CreateStockItemDTO {
  name: string;
  category: StockCategory;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  supplier: string;
  costPerUnit: number;
}

interface CreateStockInDTO {
  itemId: string;
  quantity: number;
  reference?: string;
  notes?: string;
  supplier?: string;
  batchNumber?: string;
  expiryDate?: string;
  purchasePrice?: number;
}

interface CreateStockOutDTO {
  itemId: string;
  quantity: number;
  reference: string;
  reason: string;
  notes?: string;
}

export const stockService = {
  // Get all stock items
  getAllStockItems: async () => {
    const items = await prisma.stockItem.findMany({
      orderBy: { name: 'asc' },
    });
    return items.map(stockDTO.getStockItemDTO);
  },

  // Get stock item by ID
  getStockItemById: async (itemId: string) => {
    const item = await prisma.stockItem.findUnique({
      where: { id: itemId },
    });
    return item ? stockDTO.getStockItemDTO(item) : null;
  },

  // Create new stock item
  createStockItem: async (itemData: CreateStockItemDTO) => {
    // Ensure currentStock has a default value if not provided
    const currentStock = itemData.currentStock ?? 0;
    
    const newItem = await prisma.$transaction(async (tx) => {
      const item = await tx.stockItem.create({
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

      if (currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            itemId: item.id,
            type: 'IN',
            quantity: currentStock,
            previousStock: 0,
            newStock: currentStock,
            reference: `INIT-STOCK-${Date.now()}`,
            reason: 'Initial Stock',
            notes: 'Added during item creation',
            supplier: itemData.supplier,
            purchasePrice: itemData.costPerUnit,
          },
        });
      }
      return item;
    });

    return stockDTO.getStockItemDTO(newItem);
  },

  // Update stock item
  updateStockItem: async (itemId: string, itemData: Partial<CreateStockItemDTO>) => {
    // Exclude currentStock to prevent direct updates bypassing movements
    const { currentStock, ...safeData } = itemData;

    const item = await prisma.stockItem.update({
      where: { id: itemId },
      data: {
        ...safeData,
        updatedAt: new Date(),
      },
    });
    return stockDTO.getStockItemDTO(item);
  },

  // Delete stock item
  deleteStockItem: async (itemId: string) => {
    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({
        where: { itemId: itemId },
      });
      await tx.stockItem.delete({
        where: { id: itemId },
      });
    });
    return { message: 'Stock item deleted successfully' };
  },

  // Stock IN - Add stock
  stockIn: async (stockInData: CreateStockInDTO, userId?: string) => {
    const result = await prisma.$transaction(async (tx) => {
      // Get current stock item
      const stockItem = await tx.stockItem.findUnique({
        where: { id: stockInData.itemId },
      });

      if (!stockItem) {
        throw new Error('Stock item not found');
      }

      const previousStock = stockItem.currentStock;
      const newStock = previousStock + stockInData.quantity;

      // Update stock item
      const updatedItem = await tx.stockItem.update({
        where: { id: stockInData.itemId },
        data: {
          currentStock: newStock,
          lastRestocked: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create stock movement record
      const movement = await tx.stockMovement.create({
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

      return { updatedItem, movement };
    });

    return {
      item: stockDTO.getStockItemDTO(result.updatedItem),
      movement: stockDTO.getStockMovementDTO(
        result.movement,
        result.movement.item.name,
        result.movement.user?.email || undefined
      ),
    };
  },

  // Stock OUT - Remove stock
  stockOut: async (stockOutData: CreateStockOutDTO, userId?: string) => {
    const result = await prisma.$transaction(async (tx) => {
      // Get current stock item
      const stockItem = await tx.stockItem.findUnique({
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
      const updatedItem = await tx.stockItem.update({
        where: { id: stockOutData.itemId },
        data: {
          currentStock: newStock,
          updatedAt: new Date(),
        },
      });

      // Create stock movement record
      const movement = await tx.stockMovement.create({
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

      return { updatedItem, movement };
    });

    return {
      item: stockDTO.getStockItemDTO(result.updatedItem),
      movement: stockDTO.getStockMovementDTO(
        result.movement,
        result.movement.item.name,
        result.movement.user?.email || undefined
      ),
    };
  },

  // Get all stock movements with filters
  getStockMovements: async (filters?: {
    itemId?: string;
    type?: 'IN' | 'OUT';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => {
    const where: any = {};

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

    let movements = await prisma.stockMovement.findMany({
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
      movements = movements.filter(
        (movement) =>
          movement.reference.toLowerCase().includes(searchLower) ||
          movement.reason.toLowerCase().includes(searchLower) ||
          movement.item.name.toLowerCase().includes(searchLower) ||
          (movement.user?.email && movement.user.email.toLowerCase().includes(searchLower))
      );
    }

    return movements.map((movement) =>
      stockDTO.getStockMovementDTO(
        movement,
        movement.item.name,
        movement.user?.email || undefined
      )
    );
  },

  // Get stock movement by ID
  getStockMovementById: async (movementId: string) => {
    const movement = await prisma.stockMovement.findUnique({
      where: { id: movementId },
      include: {
        item: true,
        user: true,
      },
    });

    return movement
      ? stockDTO.getStockMovementDTO(
          movement,
          movement.item.name,
          movement.user?.email || undefined
        )
      : null;
  },

  // Get low stock items
  getLowStockItems: async () => {
    const items = await prisma.stockItem.findMany({
      orderBy: { currentStock: 'asc' },
    });
    // Filter items where currentStock < minStock
    const lowStockItems = items.filter(item => item.currentStock < item.minStock);
    return lowStockItems.map(stockDTO.getStockItemDTO);
  },

  // Get stock statistics
  getStockStatistics: async () => {
    const totalItems = await prisma.stockItem.count();
    
    // Get all items and filter for low stock
    const allItems = await prisma.stockItem.findMany();
    const lowStockItems = allItems.filter(item => item.currentStock < item.minStock).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMovements = await prisma.stockMovement.findMany({
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