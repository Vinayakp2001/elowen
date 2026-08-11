"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api/client"

export const dynamic = "force-dynamic"

interface OrderItem {
  sku: string
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  status: string
  total_amount: number
  currency: string
  customer_email?: string
  shipping_address?: Record<string, string>
  items: OrderItem[]
  created_at: string
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount)
}

function CheckoutSuccessInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    api.get<Order>(`/orders/by-session/${sessionId}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [sessionId])

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[640px] mx-auto px-6 md:px-12 py-20">
        <div className="flex flex-col gap-8">
          <div>
            <div className="w-10 h-10 border border-[#B8975A] flex items-center justify-center mb-6">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
                <path d="M1 6L6 11L15 1" stroke="#B8975A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-2">
              Order Confirmed
            </p>
            <h1 className="font-serif text-[2rem] text-[#2C2C2C]">Thank You</h1>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-5 bg-[#F5F0E8] animate-pulse w-1/2" />
              <div className="h-5 bg-[#F5F0E8] animate-pulse w-1/3" />
            </div>
          ) : order ? (
            <div className="flex flex-col gap-6">
              <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed">
                Your order has been confirmed and is being prepared. A confirmation email
                will be sent to{" "}
                {order.customer_email ? (
                  <span className="text-[#2C2C2C]">{order.customer_email}</span>
                ) : (
                  "your email address"
                )}
                .
              </p>

              <div className="border border-[#E8D9C0] p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <p className="font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#8C7B6B]">
                    Order Reference
                  </p>
                  <p className="font-sans text-[0.8rem] text-[#2C2C2C]">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <div className="flex flex-col divide-y divide-[#F5F0E8]">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-sans text-[0.8rem] text-[#2C2C2C]">
                          {item.product_name}
                        </p>
                        <p className="font-sans text-[0.7rem] text-[#8C7B6B]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-sans text-[0.8rem] text-[#2C2C2C]">
                        {formatPrice(item.unit_price * item.quantity, order.currency)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8D9C0]">
                  <p className="font-sans text-[0.75rem] tracking-[0.08em] uppercase text-[#8C7B6B]">
                    Total
                  </p>
                  <p className="font-serif text-lg text-[#2C2C2C]">
                    {formatPrice(order.total_amount, order.currency)}
                  </p>
                </div>

                {order.shipping_address && (
                  <div className="pt-2 border-t border-[#E8D9C0]">
                    <p className="font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#8C7B6B] mb-2">
                      Shipping To
                    </p>
                    <p className="font-sans text-[0.8rem] text-[#2C2C2C] leading-relaxed">
                      {order.shipping_address.name}<br />
                      {order.shipping_address.address}<br />
                      {order.shipping_address.city}, {order.shipping_address.state}{" "}
                      {order.shipping_address.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed">
              Your order has been confirmed. A confirmation email will be sent to you shortly.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/account"
              className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#FDFAF5] bg-[#2C2C2C] px-8 py-3 text-center hover:bg-[#1A1A1A] transition-colors duration-200"
            >
              View Order History
            </Link>
            <Link
              href="/collections"
              className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] border border-[#2C2C2C] px-8 py-3 text-center hover:bg-[#2C2C2C] hover:text-[#FDFAF5] transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 min-h-screen bg-[#FDFAF5] flex items-center justify-center">
          <p className="font-sans text-[0.75rem] tracking-[0.08em] uppercase text-[#8C7B6B]">
            Loading...
          </p>
        </div>
      }
    >
      <CheckoutSuccessInner />
    </Suspense>
  )
}
