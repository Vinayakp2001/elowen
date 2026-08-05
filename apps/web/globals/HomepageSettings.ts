import type { GlobalConfig } from "payload"

export const HomepageSettings: GlobalConfig = {
  slug: "homepage-settings",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        { name: "headline", type: "text" },
        { name: "subline", type: "text" },
        { name: "ctaLabel", type: "text" },
        { name: "ctaHref", type: "text" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "featuredCategories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
    },
    {
      name: "signatureProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "campaignBanner",
      type: "group",
      fields: [
        { name: "image", type: "upload", relationTo: "media" },
        { name: "headline", type: "text" },
        { name: "ctaLabel", type: "text" },
        { name: "ctaHref", type: "text" },
      ],
    },
    {
      name: "featuredProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "brandStory",
      type: "group",
      fields: [
        { name: "image", type: "upload", relationTo: "media" },
        { name: "headline", type: "text" },
        { name: "body", type: "richText" },
      ],
    },
    {
      name: "newsletterHeadline",
      type: "text",
    },
  ],
}
