/**
 * seedAdminUser — create the first admin user from env (Req 1).
 *
 * Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD. If either is missing, logs a
 * warning and skips without erroring (Req 1.3). Otherwise reuses an existing
 * user by email or creates one. The password value is never logged (Req 1.4).
 */
import type { Payload } from "payload"
import type { SeedReport } from "../report"
import { findOrCreate } from "../upsert"

export async function seedAdminUser(
  payload: Payload,
  report: SeedReport,
): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    console.warn(
      "[seed] users: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user creation",
    )
    return
  }

  await findOrCreate({
    payload,
    collection: "users",
    where: { email: { equals: email } },
    data: { email, password, name: "Elowen Admin" },
    report,
    label: "users",
  })
}
