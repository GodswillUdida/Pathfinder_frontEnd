import { apiClient } from "./client";

export async function getCurrentUser<T>() {
  try {
    return await apiClient.get<T>("/auth/me");
  } catch (err: any) {
    if (err?.status === 401 || err?.isAuthError) {
      return null;
    }
    throw err;
  }
}