/**
 * Generates Payload admin importMap using dynamic ESM imports.
 * Works around Node 24 + tsx ERR_REQUIRE_ASYNC_MODULE when running `payload generate:importmap`.
 */
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

process.chdir(rootDir)

const { loadEnvConfig } = await import("@next/env")
loadEnvConfig(rootDir, true)

const { buildConfig } = await import("payload")
const { sqliteAdapter } = await import("@payloadcms/db-sqlite")
const { lexicalEditor } = await import("@payloadcms/richtext-lexical")

const generateImportMapPath = path.join(
  rootDir,
  "node_modules/payload/dist/bin/generateImportMap/index.js"
)
const { generateImportMap } = await import(pathToFileURL(generateImportMapPath).href)

const { Users } = await import("../collections/Users.ts")
const { Products } = await import("../collections/Products.ts")
const { Categories } = await import("../collections/Categories.ts")
const { Collections } = await import("../collections/Collections.ts")
const { Policies } = await import("../collections/Policies.ts")
const { Media } = await import("../collections/Media.ts")
const { NavItems } = await import("../collections/NavItems.ts")
const { HomepageSettings } = await import("../globals/HomepageSettings.ts")

const importMapFile = path.resolve(rootDir, "app/(payload)/admin/importMap.js")

const config = await buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "importmap-generation-secret",
  db: sqliteAdapter({
    client: {
      url: "file:./payload.db",
    },
  }),
  editor: lexicalEditor({}),
  collections: [Users, NavItems, Products, Categories, Collections, Policies, Media],
  globals: [HomepageSettings],
  admin: {
    user: "users",
    importMap: {
      baseDir: rootDir,
      importMapFile,
    },
  },
})

await generateImportMap(config)
console.log(`Import map written to ${importMapFile}`)
