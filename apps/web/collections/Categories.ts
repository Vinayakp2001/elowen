import type { CollectionConfig } from "payload"

export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "URL-safe identifier, e.g. rings" },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
  ],
}
