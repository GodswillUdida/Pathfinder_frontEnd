import { baseFetch } from "./baseFetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export async function postRequest<TResponse, TBody>(
  path: string,
  body: TBody,
  // options?: RequestOptions
): Promise<TResponse> {

  const res = await baseFetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body), // ✅ YOU MISSED THIS
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  if (res.status === 204) return null as TResponse;

  return res.json();
}
