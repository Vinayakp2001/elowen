/**
 * Idempotency helpers shared by all seeders.
 *
 * - findOrCreate: look up a document by a unique field (slug / email); reuse
 *   it if present, otherwise create it. Per-document errors are caught,
 *   logged, recorded as "failed", and swallowed so the run continues (Req
 *   9.2, 9.3).
 * - ensureMedia: look up existing media by a stable key, upload from a local
 *   asset file when absent, and return null (logged, non-fatal) when the asset
 *   file is missing (Req 2.3, 2.4).
 *
 * See seed-payload-cms design.md → Core idempotency helpers.
 */
import { existsSync } from "fs"
import type { CollectionSlug, Payload, Where } from "payload"
import type { SeedReport } from "./report"

export interface FindOrCreateArgs {
  payload: Payload
  collection: CollectionSlug
  /** Unique-field query, e.g. { slug: { equals: "rings" } } */
  where: Where
  data: Record<string, unknown>
  report: SeedReport
  /** Label for logging + the summary (usually the collection slug). */
  label: string
}

export interface FindOrCreateResult {
  /** The id of the found-or-created document, or null when the op failed. */
  id: number | null
  created: boolean
}

/**
 * Find a document by its unique field; reuse if present, else create.
 * Never throws for per-document failures — logs, records "failed", returns
 * { id: null, created: false } so dependent seeders can skip the relationship.
 */
export async function findOrCreate(
  args: FindOrCreateArgs,
): Promise<FindOrCreateResult> {
  const { payload, collection, where, data, report, label } = args

  try {
    const existing = await payload.find({
      collection,
      where,
      limit: 1,
      depth: 0,
    })

    const found = existing.docs[0]
    if (found) {
      report.record(label, "reused")
      return { id: found.id as number, created: false }
    }

    const doc = await payload.create({
      collection,
      // Payload's generated types are per-collection; the seed data is
      // validated at runtime by Payload itself.
      data: data as never,
    })

    report.record(label, "created")
    return { id: doc.id as number, created: true }
  } catch (err) {
    report.record(label, "failed")
    console.error(
      `[seed] ${label}: failed to upsert (${JSON.stringify(where)}):`,
      err instanceof Error ? err.message : err,
    )
    return { id: null, created: false }
  }
}

export interface EnsureMediaArgs {
  payload: Payload
  /** Stable asset key; also used to find an existing media doc (via alt). */
  key: string
  /** Absolute or cwd-relative path to the local asset file. */
  filePath: string
  alt: string
  report: SeedReport
}

/**
 * Ensure a media document exists for a local asset.
 * Idempotency key is the `alt` text (unique per seed asset). Returns the
 * media id, or null when the asset file is missing or the op fails — dependent
 * seeders treat a null image as "omit that field" (Req 2.4).
 */
export async function ensureMedia(
  args: EnsureMediaArgs,
): Promise<number | null> {
  const { payload, key, filePath, alt, report } = args
  const label = "media"

  try {
    const existing = await payload.find({
      collection: "media",
      where: { alt: { equals: alt } },
      limit: 1,
      depth: 0,
    })

    const found = existing.docs[0]
    if (found) {
      report.record(label, "reused")
      return found.id as number
    }

    if (!existsSync(filePath)) {
      report.record(label, "failed")
      console.error(
        `[seed] media: asset file missing for "${key}" at ${filePath} — skipping (field will be omitted)`,
      )
      return null
    }

    const doc = await payload.create({
      collection: "media",
      data: { alt },
      filePath,
    })

    report.record(label, "created")
    return doc.id as number
  } catch (err) {
    report.record(label, "failed")
    console.error(
      `[seed] media: failed to upsert "${key}":`,
      err instanceof Error ? err.message : err,
    )
    return null
  }
}
