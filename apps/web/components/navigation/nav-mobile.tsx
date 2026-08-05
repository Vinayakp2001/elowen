"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface NavLink {
  label: string
  href: string
}

interface NavMobileProps {
  links: NavLink[]
  isOpen: boolean
  onClose: () => void
}

export function NavMobile({ links, isOpen, onClose }: NavMobileProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-[#2C2C2C]/30 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-[#FDFAF5] flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#E8D9C0]">
          <Link
            href="/"
            onClick={onClose}
            className="font-serif text-xl tracking-[0.15em] uppercase text-[#2C2C2C]"
          >
            Elowen
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-[#8C7B6B] hover:text-[#2C2C2C] transition-colors duration-200"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col px-6 py-8 gap-6" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="font-sans text-[0.75rem] tracking-[0.12em] uppercase text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="mt-auto px-6 py-8 border-t border-[#E8D9C0] flex flex-col gap-4">
          <Link
            href="/account"
            onClick={onClose}
            className="font-sans text-[0.75rem] tracking-[0.12em] uppercase text-[#8C7B6B] hover:text-[#2C2C2C] transition-colors duration-200"
          >
            Account
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="font-sans text-[0.75rem] tracking-[0.12em] uppercase text-[#8C7B6B] hover:text-[#2C2C2C] transition-colors duration-200"
          >
            Wishlist
          </Link>
        </div>
      </div>
    </>
  )
}
