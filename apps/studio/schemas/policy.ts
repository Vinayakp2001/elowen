import { defineField, defineType } from "sanity"

export const policy = defineType({
  name: "policy",
  title: "Policy",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }] }),
  ],
})
