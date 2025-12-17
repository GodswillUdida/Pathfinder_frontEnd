// lib/api/fetcher.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = {
  token?: string;
  headers: HeadersInit;
};

export async function safeFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T | null> {
  if (!API_BASE) {
    console.warn("NEXT_PUBLIC_API_URL is not set");
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options?.token && { Authorization: `Bearer ${options.token}` }),
        ...options?.headers,
      },
      cache: "no-store", // adjust if needed
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed fetch for ${path}: ${res.status} - ${text}`);
      return null;
    }

    const data = (await res.json()) as T;
    return data ?? null;
  } catch (err) {
    console.error(`Error fetching ${path}:`, err);
    return null;
  }
}
