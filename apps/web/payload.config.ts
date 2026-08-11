import path from "path"
import { fileURLToPath } from "url"
import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { Users } from "./collections/Users"
import { Products } from "./collections/Products"
import { Categories } from "./collections/Categories"
import { Collections } from "./collections/Collections"
import { Policies } from "./collections/Policies"
import { Media } from "./collections/Media"
import { NavItems } from "./collections/NavItems"
import { HomepageSettings } from "./globals/HomepageSettings"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
  secret: process.env.PAYLOAD_SECRET ?? "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL,
    },
  }),
  editor: lexicalEditor({}),
  collections: [Users, NavItems, Products, Categories, Collections, Policies, Media],
  globals: [HomepageSettings],
  admin: {
    user: "users",
    importMap: {
      baseDir: dirname,
      importMapFile: path.resolve(dirname, "app/(payload)/admin/importMap.js"),
    },
  },
  typescript: {
    outputFile: "./payload-types.ts",
  },
})
