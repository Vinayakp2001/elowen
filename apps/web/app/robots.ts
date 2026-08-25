import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/account", "/auth", "/wishlist"],
      },
    ],
    sitemap: "https://elowen.co.in/sitemap.xml",
  }
}
