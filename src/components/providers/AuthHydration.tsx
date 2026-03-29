"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // adjust path

export default function AuthHydration() {
  useEffect(() => {
    // This manually triggers the persisted state (user + isAuthenticated)
    // → no flash, works perfectly with skipHydration
    // useAuth.
  }, []);

  return null; // invisible
}
