import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  sku: string
  variantKey: string
  productTitle: string
  image: string
  quantity: number
  unitPrice: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (sku: string, variantKey: string) => void
  updateQuantity: (sku: string, variantKey: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  subtotal: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.sku === item.sku && i.variantKey === item.variantKey
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sku === item.sku && i.variantKey === item.variantKey
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (sku, variantKey) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.sku === sku && i.variantKey === variantKey)
          ),
        }))
      },

      updateQuantity: (sku, variantKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku, variantKey)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.sku === sku && i.variantKey === variantKey
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "elowen-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
)
