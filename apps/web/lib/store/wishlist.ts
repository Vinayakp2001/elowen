import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WishlistStore {
  items: string[] // array of SKUs
  toggle: (sku: string) => void
  has: (sku: string) => boolean
  setItems: (skus: string[]) => void
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (sku) => {
        set((state) =>
          state.items.includes(sku)
            ? { items: state.items.filter((s) => s !== sku) }
            : { items: [...state.items, sku] }
        )
      },

      has: (sku) => get().items.includes(sku),

      setItems: (skus) => set({ items: skus }),

      clear: () => set({ items: [] }),
    }),
    {
      name: "elowen-wishlist",
    }
  )
)
