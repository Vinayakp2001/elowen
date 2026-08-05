import type { Metadata } from "next"
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { CartDrawer } from "@/components/navigation/cart-drawer"
import { getAllCollections, getNavItems } from "@/lib/payload/queries"

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"),
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
  const collections = (await getAllCollections().catch(() => [])) ?? []
  const navItems = (await getNavItems().catch(() => [])) ?? []

  // Static fallback links always shown — these are the core jewelry categories.
  // CMS collections with matching slugs will override/replace them naturally
  // since the /collections/[slug] page handles both real and "coming soon" states.
  const staticCategoryLinks = [
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Rings", href: "/collections/rings" },
    { label: "Necklaces", href: "/collections/necklaces" },
    { label: "Earrings", href: "/collections/earrings" },
  ]

  // If CMS has nav items defined, use those — otherwise fall back to collection-based links
  const cmsSlugSet = new Set(collections.map((c) => c.slug.current))
  const mergedCategoryLinks = navItems.length > 0
    ? [
        { label: "Shop All", href: "/products" },
        ...navItems.map((n) => ({ label: n.label, href: `/nav/${n.slug}` })),
      ]
    : [
        { label: "Shop All", href: "/products" },
        ...collections.map((c) => ({ label: c.title, href: `/collections/${c.slug.current}` })),
        ...staticCategoryLinks.filter((l) => !cmsSlugSet.has(l.href.replace("/collections/", ""))),
      ]

  const shopFooterLinks = [
    ...mergedCategoryLinks,
    { label: "About Us", href: "/about" },
  ]

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#FDFAF5] text-[#2C2C2C] antialiased">
        <SiteHeader collectionLinks={mergedCategoryLinks} />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <SiteFooter shopLinks={shopFooterLinks} />
      </body>
    </html>
  )
}
