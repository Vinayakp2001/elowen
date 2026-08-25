import type { Metadata } from "next"
import { getProductsByNavSlug, getNavItems } from "@/lib/payload/queries"
import { CollectionGrid } from "@/components/commerce/collection-grid"
import { notFound } from "next/navigation"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const navItems = await getNavItems().catch(() => [])
  return navItems.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductsByNavSlug(slug).catch(() => null)
  const title = result?.navItem.label ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title,
    description: `Shop ${title} jewelry — handcrafted fine pieces by Elowen.`,
    alternates: { canonical: `/nav/${slug}` },
  }
}

export default async function NavPage({ params }: Props) {
  const { slug } = await params
  const result = await getProductsByNavSlug(slug).catch(() => null)

  if (!result) return notFound()

  const { navItem, products } = result

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] mb-2">{navItem.label}</h1>
        <p className="font-sans text-[0.75rem] tracking-[0.08em] text-[#8C7B6B] mb-12">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
        <CollectionGrid products={products.filter(Boolean) as NonNullable<typeof products[number]>[]} />
      </div>
    </div>
  )
}
