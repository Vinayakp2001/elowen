import type { CollectionConfig } from "payload"

export const NavItems: CollectionConfig = {
  slug: "nav-items",
  admin: {
    useAsTitle: "label",
    description: "Define the navigation bar links shown in the site header.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: {
        description: "Display label shown in the nav bar (e.g. Rings, Necklaces)",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL slug for this nav item (e.g. rings → /nav/rings)",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Display order in the nav bar (lower = first)",
      },
    },
    {
      name: "products",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: "relationship" as any,
      relationTo: "products",
      hasMany: true,
      admin: {
        description: "Products shown under this nav bar item. You can also assign from the product edit page.",
      },
    },
  ],
}

