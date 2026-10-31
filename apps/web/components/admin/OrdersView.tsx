import React from "react"
import type { AdminViewServerProps } from "payload"
import { DefaultTemplate } from "@payloadcms/next/templates"
import { Gutter } from "@payloadcms/ui"
import { fetchOrders } from "@/lib/admin/api"
import { AdminPanel, formatDateTime, formatMoney } from "./admin-ui"

const STATUS_OPTIONS = [
  "",
  "pending",
  "payment_failed",
  "abandoned",
  "paid",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]

const BASE_PATH = "/admin/orders-view"

/**
 * Read-only Orders list — Payload custom admin view (server component).
 * Fetches GET /admin/orders server-side and renders a Payload-styled table with
 * pagination, status filter, and search. Never throws; shows a non-fatal panel
 * on fetch error and a clean empty state.
 */
export default async function OrdersView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const sp = (searchParams ?? {}) as Record<string, string | undefined>
  const page = Math.max(1, Number(sp.page) || 1)
  const pageSize = 25
  const status = sp.status ?? ""
  const q = sp.q ?? ""

  const result = await fetchOrders({ page, pageSize, status, q })

  const buildHref = (overrides: Record<string, string | number>) => {
    const next = new URLSearchParams()
    if (status) next.set("status", status)
    if (q) next.set("q", q)
    next.set("page", String(page))
    for (const [k, v] of Object.entries(overrides)) next.set(k, String(v))
    return `${BASE_PATH}?${next.toString()}`
  }

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
        <h1 style={{ marginBottom: "1rem" }}>Orders</h1>

        <form method="get" action={BASE_PATH} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <select name="status" defaultValue={status} style={selectStyle}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s : "All statuses"}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search email or order reference"
            style={{ ...inputStyle, minWidth: "260px" }}
          />
          <button type="submit" style={primaryBtnStyle}>
            Filter
          </button>
          {(status || q) && (
            <a href={BASE_PATH} style={ghostBtnStyle}>
              Clear
            </a>
          )}
        </form>

        {"error" in result ? (
          <AdminPanel tone="error">Unable to load orders right now. Please try again shortly.</AdminPanel>
        ) : result.data.orders.length === 0 ? (
          <AdminPanel>No orders found.</AdminPanel>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Reference</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Payment</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Shipment</th>
                    <th style={thStyle}>Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.orders.map((o) => (
                    <tr key={o.id}>
                      <td style={tdStyle}>
                        <a href={`${BASE_PATH}/${o.id}`} style={{ color: "var(--theme-text)", textDecoration: "underline" }}>
                          {o.phonepe_order_id ?? o.id}
                        </a>
                      </td>
                      <td style={tdStyle}>{o.status}</td>
                      <td style={tdStyle}>{o.payment_method}</td>
                      <td style={tdStyle}>{formatMoney(o.total_amount, o.currency)}</td>
                      <td style={tdStyle}>{o.customer_email ?? "—"}</td>
                      <td style={tdStyle}>{o.shipment_status ?? o.awb_code ?? "—"}</td>
                      <td style={tdStyle}>{formatDateTime(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={result.data.page}
              pageSize={result.data.page_size}
              total={result.data.total}
              buildHref={buildHref}
            />
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
  buildHref,
}: {
  page: number
  pageSize: number
  total: number
  buildHref: (overrides: Record<string, string | number>) => string
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
      {page > 1 ? (
        <a href={buildHref({ page: page - 1 })} style={ghostBtnStyle}>
          ← Previous
        </a>
      ) : (
        <span style={{ ...ghostBtnStyle, opacity: 0.4 }}>← Previous</span>
      )}
      <span style={{ fontSize: "0.85rem", color: "var(--theme-elevation-500)" }}>
        Page {page} of {totalPages} · {total} total
      </span>
      {page < totalPages ? (
        <a href={buildHref({ page: page + 1 })} style={ghostBtnStyle}>
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
  whiteSpace: "nowrap",
}
const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--theme-elevation-100)",
  whiteSpace: "nowrap",
}
const inputStyle: React.CSSProperties = {
  padding: "0.4rem 0.6rem",
  borderRadius: "4px",
  border: "1px solid var(--theme-elevation-200)",
  background: "var(--theme-input-bg, var(--theme-bg))",
  color: "var(--theme-text)",
}
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" }
const primaryBtnStyle: React.CSSProperties = {
  padding: "0.4rem 1rem",
  borderRadius: "4px",
  border: "none",
  background: "var(--theme-success-500, #22c55e)",
  color: "#fff",
  cursor: "pointer",
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
