import type { CollectionConfig } from "payload"

export const Policies: CollectionConfig = {
  slug: "policies",
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
    },
    {
      name: "body",
      type: "richText",
    },
  ],
}
