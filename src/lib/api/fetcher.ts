// lib/api/fetcher.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

type FetchOptions = {
  token?: string;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
};

export async function safeFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(options?.token && {
        Authorization: `Bearer ${options.token}`,
      }),
      ...options?.headers,
    },
    cache: options?.cache ?? "no-store",
    signal: options?.signal,
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Fetch failed ${res.status}: ${errorBody.slice(0, 200)}`
    );
  }

  if (!contentType?.includes("application/json")) {
    const body = await res.text();
    throw new Error(
      `Expected JSON but received: ${body.slice(0, 200)}`
    );
  }

  return res.json() as Promise<T>;
}
