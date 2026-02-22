import { apiSlice } from "./ApiSlice";

const rawMaterialApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all raw materials
        rawMaterials: builder.query({
            query: () => ({ url: "/raw-materials" }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any[] } | any[]) => {
                return Array.isArray(response) ? response : (response?.success ? response.data : response);
            },
        }),

        // Fetch a single raw material by ID
        singleRawMaterial: builder.query({
            query: (id) => ({ url: `/raw-materials/${id}` }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any } | any) => {
                return response?.success ? response.data : response;
            },
        }),

        // Create a new raw material
        createRawMaterial: builder.mutation({
            query: (data) => ({
                url: "/raw-materials",
                method: "POST",
                body: data,
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformResponse: (response: { success: boolean; data: any } | any) => {
                return response?.success ? response.data : response;
            },
        }),

        // Delete a raw material by ID
        deleteRawMaterial: builder.mutation({
            query: (id) => ({
                url: `/raw-materials/${id}`,
                method: "DELETE",
            }),
        }),

        // Update a raw material by ID
        updateRawMaterial: builder.mutation({
            query: ({ id, data }) => ({
                url: `/raw-materials/${id}`,
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
    useRawMaterialsQuery,
    useSingleRawMaterialQuery,
    useCreateRawMaterialMutation,
    useDeleteRawMaterialMutation,
    useUpdateRawMaterialMutation,
} = rawMaterialApi;
