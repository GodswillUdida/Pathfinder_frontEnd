// lib/api/fetcher.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = {
  token?: string;
  headers: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
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
      cache: options?.cache ?? "no-store",
      signal: options?.signal,
    });

    const text = await res.text();

    if (!res.ok) {
      try {
        const jsonError = JSON.parse(text);
        console.error(
          `Failed fetch for ${path}: ${res.status} - ${
            jsonError?.message ?? text
          }`
        );
      } catch {
        console.error(`Failed fetch ${path}: ${res.status} - {text}`);
      }
      return null
    }

    return text ? (JSON.parse(text) as T) : null;
  } catch (err) {
    console.error(`Error fetching ${path}:`, err);
    return null;
  }
}
