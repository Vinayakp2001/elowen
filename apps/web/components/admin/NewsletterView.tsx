import React from "react"
import type { AdminViewServerProps } from "payload"
import { DefaultTemplate } from "@payloadcms/next/templates"
import { Gutter } from "@payloadcms/ui"
import { fetchNewsletter } from "@/lib/admin/api"
import { AdminPanel, formatDateTime } from "./admin-ui"

const BASE_PATH = "/admin/newsletter-view"
const EXPORT_PATH = "/admin/newsletter-export"

/**
 * Read-only Newsletter ("Inner Circle") signups — Payload custom admin view
 * (server component). Fetches GET /admin/newsletter, paginates, renders a clean
 * empty state, and offers a CSV download via the server-only proxy route.
 */
export default async function NewsletterView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const sp = (searchParams ?? {}) as Record<string, string | undefined>
  const page = Math.max(1, Number(sp.page) || 1)
  const pageSize = 25

  const result = await fetchNewsletter({ page, pageSize })

  const hrefForPage = (p: number) => `${BASE_PATH}?page=${p}`

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user ?? undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h1 style={{ margin: 0 }}>Newsletter Signups</h1>
          <a href={EXPORT_PATH} style={downloadBtnStyle}>
            Download CSV
          </a>
        </div>

        {"error" in result ? (
          <AdminPanel tone="error">Unable to load newsletter signups right now.</AdminPanel>
        ) : result.data.signups.length === 0 ? (
          <AdminPanel>No one has joined the Inner Circle yet.</AdminPanel>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Signed up</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.signups.map((s) => (
                    <tr key={s.email}>
                      <td style={tdStyle}>{s.email}</td>
                      <td style={tdStyle}>{formatDateTime(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={result.data.page} pageSize={result.data.page_size} total={result.data.total} hrefForPage={hrefForPage} />
          </>
        )}
      </Gutter>
    </DefaultTemplate>
  )
}

function Pagination({
  page,
  pageSize,
  total,
  hrefForPage,
}: {
  page: number
  pageSize: number
  total: number
  hrefForPage: (p: number) => string
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
      {page > 1 ? (
        <a href={hrefForPage(page - 1)} style={ghostBtnStyle}>
          ← Previous
        </a>
      ) : (
        <span style={{ ...ghostBtnStyle, opacity: 0.4 }}>← Previous</span>
      )}
      <span style={{ fontSize: "0.85rem", color: "var(--theme-elevation-500)" }}>
        Page {page} of {totalPages} · {total} total
      </span>
      {page < totalPages ? (
        <a href={hrefForPage(page + 1)} style={ghostBtnStyle}>
          Next →
        </a>
      ) : (
        <span style={{ ...ghostBtnStyle, opacity: 0.4 }}>Next →</span>
      )}
    </div>
  )
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.85rem",
}
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--theme-elevation-150)",
  color: "var(--theme-elevation-500)",
  fontWeight: 600,
}
const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--theme-elevation-100)",
}
const ghostBtnStyle: React.CSSProperties = {
  padding: "0.4rem 1rem",
  borderRadius: "4px",
  border: "1px solid var(--theme-elevation-200)",
  background: "transparent",
  color: "var(--theme-text)",
  textDecoration: "none",
  display: "inline-block",
}
const downloadBtnStyle: React.CSSProperties = {
  padding: "0.4rem 1rem",
  borderRadius: "4px",
  border: "none",
  background: "var(--theme-success-500, #22c55e)",
  color: "#fff",
  textDecoration: "none",
  display: "inline-block",
}
