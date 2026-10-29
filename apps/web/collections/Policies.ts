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
      admin: {
        description:
          "Optional single rich-text body. Use this OR the Sections below. Sections take priority if both are filled.",
      },
    },
    {
      name: "sections",
      type: "array",
      admin: {
        description:
          "Structured sections (heading + rich text). Matches the default policy page layout. If empty, the single Body field above is used.",
      },
      fields: [
        {
          name: "heading",
          type: "text",
          required: true,
        },
        {
          name: "body",
          type: "richText",
          required: true,
        },
      ],
    },
  ],
}
