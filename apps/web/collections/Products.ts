import type { CollectionConfig } from "payload"

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export const Products: CollectionConfig = {
  slug: "products",
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = toSlug(data.title)
        }
        return data
      },
    ],
  },
  access: {
    read: () => true,
  },
  admin: {
    components: {
      beforeListTable: [
        {
          path: "@/components/admin/AssignNavItemAction#AssignNavItemAction",
        },
      ],
    },
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
      admin: {
        hidden: true,
      },
    },
    {
      name: "sku",
      type: "text",
    },
    {
      name: "price",
      type: "number",
      required: true,
    },
    {
      name: "compareAtPrice",
      type: "number",
    },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
    },
    {
      name: "collection",
      type: "relationship",
      relationTo: "collections",
    },
    {
      name: "materials",
      type: "array",
      fields: [
        {
          name: "material",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "options",
      type: "array",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "values",
          type: "array",
          fields: [
            {
              name: "value",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "craftsmanship",
      type: "richText",
    },
    {
      name: "isNew",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "inStock",
      type: "checkbox",
      defaultValue: true,
    },
  ],
}
