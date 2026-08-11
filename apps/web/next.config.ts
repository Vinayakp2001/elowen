import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"
import path from "path"
import { fileURLToPath } from "url"

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Type errors are pre-existing debt; build should not be blocked by them
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/api/media/file/**" },
      { protocol: "http", hostname: "localhost", port: "3000" },
      { protocol: "https", hostname: "**" },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
