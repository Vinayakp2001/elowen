import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "public/media",
    staticURL: "/media",
    // Lets CMS users mark the "keep in frame" point on each image.
    // The hero uses this so any future upload crops correctly on mobile.
    focalPoint: true,
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
