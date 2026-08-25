/**
 * Shared SEO utilities for Elowen storefront.
 * All helpers are pure functions with no side effects.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ""

/**
 * Converts a relative path to an absolute URL using NEXT_PUBLIC_SERVER_URL.
 * e.g. absoluteUrl("/products/ring") → "https://elowen.co.in/products/ring"
 */
export function absoluteUrl(path: string): string {
  // If already absolute, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const base = BASE_URL.replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * Returns a default OG image object pointing to the fallback brand image.
 * Used on pages that don't have a specific CMS-sourced OG image.
 */
export function defaultOgImage() {
  return {
    url: absoluteUrl("/og-default.jpg"),
    width: 1200,
    height: 630,
    alt: "Elowen Fine Jewelry",
  }
}

/**
 * Builds a 140–160 character product meta description from title + materials.
 * Falls back gracefully when materials are unavailable.
 *
 * Examples:
 *   "Diamond Solitaire Ring in 18k Gold & Diamond — handcrafted fine jewelry by Elowen. Shop now at elowen.co.in."
 */
export function productDescription(title: string, materials: string[]): string {
  const brand = "Elowen Fine Jewelry"
  const suffix = ` — handcrafted fine jewelry by Elowen. Shop now at elowen.co.in.`

  if (materials.length > 0) {
    // Join up to 3 materials to keep the description focused
    const matStr = materials.slice(0, 3).join(" & ")
    const base = `${title} in ${matStr}${suffix}`
    if (base.length >= 140 && base.length <= 160) return base

    // If too short, pad with brand tagline
    if (base.length < 140) {
      const padded = `Shop the ${title} in ${matStr}${suffix}`
      return padded.length <= 160 ? padded : base
    }

    // If too long, trim materials
    const firstMat = materials[0]
    const shorter = `${title} in ${firstMat}${suffix}`
    return shorter.length <= 160 ? shorter : shorter.slice(0, 157) + "..."
  }

  // No materials — use title + brand
  const base = `Shop the ${title} — handcrafted fine jewelry by ${brand}. Discover luxury pieces at elowen.co.in.`
  if (base.length <= 160) return base
  return base.slice(0, 157) + "..."
}
