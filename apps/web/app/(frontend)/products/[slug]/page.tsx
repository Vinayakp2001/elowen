import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/payload/queries"
import { ProductGallery } from "@/components/commerce/product-gallery"
import { RelatedProducts } from "@/components/commerce/related-products"
import { StickyCartBar } from "@/components/commerce/sticky-cart-bar"
import { ProductInfoPanel } from "@/components/commerce/product-info-panel"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)
  if (!product) return {}
  const imageUrl = product.images?.[0]?.url ?? undefined
  return {
    title: product.title,
    description: `${product.title} — Fine jewelry by Elowen.`,
    openGraph: {
      title: product.title,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)
  if (!product) notFound()

  // Gallery expects { url, alt } directly — product.images already has this shape
  const images: { url: string; alt?: string }[] = (product.images ?? []).filter(
    (img: { url: string; alt?: string }) => !!img.url
  )

  // Required fields are guaranteed to exist after notFound() check above
  const title = product.title ?? ""
  const sku = product.sku ?? ""
  const price = product.price ?? 0
  const inStock = product.inStock ?? false

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "USD",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-16 pb-24 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 md:items-start">
            <ProductGallery images={images} title={title} />
            <div className="md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:pr-2">
              <ProductInfoPanel product={{ ...product, _id: product._id ?? "", title, sku, price, inStock, images }} />
            </div>
          </div>
        </div>

        {product.related?.length > 0 && (
          <RelatedProducts products={product.related} />
        )}
      </div>

      <StickyCartBar
        item={{
          sku,
          variantKey: "",
          productTitle: title,
          image: images[0]?.url ?? "",
          quantity: 1,
          unitPrice: price,
        }}
        inStock={inStock}
        productTitle={title}
        price={price}
      />
    </>
  )
}
