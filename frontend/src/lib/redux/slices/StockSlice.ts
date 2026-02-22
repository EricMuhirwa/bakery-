import { apiSlice } from "./ApiSlice";

const stockApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Stock Items Endpoints
        getAllStockItems: builder.query({
            query: () => ({ url: "/stock/items" }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any[] }) => {
                return response?.success ? response.data : response;
            },
            providesTags: [{ type: 'StockItem' as const, id: 'LIST' }],
        }),

        getStockItemById: builder.query({
            query: (id) => ({ url: `/stock/items/${id}` }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any }) => {
                return response?.success ? response.data : response;
            },
            providesTags: (result, error, id) => [{ type: 'StockItem' as const, id }],
        }),

        createStockItem: builder.mutation({
            query: (data) => ({
                url: "/stock/items",
                method: "POST",
                body: data
            }),
            invalidatesTags: [
                { type: 'StockItem' as const, id: 'LIST' },
                { type: 'StockStatistics' as const }
            ],
        }),

        updateStockItem: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/stock/items/${id}`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'StockItem' as const, id },
                { type: 'StockItem' as const, id: 'LIST' },
                { type: 'StockStatistics' as const }
            ],
        }),

        deleteStockItem: builder.mutation({
            query: (id) => ({
                url: `/stock/items/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'StockItem' as const, id },
                { type: 'StockItem' as const, id: 'LIST' },
                { type: 'StockStatistics' as const }
            ],
        }),

        // Stock Movement Endpoints
        stockIn: builder.mutation({
            query: (data) => ({
                url: "/stock/in",
                method: "POST",
                body: data
            }),
            invalidatesTags: [
                { type: 'StockItem' as const, id: 'LIST' },
                { type: 'StockItem' as const },
                { type: 'StockMovement' as const },
                { type: 'StockStatistics' as const }
            ],
        }),

        stockOut: builder.mutation({
            query: (data) => ({
                url: "/stock/out",
                method: "POST",
                body: data
            }),
            invalidatesTags: [
                { type: 'StockItem' as const, id: 'LIST' },
                { type: 'StockItem' as const },
                { type: 'StockMovement' as const },
                { type: 'StockStatistics' as const }
            ],
        }),

        getStockMovements: builder.query({
            query: (filters) => {
                const params = new URLSearchParams();
                if (filters?.itemId) params.append('itemId', filters.itemId);
                if (filters?.type) params.append('type', filters.type);
                if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
                if (filters?.dateTo) params.append('dateTo', filters.dateTo);
                if (filters?.search) params.append('search', filters.search);

                return {
                    url: `/stock/movements${params.toString() ? `?${params.toString()}` : ''}`
                };
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any[] }) => {
                return response?.success ? response.data : response;
            },
            providesTags: [{ type: 'StockMovement' as const, id: 'LIST' }],
        }),

        getStockMovementById: builder.query({
            query: (id) => ({ url: `/stock/movements/${id}` }),
        }),

        // Stock Statistics & Reports
        getLowStockItems: builder.query({
            query: () => ({ url: "/stock/low-stock" }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any[] }) => {
                return response?.success ? response.data : response;
            },
            providesTags: [{ type: 'StockItem' as const, id: 'LOW_STOCK' }],
        }),

        getStockStatistics: builder.query({
            query: () => ({ url: "/stock/statistics" }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any }) => {
                return response?.success ? response.data : response;
            },
            providesTags: [{ type: 'StockStatistics' as const }],
        }),
    }),
});

export const {
    // Stock Items
    useGetAllStockItemsQuery,
    useGetStockItemByIdQuery,
    useCreateStockItemMutation,
    useUpdateStockItemMutation,
    useDeleteStockItemMutation,

    // Stock Movements
    useStockInMutation,
    useStockOutMutation,
    useGetStockMovementsQuery,
    useGetStockMovementByIdQuery,

    // Statistics & Reports
    useGetLowStockItemsQuery,
    useGetStockStatisticsQuery,
} = stockApi;