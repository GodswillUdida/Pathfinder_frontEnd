// src/lib/normalizeUser.ts
import type { User } from "@/types";

export function normalizeLoginResponse(res:any): {
  user: User;
  token: string | null;
} {
  const token = res?.tokens?.accessToken ?? null;

  const user: User = {
    id: res?.userId ?? res?.user?.id ?? "",
    name: res?.name ?? res?.user?.name ?? "",
    email: res.email ?? res.user.email ?? "" ,
    role: res?.role ?? res?.user?.role ?? "",
    emailVerified: Boolean(
      res?.emailVerified ?? res?.user?.emailVerified ?? false
    ),
    // add other normalized fields here if needed
  };

  return { user, token };
}
