'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore'; // adjust path

export default function AuthHydration() {
  useEffect(() => {
    // This manually triggers the persisted state (user + isAuthenticated)
    // → no flash, works perfectly with skipHydration
    useAuthStore.persist.rehydrate();
  }, []);

  return null; // invisible
}