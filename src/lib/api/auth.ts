import { User } from "@/types";
import { apiClient } from "./client";
import { ApiError } from "./errors";

type MeResponse = {
  success: boolean;
  user: User | null;
};

export async function getCurrentUser(config?: { signal?: AbortSignal }) {
  try {
    const res =  await apiClient.get<MeResponse>("/auth/me", {
      ...config,
      baseUrl: undefined 
    });
    return res as unknown as MeResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      if (err.status === 401 || err.isAuthError) {
        return null;
      }
    }
    throw err;
  }
}
