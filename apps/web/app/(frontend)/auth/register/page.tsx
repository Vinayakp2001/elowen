"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api, ApiError } from "@/lib/api/client"
import { useAuthStore } from "@/lib/store/auth"
import { useWishlistStore } from "@/lib/store/wishlist"

export const dynamic = "force-dynamic"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { items: localWishlist } = useWishlistStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Name is required."
    if (!email.trim()) e.email = "Email is required."
    if (password.length < 8) e.password = "Password must be at least 8 characters."
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const res = await api.post<{ access_token: string; user: any }>("/auth/register", {
        email,
        password,
        name,
      })
      setAuth(res.user, res.access_token)

      // Sync local wishlist to server
      if (localWishlist.length > 0) {
        await api.post("/wishlist/sync", { skus: localWishlist }, res.access_token)
      }

      router.push("/account")
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      setErrors({ form: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-2">
            My Account
          </p>
          <h1 className="font-serif text-[2rem] text-[#2C2C2C]">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            error={errors.name}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            error={errors.password}
            required
          />

          {errors.form && (
            <p className="font-sans text-[0.75rem] text-red-500">{errors.form}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#E8D9C0]" />
          <span className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B]">or</span>
          <div className="flex-1 h-px bg-[#E8D9C0]" />
        </div>

        <a
          href={`${API_URL}/auth/google`}
          className="mt-6 w-full flex items-center justify-center gap-3 border border-[#E8D9C0] py-3 font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] hover:border-[#B8975A] hover:text-[#B8975A] transition-colors duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <p className="mt-8 font-sans text-[0.8rem] text-[#8C7B6B] text-center">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
