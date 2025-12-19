
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function postJSON<TResponse, TBody>(
  path: string,
  body: TBody,
  options?: { token?: string; signal?: AbortSignal }
): Promise<TResponse> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const data = JSON.parse(text);
      throw new Error(data?.message || text || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  return JSON.parse(text) as TResponse;
}
