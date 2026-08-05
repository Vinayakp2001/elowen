"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-6">
      <div className="max-w-md text-center flex flex-col gap-6">
        <h1 className="font-serif text-[2rem] text-[#2C2C2C]">Something went wrong</h1>
        <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="font-sans text-[0.7rem] tracking-[0.12em] uppercase bg-[#2C2C2C] text-[#FDFAF5] px-8 py-3 hover:bg-[#1A1A1A] transition-colors duration-200"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] border border-[#2C2C2C] px-8 py-3 hover:bg-[#2C2C2C] hover:text-[#FDFAF5] transition-colors duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
