'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    Package,
    Search,
    Download,
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    User,
    FileText,
    X,
    ChevronDown,
    ChevronUp,
    Loader2,
    Coffee,
    PlusCircle
} from 'lucide-react';
import {
    useGetAllStockItemsQuery,
    useCreateStockItemMutation,
    useStockInMutation,
    useStockOutMutation,
    useGetStockMovementsQuery,
    useGetLowStockItemsQuery,
    useGetStockStatisticsQuery,
} from '@/lib/redux/slices/StockSlice';
import { useCoffeesQuery } from "@/lib/redux/slices/CoffeeSlice";
import { usePaymentsQuery } from '@/lib/redux/slices/PaymentSlice';
import { useBoughtSubscriptionQuery } from '@/lib/redux/slices/subscribersSlice';

// Types
interface StockItem {
    id: string;
    name: string;
    category: 'Ingredients' | 'Products' | 'Packaging';
    currentStock: number;
    unit: string;
    minStock: number;
    maxStock: number;
    lastRestocked: string | null;
    supplier: string;
    costPerUnit: number;
    reorderPoint: number;
    coffeeProductId?: string;
    sellingPrice?: number;
}

interface StockMovement {
    id: string;
    itemId: string;
    itemName: string;
    type: 'IN' | 'OUT';
    quantity: number;
    previousStock: number;
    newStock: number;
    date: string;
    reference: string;
    userEmail?: string;
    reason: string;
    notes?: string;
    supplier?: string;
    batchNumber?: string;
    expiryDate?: string;
}

interface StockInFormData {
    itemId: string;
    quantity: number;
    supplier: string;
    batchNumber: string;
    expiryDate: string;
    purchasePrice: number;
    notes: string;
    reference?: string;
}

interface StockOutFormData {
    itemId: string;
    quantity: number;
    reason: string;
    reference: string;
    notes: string;
}



interface CoffeeItem {
    id: string;
    title: string;
    price: number;
    description?: string;
    image?: string;
    createdAt: string;
}

interface CreateStockItemPayload {
    name: string;
    category: 'Products';
    unit: string;
    minStock: number;
    maxStock: number;
    supplier: string;
    costPerUnit: number;
    reorderPoint: number;
    coffeeProductId: string;
    sellingPrice: number;
    initialStock?: number;
}



const StockManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMovementType, setFilterMovementType] = useState<string>('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showStockInModal, setShowStockInModal] = useState(false);
    const [showStockOutModal, setShowStockOutModal] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const [isCreatingStockItem, setIsCreatingStockItem] = useState(false);
    const [, setSelectedCoffeeProduct] = useState<CoffeeItem | null>(null);
    const [processingCoffeeId, setProcessingCoffeeId] = useState<string | null>(null);
    const [manualRefreshTrigger, setManualRefreshTrigger] = useState(0);

    // RTK Query Hooks
    const {
        data: stockItemsData,
        isLoading: loadingItems,
        refetch: refetchStockItems,
        isFetching: isFetchingStockItems
    } = useGetAllStockItemsQuery({});

    useGetLowStockItemsQuery({});
    const { isLoading: loadingStats } = useGetStockStatisticsQuery({});

    // Coffee Items Query
    const { data: coffeeItemsData, isLoading: loadingCoffees } = useCoffeesQuery({});

    // Payments and Subscriptions Queries
    const { isLoading: loadingPayments } = usePaymentsQuery({});
    const { isLoading: loadingSubscriptions } = useBoughtSubscriptionQuery({});

    // Mutations
    const [stockIn, { isLoading: isStockingIn }] = useStockInMutation();
    const [stockOut, { isLoading: isStockingOut }] = useStockOutMutation();
    const [createStockItem] = useCreateStockItemMutation();

    // Safely handle non-array responses
    const stockItems = useMemo(() => {
        return Array.isArray(stockItemsData) ? stockItemsData : [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stockItemsData, manualRefreshTrigger]); // Add manualRefreshTrigger to force re-render


    const coffeeItems = useMemo(() => Array.isArray(coffeeItemsData) ? coffeeItemsData : [], [coffeeItemsData]);

    // Build a map of coffee product IDs to stock items
    const stockItemMap = useMemo(() => {
        const map = new Map<string, StockItem>();
        stockItems.forEach((item: StockItem) => {
            if (item.coffeeProductId) {
                map.set(item.coffeeProductId, item);
            }
        });
        return map;
    }, [stockItems]);

    // Identify coffee products that are not yet in stock system
    const missingStockItems = useMemo(() => {
        return coffeeItems.filter(coffee => !stockItemMap.has(coffee.id));
    }, [coffeeItems, stockItemMap]);


    // Build filters for movements query
    const movementFilters = useMemo(() => {
        const filters: Record<string, string> = {};
        if (filterMovementType !== 'All') filters.type = filterMovementType;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        if (searchTerm) filters.search = searchTerm;
        return filters;
    }, [filterMovementType, dateFrom, dateTo, searchTerm]);

    const { data: stockMovementsData, isLoading: loadingMovements } = useGetStockMovementsQuery(movementFilters);
    const stockMovements = useMemo(() => Array.isArray(stockMovementsData) ? stockMovementsData : [], [stockMovementsData]);

    // Form States
    const [stockInForm, setStockInForm] = useState<StockInFormData>({
        itemId: '',
        quantity: 0,
        supplier: '',
        batchNumber: '',
        expiryDate: '',
        purchasePrice: 0,
        notes: '',
        reference: ''
    });

    const [stockOutForm, setStockOutForm] = useState<StockOutFormData>({
        itemId: '',
        quantity: 0,
        reason: 'Sale',
        reference: '',
        notes: ''
    });

    // Reset forms when modals close
    useEffect(() => {
        if (!showStockInModal) {
            setStockInForm({
                itemId: '',
                quantity: 0,
                supplier: '',
                batchNumber: '',
                expiryDate: '',
                purchasePrice: 0,
                notes: '',
                reference: ''
            });
        }
    }, [showStockInModal]);

    useEffect(() => {
        if (!showStockOutModal) {
            setStockOutForm({
                itemId: '',
                quantity: 0,
                reason: 'Sale',
                reference: '',
                notes: ''
            });
        }
    }, [showStockOutModal]);

    // Handle creating a stock item from coffee product
    const handleCreateStockItem = useCallback(async (coffee: CoffeeItem) => {
        try {
            setProcessingCoffeeId(coffee.id);
            setIsCreatingStockItem(true);

            const payload: CreateStockItemPayload = {
                name: coffee.title,
                category: 'Products',
                unit: 'piece',
                minStock: 10,
                maxStock: 100,
                supplier: 'Coffee Supplier',
                costPerUnit: coffee.price * 0.6,
                reorderPoint: 20,
                coffeeProductId: coffee.id,
                sellingPrice: coffee.price,
                initialStock: 0
            };

            const result = await createStockItem(payload).unwrap();

            // Refetch stock items to update the list
            await refetchStockItems();

            // Force a manual refresh of the stock items memo
            setManualRefreshTrigger(prev => prev + 1);

            // Auto-select the newly created item in the form if modal is open
            if (showStockInModal) {
                setStockInForm(prev => ({ ...prev, itemId: result.id }));
            }
            if (showStockOutModal) {
                setStockOutForm(prev => ({ ...prev, itemId: result.id }));
            }

            alert(`Stock item "${coffee.title}" created successfully!`);
        } catch (error) {
            console.error('Failed to create stock item:', error);
            alert('Failed to create stock item. Please try again.');
        } finally {
            setIsCreatingStockItem(false);
            setProcessingCoffeeId(null);
            setSelectedCoffeeProduct(null);
        }
    }, [createStockItem, refetchStockItems, showStockInModal, showStockOutModal]);

    // Handle Stock IN
    const handleStockIn = useCallback(async () => {
        if (!stockInForm.itemId || stockInForm.quantity <= 0) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await stockIn({
                itemId: stockInForm.itemId,
                quantity: stockInForm.quantity,
                supplier: stockInForm.supplier,
                batchNumber: stockInForm.batchNumber,
                expiryDate: stockInForm.expiryDate,
                purchasePrice: stockInForm.purchasePrice,
                notes: stockInForm.notes,
                reference: stockInForm.reference
            }).unwrap();

            setShowStockInModal(false);
            alert('Stock received successfully!');

            // Refetch to update UI
            await refetchStockItems();
            setManualRefreshTrigger(prev => prev + 1);
        } catch (error: unknown) {
            console.error('Stock IN error:', error);
            alert('Failed to receive stock. Please ensure the item exists in stock system.');
        }
    }, [stockIn, stockInForm, refetchStockItems]);

    // Handle Stock OUT
    const handleStockOut = useCallback(async () => {
        if (!stockOutForm.itemId || stockOutForm.quantity <= 0 || !stockOutForm.reference) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await stockOut({
                itemId: stockOutForm.itemId,
                quantity: stockOutForm.quantity,
                reason: stockOutForm.reason,
                reference: stockOutForm.reference,
                notes: stockOutForm.notes
            }).unwrap();

            setShowStockOutModal(false);
            alert('Stock issued successfully!');

            // Refetch to update UI
            await refetchStockItems();
            setManualRefreshTrigger(prev => prev + 1);
        } catch (error: unknown) {
            console.error('Stock OUT error:', error);
            alert('Failed to issue stock. Please ensure you have sufficient stock.');
        }
    }, [stockOut, stockOutForm, refetchStockItems]);

    const toggleRowExpand = useCallback((id: string) => {
        setExpandedRows(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(id)) {
                newExpanded.delete(id);
            } else {
                newExpanded.add(id);
            }
            return newExpanded;
        });
    }, []);

    const exportToCSV = useCallback(() => {
        if (!stockMovements.length) {
            alert('No data to export');
            return;
        }

        const headers = ['Date', 'Item', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Reference', 'User', 'Reason'];
        const csvData = stockMovements.map((m: StockMovement) => [
            m.date,
            m.itemName,
            m.type,
            m.quantity,
            m.previousStock,
            m.newStock,
            m.reference,
            m.userEmail || 'N/A',
            m.reason
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map((row: unknown[]) => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }, [stockMovements]);

    const formatDate = useCallback((dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }, []);

    const formatTime = useCallback((dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }, []);

    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }, []);



    // Debug: Log stock items to verify they're being loaded
    useEffect(() => {
        console.log('Stock Items Updated:', stockItems);
    }, [stockItems]);

    // Loading state
    if (loadingItems || loadingStats || loadingPayments || loadingSubscriptions || loadingCoffees) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Package className="w-8 h-8 text-orange-600" />
                                All our Stock Management                            </h1>
                            <p className="text-gray-600 mt-1">Complete inventory tracking with revenue analytics</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowStockInModal(true)}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
                            >
                                <ArrowDownCircle className="w-5 h-5" />
                                Stock IN
                            </button>
                            <button
                                onClick={() => setShowStockOutModal(true)}
                                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
                            >
                                <ArrowUpCircle className="w-5 h-5" />
                                Stock OUT
                            </button>
                        </div>
                    </div>
                </div>





                {/* Coffee Products Sync Status */}
                {missingStockItems.length > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-600 p-3 rounded-lg">
                                    <Coffee className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">CEBK Ltd Products Need Setup</h3>
                                    <p className="text-sm text-gray-600">
                                        {missingStockItems.length} coffee product{missingStockItems.length > 1 ? 's' : ''} need to be added to stock system
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Click to add to inventory</p>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-orange-200 pt-4">
                            <div className="flex flex-wrap gap-3">
                                {missingStockItems.slice(0, 5).map((coffee) => (
                                    <div
                                        key={coffee.id}
                                        className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3 flex-1 min-w-[250px]"
                                    >
                                        {coffee.image && (
                                            <Image
                                                src={coffee.image}
                                                alt={coffee.title}
                                                className="w-12 h-12 object-cover rounded-lg"
                                                width={48}
                                                height={48}
                                                priority={false}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{coffee.title}</p>
                                            <p className="text-sm text-gray-600"></p>
                                        </div>
                                        <button
                                            onClick={() => handleCreateStockItem(coffee)}
                                            disabled={isCreatingStockItem && processingCoffeeId === coffee.id}
                                            className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {isCreatingStockItem && processingCoffeeId === coffee.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <PlusCircle className="w-4 h-4" />
                                            )}
                                            Add to Stock
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {missingStockItems.length > 5 && (
                                <p className="text-sm text-gray-600 mt-3">
                                    +{missingStockItems.length - 5} more  products
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Stock Movements History */}
                <div className="bg-white rounded-xl shadow-md">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <History className="w-6 h-6 text-orange-600" />
                            Stock Movement History
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">Track all incoming and outgoing inventory transactions</p>
                    </div>

                    {/* Filters */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-2 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by item, reference, or user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <select
                                title="Filter by movement type"
                                value={filterMovementType}
                                onChange={(e) => setFilterMovementType(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                aria-label="Filter movements by type"
                            >
                                <option value="All">All Movements</option>
                                <option value="IN">Stock IN Only</option>
                                <option value="OUT">Stock OUT Only</option>
                            </select>

                            <input
                                type="date"
                                title="Start date for filtering"
                                placeholder="From date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                aria-label="Filter movements from date"
                            />

                            <input
                                type="date"
                                title="End date for filtering"
                                placeholder="To date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                aria-label="Filter movements to date"
                            />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-900">{stockMovements.length}</span> movements
                            </p>
                            <button
                                onClick={exportToCSV}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Movements Table */}
                    <div className="overflow-x-auto">
                        {loadingMovements ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading movements...</p>
                            </div>
                        ) : stockMovements.length === 0 ? (
                            <div className="text-center py-12">
                                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No movements found</h3>
                                <p className="text-gray-600">Try adjusting your search filters</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Item</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Stock Change</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stockMovements.map((movement: StockMovement) => (
                                        <React.Fragment key={movement.id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{formatDate(movement.date)}</span>
                                                        <span className="text-xs text-gray-500">{formatTime(movement.date)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{movement.itemName}</div>
                                                    <div className="text-xs text-gray-500">{movement.reason}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${movement.type === 'IN'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {movement.type === 'IN' ? (
                                                            <><ArrowDownCircle className="w-3 h-3" /> IN</>
                                                        ) : (
                                                            <><ArrowUpCircle className="w-3 h-3" /> OUT</>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-bold text-lg ${movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-9">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500">{movement.previousStock}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="font-semibold text-gray-900">{movement.newStock}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900 font-mono">{movement.reference}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-orange-600" />
                                                        </div>
                                                        <span className="text-sm text-gray-900">{movement.userEmail || 'System'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleRowExpand(movement.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        {expandedRows.has(movement.id) ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>

                                            {expandedRows.has(movement.id) && (
                                                <tr className="bg-blue-50">
                                                    <td colSpan={8} className="px-6 py-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Additional Details</h4>
                                                                {movement.supplier && (
                                                                    <p className="text-sm text-gray-600 mb-1">
                                                                        <span className="font-medium">Supplier:</span> {movement.supplier}
                                                                    </p>
                                                                )}
                                                                {movement.batchNumber && (
                                                                    <p className="text-sm text-gray-600 mb-1">
                                                                        <span className="font-medium">Batch #:</span> {movement.batchNumber}
                                                                    </p>
                                                                )}
                                                                {movement.expiryDate && (
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium">Expiry:</span> {formatDate(movement.expiryDate)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {movement.notes && (
                                                                <div className="md:col-span-2">
                                                                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Notes</h4>
                                                                    <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                                                                        {movement.notes}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Stock IN Modal */}
            {showStockInModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <ArrowDownCircle className="w-6 h-6 text-green-600" />
                                    Receive Stock
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">Record incoming stock from suppliers</p>
                            </div>
                            <button
                                onClick={() => setShowStockInModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Close receive stock modal"
                                title="Close modal"
                            >
                                <X className="w-6 h-6 text-green-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                                        Select Item *
                                    </label>
                                    <select
                                        key={manualRefreshTrigger} // Force re-render when refresh triggers
                                        value={stockInForm.itemId}
                                        onChange={(e) => setStockInForm({ ...stockInForm, itemId: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                        aria-label="Select item to receive"
                                        title="Select an item from inventory"
                                    >
                                        <option value="">Choose an item...</option>
                                        {stockItems && stockItems.length > 0 ? (
                                            stockItems.map((item: StockItem) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name} - Stock: {item.currentStock} {item.unit}
                                                    {item.sellingPrice ? ` - Sell: ${formatCurrency(item.sellingPrice)}` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No stock items available</option>
                                        )}
                                    </select>
                                    {isFetchingStockItems && (
                                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Updating items...
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={stockInForm.quantity || ''}
                                        onChange={(e) => setStockInForm({ ...stockInForm, quantity: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Enter quantity"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Supplier *
                                    </label>
                                    <input
                                        type="text"
                                        value={stockInForm.supplier}
                                        onChange={(e) => setStockInForm({ ...stockInForm, supplier: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Supplier name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Reference Number
                                    </label>
                                    <input
                                        type="text"
                                        value={stockInForm.reference}
                                        onChange={(e) => setStockInForm({ ...stockInForm, reference: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., PO-2025-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Batch Number
                                    </label>
                                    <input
                                        type="text"
                                        value={stockInForm.batchNumber}
                                        onChange={(e) => setStockInForm({ ...stockInForm, batchNumber: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., BATCH-2025-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        title="Set expiry date"
                                        value={stockInForm.expiryDate}
                                        onChange={(e) => setStockInForm({ ...stockInForm, expiryDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        aria-label="Item expiry date"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Purchase Price per Unit
                                    </label>
                                    <input
                                        type="number"
                                        title="Enter purchase price per unit"
                                        value={stockInForm.purchasePrice || ''}
                                        onChange={(e) => setStockInForm({ ...stockInForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="0.00"
                                        aria-label="Purchase price per unit"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={stockInForm.notes}
                                        onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Additional notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowStockInModal(false)}
                                    disabled={isStockingIn}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStockIn}
                                    disabled={isStockingIn || !stockInForm.itemId}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isStockingIn ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownCircle className="w-5 h-5" />
                                            Receive Stock
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock OUT Modal */}
            {showStockOutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <ArrowUpCircle className="w-6 h-6 text-red-600" />
                                    Issue Stock
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">Record outgoing stock for sales or other purposes</p>
                            </div>
                            <button
                                onClick={() => setShowStockOutModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Close issue stock modal"
                                title="Close modal"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Select Item *
                                    </label>
                                    <select
                                        key={manualRefreshTrigger} // Force re-render when refresh triggers
                                        value={stockOutForm.itemId}
                                        onChange={(e) => setStockOutForm({ ...stockOutForm, itemId: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                        aria-label="Select item to issue"
                                        title="Select an item from inventory"
                                    >
                                        <option value="">Choose an item...</option>
                                        {stockItems && stockItems.length > 0 ? (
                                            stockItems.map((item: StockItem) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name} - Available: {item.currentStock} {item.unit}
                                                    {item.sellingPrice ? ` - Price: ${formatCurrency(item.sellingPrice)}` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No stock items available</option>
                                        )}
                                    </select>
                                    {isFetchingStockItems && (
                                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Updating items...
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={stockOutForm.quantity || ''}
                                        onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Enter quantity"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Reason *
                                    </label>
                                    <select
                                        value={stockOutForm.reason}
                                        onChange={(e) => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                        aria-label="Select reason for stock issue"
                                        title="Select the reason for stock issue"
                                    >
                                        <option value="Sale">Sale</option>
                                        <option value="Production Use">Production Use</option>
                                        <option value="Wastage">Wastage</option>
                                        <option value="Damaged">Damaged</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Return">Return</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Reference Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={stockOutForm.reference}
                                        onChange={(e) => setStockOutForm({ ...stockOutForm, reference: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="e.g., SALE-2025-001"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={stockOutForm.notes}
                                        onChange={(e) => setStockOutForm({ ...stockOutForm, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Additional notes..."
                                    />
                                </div>

                                {stockOutForm.itemId && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        {(() => {
                                            const selectedItem = stockItems.find((item: StockItem) => item.id === stockOutForm.itemId);
                                            return selectedItem?.sellingPrice ? (
                                                <>
                                                    <p className="text-sm text-blue-800">
                                                        <span className="font-semibold">Selling Price:</span> {formatCurrency(selectedItem.sellingPrice)}
                                                    </p>
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        This price will be used for revenue calculations
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-blue-800">
                                                    No selling price configured
                                                </p>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowStockOutModal(false)}
                                    disabled={isStockingOut}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStockOut}
                                    disabled={isStockingOut || !stockOutForm.itemId}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isStockingOut ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUpCircle className="w-5 h-5" />
                                            Issue Stock
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockManagementPage;