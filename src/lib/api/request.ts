const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = {
  token?: string;
  signal?: AbortSignal;
};

export async function postRequest<TResponse, TBody extends BodyInit | object>(
  path: string,
  body: TBody,
  options?: RequestOptions
): Promise<TResponse> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const isFormData = body instanceof FormData;

  const headers: HeadersInit = {
    ...(options?.token && { Authorization: `Bearer ${options.token}` }),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: isFormData ? body : JSON.stringify(body),
    signal: options?.signal,
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const data = text ? JSON.parse(text) : null;
      throw new Error(data?.message || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  // Handle empty responses (204, etc.)
  if (!text) {
    return null as TResponse;
  }

  return JSON.parse(text) as TResponse;
}
