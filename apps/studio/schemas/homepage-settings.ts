import { defineField, defineType } from "sanity"

export const homepageSettings = defineType({
  name: "homepageSettings",
  title: "Homepage Settings",
  type: "document",
  __experimental_actions: ["update", "publish"],
  fields: [
    defineField({
      name: "hero",
      title: "Hero Section",
      type: "object",
      fields: [
        { name: "headline", title: "Headline", type: "string" },
        { name: "subline", title: "Subline", type: "string" },
        { name: "ctaLabel", title: "CTA Label", type: "string" },
        { name: "ctaHref", title: "CTA Link", type: "string" },
        { name: "image", title: "Image", type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "featuredCategories",
      title: "Featured Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "signatureProducts",
      title: "Signature Products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "campaignBanner",
      title: "Campaign Banner",
      type: "object",
      fields: [
        { name: "image", title: "Image", type: "image", options: { hotspot: true } },
        { name: "headline", title: "Headline", type: "string" },
        { name: "ctaLabel", title: "CTA Label", type: "string" },
        { name: "ctaHref", title: "CTA Link", type: "string" },
      ],
    }),
    defineField({
      name: "featuredProducts",
      title: "Featured Products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "brandStory",
      title: "Brand Story Section",
      type: "object",
      fields: [
        { name: "image", title: "Image", type: "image", options: { hotspot: true } },
        { name: "headline", title: "Headline", type: "string" },
        { name: "body", title: "Body", type: "array", of: [{ type: "block" }] },
      ],
    }),
    defineField({ name: "newsletterHeadline", title: "Newsletter Headline", type: "string" }),
  ],
})
