import { apiSlice } from "./ApiSlice";

const dailyProductionApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all daily productions
        dailyProductions: builder.query({
            query: () => ({ url: "/daily-productions" }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any[] } | any[]) => {
                return Array.isArray(response) ? response : (response?.success ? response.data : response);
            },
        }),

        // Fetch a single daily production by ID
        singleDailyProduction: builder.query({
            query: (id) => ({ url: `/daily-productions/${id}` }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any } | any) => {
                return response?.success ? response.data : response;
            },
        }),

        // Create a new daily production
        createDailyProduction: builder.mutation({
            query: (data) => ({
                url: "/daily-productions",
                method: "POST",
                body: data,
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any } | any) => {
                return response?.success ? response.data : response;
            },
        }),

        // Delete a daily production by ID
        deleteDailyProduction: builder.mutation({
            query: (id) => ({
                url: `/daily-productions/${id}`,
                method: "DELETE",
            }),
        }),

        // Update a daily production by ID
        updateDailyProduction: builder.mutation({
            query: ({ id, data }) => ({
                url: `/daily-productions/${id}`,
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
    useDailyProductionsQuery,
    useSingleDailyProductionQuery,
    useCreateDailyProductionMutation,
    useDeleteDailyProductionMutation,
    useUpdateDailyProductionMutation,
} = dailyProductionApi;
