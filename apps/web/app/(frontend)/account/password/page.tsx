"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth"
import { api, ApiError } from "@/lib/api/client"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"
import { Button } from "@/components/ui/button"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user || !token) {
    router.replace("/auth/login")
    return null
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!currentPassword) e.currentPassword = "Current password is required"
    if (newPassword.length < 8) e.newPassword = "New password must be at least 8 characters"
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) { setErrors(v); return }
    setErrors({})
    setLoading(true)
    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      }, token ?? undefined)
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      setErrors({
        form: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-sm mx-auto px-6 py-16">
        <Link
          href="/account"
          className="font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#8C7B6B] hover:text-[#2C2C2C] border-b border-transparent hover:border-[#2C2C2C] transition-all duration-200 inline-block mb-8"
        >
          Back to Account
        </Link>

        <div className="mb-8">
          <p className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-1">
            My Account
          </p>
          <h1 className="font-serif text-[2rem] text-[#2C2C2C]">Change Password</h1>
        </div>

        {success ? (
          <div className="border border-[#E8D9C0] p-6 text-center">
            <p className="font-sans text-[0.875rem] text-[#2C2C2C]">
              Password updated successfully.
            </p>
            <Link
              href="/account"
              className="inline-block mt-4 font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] transition-colors duration-200"
            >
              Return to Account
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={errors.currentPassword}
              autoComplete="current-password"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              autoComplete="new-password"
              required
            />
            {errors.form && (
              <p className="font-sans text-[0.75rem] text-red-500">{errors.form}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
