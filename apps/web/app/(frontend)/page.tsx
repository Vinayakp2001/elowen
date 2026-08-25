import type { Metadata } from "next"
import { getHomepageSettings } from "@/lib/payload/queries"
import { HeroSection } from "@/components/content/hero-section"
import { FeaturedCategories } from "@/components/content/featured-categories"
import { SignatureCollection } from "@/components/content/signature-collection"
import { CampaignBanner } from "@/components/content/campaign-banner"
import { ProductHighlights } from "@/components/content/product-highlights"
import { BrandStory } from "@/components/content/brand-story"
import { NewsletterCapture } from "@/components/content/newsletter-capture"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Elowen — Fine Jewelry | Handcrafted Luxury Pieces",
  description:
    "Discover Elowen's handcrafted fine jewelry — luxury rings, necklaces, and earrings made for the discerning few. Shop our collections at elowen.co.in.",
  alternates: {
    canonical: "/",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Elowen",
  url: "https://elowen.co.in",
  logo: "https://elowen.co.in/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-95099-12259",
    email: "hello@elowen.co.in",
    contactType: "customer service",
  },
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Elowen",
  url: "https://elowen.co.in",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://elowen.co.in/products?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export default async function HomePage() {
  const settings = await getHomepageSettings().catch(() => null)

  const hero = settings?.hero
  const featuredCategories = settings?.featuredCategories ?? []
  const signatureProducts = (settings?.signatureProducts ?? []).filter(
    (p): p is NonNullable<typeof p> => p !== null
  )
  const campaignBanner = settings?.campaignBanner
  const featuredProducts = (settings?.featuredProducts ?? []).filter(
    (p): p is NonNullable<typeof p> => p !== null
  )
  const brandStory = settings?.brandStory
  const newsletterHeadline = settings?.newsletterHeadline

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Hero */}
      <HeroSection
        headline={hero?.headline ?? "Quietly Extraordinary"}
        subline={hero?.subline ?? "Fine jewelry for the discerning few."}
        ctaLabel={hero?.ctaLabel ?? "Explore the Collection"}
        ctaHref={hero?.ctaHref ?? "/collections"}
        imageUrl={hero?.image?.url || "/hero-editorial.jpg"}
        imageAlt={hero?.headline ?? "Woman wearing ornate gold and gemstone drop earrings — Elowen Fine Jewelry"}
      />

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <FeaturedCategories categories={featuredCategories} />
      )}

      {/* Signature Collection */}
      {signatureProducts.length > 0 && (
        <SignatureCollection products={signatureProducts} />
      )}

      {/* Campaign Banner */}
      {campaignBanner?.image && (
        <CampaignBanner
          imageUrl={campaignBanner.image.url}
          headline={campaignBanner.headline ?? ""}
          ctaLabel={campaignBanner.ctaLabel ?? "Shop Now"}
          ctaHref={campaignBanner.ctaHref ?? "/collections"}
        />
      )}

      {/* Product Highlights */}
      {featuredProducts.length > 0 && (
        <ProductHighlights products={featuredProducts} />
      )}

      {/* Brand Story */}
      {brandStory?.image && (
        <BrandStory
          imageUrl={brandStory.image.url}
          headline={brandStory.headline ?? ""}
          body={undefined}
          ctaLabel="Our Story"
          ctaHref="/about"
        />
      )}

      {/* Newsletter */}
      <NewsletterCapture headline={newsletterHeadline} />
    </>
  )
}
