import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "public/media",
    staticURL: "/media",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
  ],
}
