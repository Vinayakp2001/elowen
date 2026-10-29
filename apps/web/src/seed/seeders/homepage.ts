/**
 * seedHomepage — overwrite the homepage-settings singleton global (Req 8).
 *
 * Uses payload.updateGlobal so re-running overwrites in place (idempotent, no
 * duplicates — Req 8.3). Relationship fields are resolved from the passed maps;
 * any relationship whose id is missing is omitted rather than sent as a bad id
 * (Req 8.2). Images resolve from mediaMap; brandStory.body is Lexical rich text.
 */
import type { Payload } from "payload"
import type { SeedReport } from "../report"
import { richText } from "../lexical"
import { homepage } from "../data/homepage"

export async function seedHomepage(
  payload: Payload,
  mediaMap: Map<string, number>,
  categoryMap: Map<string, number>,
  productMap: Map<string, number>,
  report: SeedReport,
): Promise<void> {
  const label = "homepage-settings"

  try {
    const heroImage = mediaMap.get(homepage.hero.imageKey)
    const bannerImage = mediaMap.get(homepage.campaignBanner.imageKey)
    const storyImage = mediaMap.get(homepage.brandStory.imageKey)

    const featuredCategories = homepage.featuredCategorySlugs
      .map((slug) => categoryMap.get(slug))
      .filter((id): id is number => id !== undefined)

    const signatureProducts = homepage.signatureProductSlugs
      .map((slug) => productMap.get(slug))
      .filter((id): id is number => id !== undefined)

    const featuredProducts = homepage.featuredProductSlugs
      .map((slug) => productMap.get(slug))
      .filter((id): id is number => id !== undefined)

    const hero: Record<string, unknown> = {
      headline: homepage.hero.headline,
      subline: homepage.hero.subline,
      ctaLabel: homepage.hero.ctaLabel,
      ctaHref: homepage.hero.ctaHref,
    }
    if (heroImage !== undefined) hero.image = heroImage

    const campaignBanner: Record<string, unknown> = {
      headline: homepage.campaignBanner.headline,
      ctaLabel: homepage.campaignBanner.ctaLabel,
      ctaHref: homepage.campaignBanner.ctaHref,
    }
    if (bannerImage !== undefined) campaignBanner.image = bannerImage

    const brandStory: Record<string, unknown> = {
      headline: homepage.brandStory.headline,
      body: richText(...homepage.brandStory.body),
    }
    if (storyImage !== undefined) brandStory.image = storyImage

    await payload.updateGlobal({
      slug: "homepage-settings",
      data: {
        hero,
        featuredCategories,
        signatureProducts,
        campaignBanner,
        featuredProducts,
        brandStory,
        newsletterHeadline: homepage.newsletterHeadline,
      } as never,
    })

    report.record(label, "created")
  } catch (err) {
    report.record(label, "failed")
    console.error(
      "[seed] homepage-settings: failed to update global:",
      err instanceof Error ? err.message : err,
    )
  }
}
