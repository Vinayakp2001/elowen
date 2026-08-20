import type { Metadata } from "next"
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { CartDrawer } from "@/components/navigation/cart-drawer"

export const revalidate = 60

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"),
  title: {
    default: "Elowen — Fine Jewelry",
    template: "%s | Elowen",
  },
  description:
    "Quietly extraordinary. Handcrafted fine jewelry for the discerning few.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Elowen",
  },
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {

  // Fixed nav links — these never change regardless of what's in the CMS.
  // New collections created in CMS are browsable via /collections, not added here.
  const fixedNavLinks = [
    { label: "Shop All", href: "/products" },
    { label: "New Arrivals", href: "/nav/new-arrivals" },
    { label: "Rings", href: "/nav/rings" },
    { label: "Necklaces", href: "/nav/necklaces" },
    { label: "Earrings", href: "/nav/earrings" },
    { label: "Collections", href: "/collections" },
  ]

  const shopFooterLinks = [
    ...fixedNavLinks,
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#FDFAF5] text-[#2C2C2C] antialiased">
        <SiteHeader collectionLinks={fixedNavLinks} />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <SiteFooter shopLinks={shopFooterLinks} />
      </body>
    </html>
  )
}
