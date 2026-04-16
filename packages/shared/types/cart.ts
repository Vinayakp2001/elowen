export interface CartItem {
  sku: string
  variantKey: string
  productTitle: string
  image: string
  quantity: number
  unitPrice: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
}
