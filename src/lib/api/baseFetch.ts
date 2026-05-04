
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export async function baseFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    credentials: "include", // 🔥 ALWAYS include cookies
  });

  if (res.status !== 401) return res;

  // Try to parse response
  let data: any = null;
  try {
    data = await res.clone().json();
  } catch {}

  if (data?.code !== "TOKEN_EXPIRED") {
    return res;
  }

  // 🔥 Handle refresh
  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("Refresh failed");
      })
      .finally(() => {
        isRefreshing = false;
      });
  }

  await refreshPromise;

  // 🔁 retry original request
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}