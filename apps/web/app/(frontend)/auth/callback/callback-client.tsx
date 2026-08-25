"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"
import { api } from "@/lib/api/client"
import { useWishlistStore } from "@/lib/store/wishlist"

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  const { items: localWishlist } = useWishlistStore()

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      router.replace("/auth/login")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get<any>("/auth/me", token)
      .then(async (user) => {
        setAuth(user, token)

        if (localWishlist.length > 0) {
          await api.post("/wishlist/sync", { skus: localWishlist }, token)
        }

        router.replace("/account")
      })
      .catch(() => {
        router.replace("/auth/login")
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5] flex items-center justify-center">
      <p className="font-sans text-[0.75rem] tracking-[0.08em] uppercase text-[#8C7B6B]">
        Signing you in...
      </p>
    </div>
  )
}

export default function CallbackClient() {
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
      <AuthCallbackInner />
    </Suspense>
  )
}
