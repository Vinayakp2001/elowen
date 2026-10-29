/**
 * seedMedia — upload every committed placeholder asset and return a
 * Map<assetKey, mediaId> (Req 2). Missing asset files are logged and skipped
 * (ensureMedia returns null); their keys are simply absent from the map, and
 * dependent seeders omit the corresponding field.
 */
import path from "path"
import { fileURLToPath } from "url"
import type { Payload } from "payload"
import type { SeedReport } from "../report"
import { ensureMedia } from "../upsert"
import { media } from "../data/media"

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(dirname, "../assets")

export async function seedMedia(
  payload: Payload,
  report: SeedReport,
): Promise<Map<string, number>> {
  const map = new Map<string, number>()

  for (const asset of media) {
    const id = await ensureMedia({
      payload,
      key: asset.key,
      filePath: path.join(assetsDir, asset.file),
      alt: asset.alt,
      report,
    })
    if (id !== null) {
      map.set(asset.key, id)
    }
  }

  return map
}
