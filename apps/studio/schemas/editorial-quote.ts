import { defineField, defineType } from "sanity"

export const editorialQuote = defineType({
  name: "editorialQuote",
  title: "Editorial Quote",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "text", validation: (r) => r.required() }),
    defineField({ name: "attribution", title: "Attribution", type: "string" }),
  ],
})
