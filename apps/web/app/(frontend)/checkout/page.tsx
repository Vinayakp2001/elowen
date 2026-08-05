"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/lib/store/cart"
import { useAuthStore } from "@/lib/store/auth"
import { api, ApiError } from "@/lib/api/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
]

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore()
  const { user, token } = useAuthStore()

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pincode, setPincode] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null)
  const [couponError, setCouponError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-[#FDFAF5] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-serif text-lg text-[#2C2C2C] mb-2">Your cart is empty</p>
          <Link
            href="/collections"
            className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] pb-0.5 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Name is required"
    if (!email.trim()) e.email = "Email is required"
    if (!phone.trim()) e.phone = "Phone is required"
    if (!address.trim()) e.address = "Address is required"
    if (!city.trim()) e.city = "City is required"
    if (!state.trim()) e.state = "State is required"
    if (!pincode.trim()) e.pincode = "Pincode is required"
    else if (!/^\d{6}$/.test(pincode.trim())) e.pincode = "Pincode must be 6 digits"
    return e
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponError("")
    setCouponDiscount(null)
    try {
      const res = await api.post<{
        valid: boolean
        new_total?: number
        message?: string
      }>("/cart/coupon", { code: couponCode.trim(), subtotal: subtotal() }, token ?? undefined)
      if (res.valid && res.new_total !== undefined) {
        setCouponDiscount(subtotal() - res.new_total)
      } else {
        setCouponError(res.message ?? "Invalid coupon code")
      }
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.message : "Failed to apply coupon")
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const res = await api.post<{ session_id: string; url: string }>(
        "/checkout/session",
        {
          items: items.map((i) => ({
            sku: i.sku,
            product_name: i.productTitle,
            quantity: i.quantity,
            unit_price: i.unitPrice,
          })),
          coupon_code: couponCode.trim() || undefined,
          user_id: user?.id,
          email,
          phone,
          shipping_name: name.trim(),
          shipping_address: address.trim(),
          shipping_city: city.trim(),
          shipping_state: state.trim(),
          shipping_pincode: pincode.trim(),
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        },
        token ?? undefined
      )

      // Clear cart and redirect to Stripe
      clearCart()
      window.location.href = res.url
    } catch (err) {
      setErrors({
        form: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p)

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16">
        <h1 className="font-serif text-[2rem] text-[#2C2C2C] mb-2">Checkout</h1>
        <p className="font-sans text-[0.75rem] tracking-[0.08em] uppercase text-[#8C7B6B] mb-12">
          Secure payment
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
          {/* Left: Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
            {/* Contact */}
            <div>
              <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Contact Information</h2>
              <div className="flex flex-col gap-5">
                <Input
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  error={errors.phone}
                  required
                />
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Shipping Address</h2>
              <div className="flex flex-col gap-5">
                <Input
                  label="Street Address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  error={errors.address}
                  required
                />
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="City"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    error={errors.city}
                    required
                  />
                  <Input
                    label="Pincode"
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6 digits"
                    error={errors.pincode}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="text-[0.75rem] tracking-[0.1em] uppercase text-[#8C7B6B] font-sans"
                  >
                    State
                  </label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 w-full bg-transparent border-0 border-b border-[#C9B99A] focus:border-[#B8975A] outline-none py-2 font-sans text-[1rem] text-[#2C2C2C] transition-colors duration-200"
                    required
                  >
                    <option value="">Select state</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <span className="text-[0.75rem] text-red-500">{errors.state}</span>
                  )}
                </div>
              </div>
            </div>

            {errors.form && (
              <p className="font-sans text-[0.75rem] text-red-500">{errors.form}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </form>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="border border-[#E8D9C0] p-6">
              <h2 className="font-serif text-lg text-[#2C2C2C] mb-5">Order Summary</h2>

              <ul className="flex flex-col divide-y divide-[#E8D9C0]">
                {items.map((item) => (
                  <li key={`${item.sku}-${item.variantKey}`} className="flex gap-4 py-4">
                    <div className="relative w-16 h-16 bg-[#F5F0E8] shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-sans text-[0.8rem] text-[#2C2C2C] leading-snug">
                        {item.productTitle}
                      </p>
                      <p className="font-sans text-[0.7rem] text-[#8C7B6B] mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-sans text-[0.8rem] text-[#2C2C2C] whitespace-nowrap">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3 pt-5 border-t border-[#E8D9C0]">
                {/* Coupon */}
                <div>
                  <div className="flex gap-2">
                    <Input
                      label="Coupon Code"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim()}
                      className="mt-7 px-5"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="font-sans text-[0.7rem] text-red-500 mt-1">{couponError}</p>
                  )}
                  {couponDiscount && couponDiscount > 0 && (
                    <p className="font-sans text-[0.7rem] text-[#B8975A] mt-1">
                      Coupon applied: {formatPrice(couponDiscount)} off
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="font-sans text-[0.75rem] tracking-[0.08em] uppercase text-[#8C7B6B]">
                    Subtotal
                  </span>
                  <span className="font-sans text-[0.9rem] text-[#2C2C2C]">
                    {formatPrice(subtotal())}
                  </span>
                </div>

                {couponDiscount && couponDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[0.75rem] tracking-[0.08em] uppercase text-[#8C7B6B]">
                      Discount
                    </span>
                    <span className="font-sans text-[0.9rem] text-[#B8975A]">
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#E8D9C0]">
                  <span className="font-sans text-[0.8rem] tracking-[0.08em] uppercase text-[#2C2C2C]">
                    Total
                  </span>
                  <span className="font-serif text-xl text-[#2C2C2C]">
                    {formatPrice(couponDiscount ? subtotal() - couponDiscount : subtotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}