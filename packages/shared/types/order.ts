export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled'

export interface OrderItem {
  sku: string
  variantKey: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  stripeSessionId: string
  status: OrderStatus
  totalAmount: number
  currency: string
  items: OrderItem[]
  createdAt: string
}
