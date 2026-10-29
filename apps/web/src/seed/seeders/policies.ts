/**
 * seedPolicies — create policy documents keyed by slug with Lexical `body`
 * (Req 7). Slugs match the storefront footer /policies/[slug] links.
 */
import type { Payload } from "payload"
import type { SeedReport } from "../report"
import { findOrCreate } from "../upsert"
import { richText } from "../lexical"
import { policies } from "../data/policies"

export async function seedPolicies(
  payload: Payload,
  report: SeedReport,
): Promise<void> {
  for (const policy of policies) {
    await findOrCreate({
      payload,
      collection: "policies",
      where: { slug: { equals: policy.slug } },
      data: {
        title: policy.title,
        slug: policy.slug,
        body: richText(...policy.body),
      },
      report,
      label: "policies",
    })
  }
}
