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
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: {
            description:
              "Recommended: at least 2400×1600px, landscape ~3:2 aspect ratio. " +
              "After uploading, open the image and drag the FOCAL POINT (crosshair) " +
              "onto the main subject (e.g. the face/jewelry) — the hero crops around " +
              "that point, so it stays in frame on both mobile and desktop. " +
              "Keep the file size small, as the hero image is served unoptimized " +
              "and large files slow the homepage.",
          },
        },
        {
          name: "heroPreview",
          type: "ui",
          admin: {
            components: {
              Field: "/components/admin/HeroImagePreview#HeroImagePreview",
            },
          },
        },
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
