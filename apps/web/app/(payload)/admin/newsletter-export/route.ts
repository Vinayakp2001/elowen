import { NextResponse } from "next/server"
import { headers as nextHeaders } from "next/headers"
import { getPayload } from "payload"
import config from "@payload-config"
import { fetchNewsletterCsv } from "@/lib/admin/api"

/**
 * Server-only CSV export proxy for the Newsletter admin view.
 *
 * Verifies the caller has a valid Payload admin session, then fetches the CSV
 * from the FastAPI admin endpoint server-to-server (so ADMIN_API_TOKEN never
 * leaves the server) and streams it to the browser as a download.
 */
export async function GET() {
  // Require an authenticated Payload admin session.
  const payload = await getPayload({ config })
  const reqHeaders = await nextHeaders()
  const { user } = await payload.auth({ headers: reqHeaders })
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await fetchNewsletterCsv()
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  const filename = `newsletter-signups-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(result.data, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
