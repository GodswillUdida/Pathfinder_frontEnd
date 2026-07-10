import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types";

// export interface ListApplicationParams {
//     page?: number;
//     limit?: number;
//     //   search?:    string;
//     //   programId?: string;
//     total?: number;
//     pages?: number;
// }

export interface CreateApplicantInput extends Record<string, unknown> {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    lectureCenter?: string;
    previousCenter?: string;
    isNewStudent: boolean;
    level?: string;
    careerChallenges?: string;
    referredBy?: string;
    documents?: string[];
    papers: string[]; // Array of paper names
    employment?: {
        placeOfWork?: string;
        position?: string;
    };
    sponsor?: {
        name?: string;
        phone?: string;
        email?: string;
        location?: string;
        workplace?: string;
    };
}

export const appliationApi = {

    async register(
        data: CreateApplicantInput
    ): Promise<ApiResponse> {
        const res = await apiClient.post<ApiResponse>(
            `/intake/register`,
            data 
        );

        console.log("API Response:", res); // Log the entire response object for debugging
        if (!res.success) throw new Error(res.message);

        return res.data;
    },

    async getApplicants(params?: Record<string, any>) {
        const query = new URLSearchParams(params).toString();
        const res = await apiClient.get<ApiResponse>(`/intake?${query}`);
        if (!res.success) throw new Error(res.message);
        return res.data;
    },
    async getApplicant(id: string) {
        const res = await apiClient.get<ApiResponse>(`/intake/${id}`);
        if (!res.success) throw new Error(res.message);
        return res.data;
    },
    async deleteApplicant(id: string) {
        const res = await apiClient.delete<ApiResponse>(`/intake/${id}`);
        if (!res.success) throw new Error(res.message);
        return res.data;
    },
    async updateApplication(id: string, data: Partial<CreateApplicantInput>) {
        const res = await apiClient.patch<ApiResponse>(`/intake/${id}/status`, data);
        if (!res.success) throw new Error(res.message);
        return res.data;
    },
    async updateApplicantionStatus(id: string, status: string) {
        const res = await apiClient.patch<ApiResponse>(`/intake/${id}/status`, { status });
        if (!res.success) throw new Error(res.message);
        return res.data;
    },
    async getApplicationStats() {
        const res = await apiClient.get<ApiResponse>(`/intake/stats`);
        if (!res.success) throw new Error(res.message);
        return res.data;
    },
}