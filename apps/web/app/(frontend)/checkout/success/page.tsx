import { Suspense } from "react"
import { CheckoutSuccessClient } from "./checkout-success-client"

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
      <CheckoutSuccessClient />
    </Suspense>
  )
}
