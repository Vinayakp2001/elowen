/**
 * Seed entry point.
 *
 * Boots Payload via the app's own config (@payload-config), runs the seed
 * orchestrator, prints the per-collection summary, and sets the process exit
 * code (0 on success, non-zero on fatal error or recorded fatal outcome).
 *
 * Run with: `payload run src/seed/index.ts`. The `payload run` CLI evaluates
 * this module and awaits its top-level promises, so the seed logic runs at the
 * top level (not inside a fire-and-forget callback, which races the CLI's
 * process lifecycle and can exit before anything prints).
 *
 * See seed-payload-cms design.md → Entry point. Req 10.1, 10.2.
 */
import { getPayload } from "payload"
import config from "@payload-config"
import { seed } from "./seed"

console.log("[seed] starting")

const payload = await getPayload({ config })

try {
  const report = await seed(payload)
  report.print()
  if (report.hasFatal) {
    process.exitCode = 1
  }
} catch (err) {
  console.error("[seed] fatal:", err)
  process.exitCode = 1
} finally {
  // Close the DB pool so the process exits cleanly instead of hanging.
  try {
    await payload.db.destroy?.()
  } catch {
    // ignore teardown errors
  }
}

console.log("[seed] done")
