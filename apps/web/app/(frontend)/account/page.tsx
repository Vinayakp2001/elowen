"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth"
import { api } from "@/lib/api/client"

interface OrderItem {
  sku: string
  product_name: string
  quantity: number
  unit_price: number
  variant_key?: string
}

interface Order {
  id: string
  status: string
  total_amount: number
  currency: string
  created_at: string
  items: OrderItem[]
  awb_code?: string
  courier_name?: string
  shipping_address?: Record<string, string>
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Confirmed",
  processing: "Processing",
  shipped: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-[#8C7B6B]",
  paid: "text-[#B8975A]",
  processing: "text-[#B8975A]",
  shipped: "text-[#2C7A4B]",
  delivered: "text-[#2C7A4B]",
  cancelled: "text-red-500",
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function AccountPage() {
  const router = useRouter()
  const { user, token, clearAuth } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !token) {
      router.replace("/auth/login")
      return
    }
    api.get<Order[]>("/orders/mine", token)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user, token]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSignOut() {
    clearAuth()
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-16">

        <div className="flex items-start justify-between mb-10 pb-8 border-b border-[#E8D9C0]">
          <div>
            <p className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-1">
              My Account
            </p>
            <h1 className="font-serif text-[2rem] text-[#2C2C2C]">
              {user.name ?? user.email}
            </h1>
            <p className="font-sans text-[0.8rem] text-[#8C7B6B] mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#8C7B6B] hover:text-[#2C2C2C] border-b border-transparent hover:border-[#2C2C2C] transition-all duration-200 mt-1"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Wishlist", href: "/wishlist" },
            { label: "Collections", href: "/collections" },
            { label: "Contact Us", href: "/contact" },
            { label: "Policies", href: "/policies/shipping-returns" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-[#E8D9C0] p-4 font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#2C2C2C] hover:border-[#2C2C2C] transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <h2 className="font-serif text-xl text-[#2C2C2C] mb-6">Order History</h2>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-[#F5F0E8] animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center border border-[#E8D9C0]">
              <p className="font-serif text-lg text-[#2C2C2C]">No orders yet</p>
              <p className="font-sans text-[0.875rem] text-[#8C7B6B] mt-2">
                Your order history will appear here after your first purchase.
              </p>
              <Link
                href="/collections"
                className="inline-block mt-6 font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] transition-colors duration-200"
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#E8D9C0] border border-[#E8D9C0]">
              {orders.map((order) => (
                <div key={order.id}>
                  <button
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#F5F0E8] transition-colors duration-200"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-[0.75rem] text-[#8C7B6B] tracking-wide">
                        Order {order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="font-sans text-[0.8rem] text-[#2C2C2C]">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span
                        className={`font-sans text-[0.7rem] tracking-[0.08em] uppercase ${STATUS_COLORS[order.status] ?? "text-[#8C7B6B]"}`}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className="font-serif text-[0.95rem] text-[#2C2C2C]">
                        {formatCurrency(order.total_amount, order.currency)}
                      </span>
                    </div>
                  </button>

                  {expandedOrder === order.id && (
                    <div className="px-6 pb-6 border-t border-[#F5F0E8] bg-[#FDFAF5]">
                      <div className="pt-5 flex flex-col gap-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div>
                              <p className="font-sans text-[0.8rem] text-[#2C2C2C]">
                                {item.product_name}
                              </p>
                              {item.variant_key && (
                                <p className="font-sans text-[0.7rem] text-[#8C7B6B] capitalize">
                                  {item.variant_key.replace(/-/g, " ")}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-sans text-[0.75rem] text-[#8C7B6B]">
                                x{item.quantity}
                              </p>
                              <p className="font-sans text-[0.8rem] text-[#2C2C2C]">
                                {formatCurrency(item.unit_price * item.quantity, order.currency)}
                              </p>
                            </div>
                          </div>
                        ))}

                        {order.awb_code && (
                          <div className="mt-2 pt-4 border-t border-[#E8D9C0]">
                            <p className="font-sans text-[0.7rem] tracking-[0.08em] uppercase text-[#8C7B6B] mb-1">
                              Tracking
                            </p>
                            <p className="font-sans text-[0.8rem] text-[#2C2C2C]">
                              {order.courier_name} &mdash; {order.awb_code}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
