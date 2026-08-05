"use client"

import { useState } from "react"

interface NewsletterCaptureProps {
  headline?: string
}

export function NewsletterCapture({
  headline = "Join the Inner Circle",
}: NewsletterCaptureProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      )
      if (res.ok) {
        setStatus("success")
        setEmail("")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <section className="w-full py-16 md:py-20 bg-[#FDFAF5]">
      <div className="max-w-[480px] mx-auto px-6 text-center">
        <h2 className="font-serif text-[1.75rem] md:text-[2rem] text-[#2C2C2C] leading-snug">
          {headline}
        </h2>
        <p className="font-sans text-[0.8rem] text-[#8C7B6B] mt-3 leading-relaxed">
          Be the first to discover new collections, exclusive events, and stories from the atelier.
        </p>

        {status === "success" ? (
          <p className="font-sans text-[0.75rem] tracking-[0.08em] uppercase text-[#B8975A] mt-8">
            Thank you for joining.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" aria-label="Newsletter signup">
            <div className="flex gap-0 border-b border-[#2C2C2C]">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
                className="flex-1 bg-transparent outline-none py-2 font-sans text-[0.875rem] text-[#2C2C2C] placeholder:text-[#C9B99A]"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200 pl-4 disabled:opacity-50"
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </div>
            {status === "error" && (
              <p className="font-sans text-[0.7rem] text-red-500">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
