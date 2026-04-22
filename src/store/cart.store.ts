import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* =====================================================
 TYPES — MATCH BACKEND
===================================================== */

export interface CartItem {
  courseId: string;
  pricingId: string;

  title: string;
  thumbnail?: string | null;

  price: number;
  currency: string;

  duration?: string;

  quantity: number;
}

/* =====================================================
 STORE TYPE
===================================================== */

interface CartState {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (pricingId: string) => void;
  clearCart: () => void;

  getTotal: () => number;
  isInCart: (pricingId: string) => boolean;
}

/* =====================================================
 STORE
===================================================== */

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      /* ===============================
        ADD ITEM
      =============================== */
      addItem: (item) =>
        set((state) => {
          const exists = state.items.find(
            (i) => i.pricingId === item.pricingId
          );

          // prevent duplicates
          if (exists) return state;

          return {
            items: [...state.items, item],
          };
        }),

      /* ===============================
        REMOVE
      =============================== */
      removeItem: (pricingId) =>
        set((state) => ({
          items: state.items.filter((i) => i.pricingId !== pricingId),
        })),

      /* ===============================
        CLEAR
      =============================== */
      clearCart: () => set({ items: [] }),

      /* ===============================
        TOTAL PRICE
      =============================== */
      getTotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),

      /* ===============================
        CHECK EXISTENCE
      =============================== */
      isInCart: (pricingId) =>
        get().items.some((i) => i.pricingId === pricingId),
    }),

    /* =================================================
      PERSIST CONFIG
    ================================================= */

    {
      name: "pathfinder-cart",

      storage: createJSONStorage(() => localStorage),

      // persist only required data
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
