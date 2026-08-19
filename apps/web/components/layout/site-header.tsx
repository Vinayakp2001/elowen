"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react"
import { useCartStore } from "@/lib/store/cart"
import { useWishlistStore } from "@/lib/store/wishlist"
import { cn } from "@/lib/utils"
import { NavMobile } from "@/components/navigation/nav-mobile"
import { SearchOverlay } from "@/components/navigation/search-overlay"

interface NavLink {
  label: string
  href: string
}

interface SiteHeaderProps {
  collectionLinks: NavLink[]
}

export function SiteHeader({ collectionLinks }: SiteHeaderProps) {
  const navLinks = collectionLinks
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const openCart = useCartStore((s) => s.openCart)
  const itemCount = useCartStore((s) => s.itemCount)
  const wishlistCount = useWishlistStore((s) => s.items.length)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-200",
          scrolled
            ? "bg-[#FDFAF5]/95 backdrop-blur-sm border-b border-[#E8D9C0]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl tracking-[0.15em] uppercase text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200"
          >
            Elowen
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icon Group */}
          <div className="flex items-center gap-5">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200"
            >
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <Link
              href="/account"
              aria-label="Account"
              className="hidden md:block text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200"
            >
              <User className="w-4 h-4" strokeWidth={1.5} />
            </Link>

            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="relative text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200"
            >
              <Heart className="w-4 h-4" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#B8975A] text-[#FDFAF5] text-[0.55rem] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              aria-label={`Cart (${itemCount()} items)`}
              className="relative text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              {itemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#B8975A] text-[#FDFAF5] text-[0.55rem] rounded-full flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <NavMobile
        links={navLinks}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  )
}
