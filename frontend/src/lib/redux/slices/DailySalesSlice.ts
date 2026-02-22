import { apiSlice } from "./ApiSlice";

const dailySalesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all daily sales
        dailySales: builder.query({
            query: () => ({ url: "/daily-sales" }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any[] } | any[]) => {
                return Array.isArray(response) ? response : (response?.success ? response.data : response);
            },
        }),

        // Fetch a single daily sale by ID
        singleDailySale: builder.query({
            query: (id) => ({ url: `/daily-sales/${id}` }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any } | any) => {
                return response?.success ? response.data : response;
            },
        }),

        // Create a new daily sale
        createDailySale: builder.mutation({
            query: (data) => ({
                url: "/daily-sales",
                method: "POST",
                body: data,
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any } | any) => {
                return response?.success ? response.data : response;
            },
        }),

        // Delete a daily sale by ID
        deleteDailySale: builder.mutation({
            query: (id) => ({
                url: `/daily-sales/${id}`,
                method: "DELETE",
            }),
        }),

        // Update a daily sale by ID
        updateDailySale: builder.mutation({
            query: ({ id, data }) => ({
                url: `/daily-sales/${id}`,
                method: "PUT",
                body: data,
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any } | any) => {
                return response?.success ? response.data : response;
            },
        }),
    }),
});

// Export hooks for usage in components
export const {
    useDailySalesQuery,
    useSingleDailySaleQuery,
    useCreateDailySaleMutation,
    useDeleteDailySaleMutation,
    useUpdateDailySaleMutation,
} = dailySalesApi;
