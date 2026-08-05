import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Checkout Cancelled" }

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-6">
      <div className="max-w-md text-center flex flex-col gap-6">
        <h1 className="font-serif text-[2rem] text-[#2C2C2C]">Checkout Cancelled</h1>
        <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed">
          Your order was not completed. Your cart has been saved — return whenever you are ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/cart"
            className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#FDFAF5] bg-[#2C2C2C] px-8 py-3 hover:bg-[#1A1A1A] transition-colors duration-200"
          >
            Return to Cart
          </Link>
          <Link
            href="/collections"
            className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] border border-[#2C2C2C] px-8 py-3 hover:bg-[#2C2C2C] hover:text-[#FDFAF5] transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
