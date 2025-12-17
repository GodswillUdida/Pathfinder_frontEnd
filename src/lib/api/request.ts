const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function postJSON<TResponse, TBody>(
  path: string,
  body: TBody
): Promise<TResponse> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return (await res.json()) as TResponse;
}
