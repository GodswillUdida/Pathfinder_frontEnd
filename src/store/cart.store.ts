// store/cart.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* =====================================================
   TYPES
   ⚠️ thumbnail/instructor are nullable and the duration field
   is named `durationSeconds` — this MUST match what CourseCard's
   addItem() call actually sends (see components/courses/CourseCard.tsx).
   The two drifted apart once before (required string vs null,
   `duration` vs `durationSeconds`) and it broke silently; keep
   this the single source of truth for what a cart line looks like.
===================================================== */

export interface CartItem {
  courseId: string;
  pricingId: string;
  title: string;
  thumbnail: string | null;
  price: number;
  currency: string;
  /** Seconds, matches Course.totalDurationSeconds. Null when unknown. */
  durationSeconds: number | null;
  quantity: number;
  instructor: string | null;
}

type AddCartItemInput = Omit<CartItem, "quantity"> & { quantity?: number };

const CART_STORAGE_VERSION = 1;

/* =====================================================
   STORE TYPE
===================================================== */

interface CartState {
  items: CartItem[];
  /**
   * False until zustand's persist middleware has read localStorage on
   * the client. Without this, an SSR-rendered cart badge shows 0 and
   * then jumps to the real count on mount — use useCartHasHydrated()
   * to gate that render instead of trusting `items` immediately.
   */
  _hasHydrated: boolean;
  _setHasHydrated: (value: boolean) => void;

  /** Returns false (no-op) if the pricingId is already in the cart. */
  addItem: (item: AddCartItemInput) => boolean;
  removeItem: (pricingId: string) => void;
  clearCart: () => void;
  /** Clamped to a minimum of 1 — there is no "0 quantity" cart line. */
  setQuantity: (pricingId: string, quantity: number) => void;

  getItem: (pricingId: string) => CartItem | undefined;
  isInCart: (pricingId: string) => boolean;
  getItemCount: () => number;
  /**
   * Sums price * quantity across all items. Assumes a single-currency
   * cart (true for every payload seen so far — all NGN). If mixed
   * currencies ever land here this still returns a number, but it's a
   * meaningless one; the dev-mode warning below is the signal to build
   * real multi-currency handling before that ships, not silently trust
   * the sum in production.
   */
  getTotal: () => number;
}

/* =====================================================
   STORE
===================================================== */

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      _setHasHydrated: (value) => set({ _hasHydrated: value }),

      addItem: (item) => {
        const alreadyInCart = get().items.some((i) => i.pricingId === item.pricingId);
        if (alreadyInCart) return false;

        set((state) => ({
          items: [...state.items, { quantity: 1, ...item }],
        }));
        return true;
      },

      removeItem: (pricingId) =>
        set((state) => ({
          items: state.items.filter((i) => i.pricingId !== pricingId),
        })),

      clearCart: () => set({ items: [] }),

      setQuantity: (pricingId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.pricingId === pricingId ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),

      getItem: (pricingId) => get().items.find((i) => i.pricingId === pricingId),

      isInCart: (pricingId) => get().items.some((i) => i.pricingId === pricingId),

      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),

      getTotal: () => {
        const items = get().items;

        if (process.env.NODE_ENV !== "production") {
          const currencies = new Set(items.map((i) => i.currency));
          if (currencies.size > 1) {
            console.warn(
              "[cart.store] Mixed currencies in cart — getTotal() sums them as a single number:",
              [...currencies]
            );
          }
        }

        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),

    /* =================================================
       PERSIST CONFIG
    ================================================= */
    {
      name: "pathfinder-cart",
      version: CART_STORAGE_VERSION,
      storage:
        typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,

      partialize: (state) => ({ items: state.items }),

      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },

      /**
       * v0 → v1: `duration` renamed to `durationSeconds`; `thumbnail`
       * and `instructor` became nullable. Without this, everyone with
       * an existing cart in localStorage from before this change would
       * load a persisted object that no longer matches CartItem and
       * silently misbehaves (or crashes) the first time the cart UI
       * reads a field that no longer exists in the old shape.
       */
      migrate: (persistedState) => {
        const state = persistedState as { items?: Record<string, unknown>[] } | undefined;
        if (!state?.items) return { items: [] };

        const items: CartItem[] = state.items.map((raw) => ({
          courseId: raw.courseId as string,
          pricingId: raw.pricingId as string,
          title: raw.title as string,
          thumbnail: (raw.thumbnail as string | null | undefined) ?? null,
          price: raw.price as number,
          currency: raw.currency as string,
          durationSeconds:
            (raw.durationSeconds as number | null | undefined) ??
            (raw.duration as number | null | undefined) ??
            null,
          quantity: (raw.quantity as number | undefined) ?? 1,
          instructor: (raw.instructor as string | null | undefined) ?? null,
        }));

        return { items };
      },
    }
  )
);

/** Guards components (e.g. a navbar cart badge) against SSR/hydration flicker. */
export function useCartHasHydrated(): boolean {
  return useCart((state) => state._hasHydrated);
}