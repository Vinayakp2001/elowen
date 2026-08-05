import { defineField, defineType } from "sanity"

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "sku", title: "SKU", type: "string", validation: (r) => r.required() }),
    defineField({ name: "price", title: "Price", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "compareAtPrice", title: "Compare At Price", type: "number" }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "collection",
      title: "Collection",
      type: "reference",
      to: [{ type: "collection" }],
    }),
    defineField({
      name: "materials",
      title: "Materials",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Option Name", type: "string" },
            { name: "values", title: "Values", type: "array", of: [{ type: "string" }] },
          ],
        },
      ],
    }),
    defineField({ name: "description", title: "Description", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "craftsmanship", title: "Craftsmanship", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "isNew", title: "New Arrival", type: "boolean", initialValue: false }),
    defineField({ name: "isFeatured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "inStock", title: "In Stock", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "title", media: "images.0", price: "price" },
    prepare({ title, media, price }) {
      return { title, subtitle: `$${price}`, media }
    },
  },
})
