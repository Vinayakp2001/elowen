import React from "react"
import type { AdminViewServerProps } from "payload"
import { DefaultTemplate } from "@payloadcms/next/templates"
import { Gutter } from "@payloadcms/ui"
import { fetchOrderDetail, type OrderDetail } from "@/lib/admin/api"
import { AdminPanel, formatDateTime, formatMoney } from "./admin-ui"

const BASE_PATH = "/admin/orders-view"

/**
 * Read-only Order detail — nested Payload custom admin view (server component).
 * The order id is the trailing route segment (/admin/orders-view/:id). Fetches
 * GET /admin/orders/{id}; shows "Order not found" on 404. No edit controls.
 */
export default async function OrderDetailView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  // params.segments = ["orders-view", "<id>"] — the id is the segment after the view path.
  const segments = (params?.segments as string[] | undefined) ?? []
  const id = segments[segments.length - 1]

  const result = id ? await fetchOrderDetail(id) : { error: "not_found" as const }

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
        <a href={BASE_PATH} style={{ fontSize: "0.85rem", textDecoration: "underline" }}>
          ← Back to orders
        </a>

        {"error" in result ? (
          <div style={{ marginTop: "1rem" }}>
            <AdminPanel tone={result.error === "not_found" ? "neutral" : "error"}>
              {result.error === "not_found"
                ? "Order not found."
                : "Unable to load this order right now."}
            </AdminPanel>
          </div>
        ) : (
          <OrderDetailBody order={result.data} />
        )}
      </Gutter>
    </DefaultTemplate>
  )
}

function OrderDetailBody({ order }: { order: OrderDetail }) {
  const addr = order.shipping_address as Record<string, unknown> | null

  return (
    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ margin: 0 }}>Order {order.phonepe_order_id ?? order.id}</h1>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>Summary</h2>
        <Field label="Status" value={order.status} />
        <Field label="Payment method" value={order.payment_method} />
        <Field label="Total" value={formatMoney(order.total_amount, order.currency)} />
        <Field label="Customer email" value={order.customer_email ?? "—"} />
        <Field label="Placed" value={formatDateTime(order.created_at)} />
        <Field label="Last updated" value={formatDateTime(order.updated_at)} />
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>Shipping address</h2>
        {addr && Object.keys(addr).length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {Object.entries(addr).map(([k, v]) => (
              <Field key={k} label={k} value={v == null ? "—" : String(v)} />
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--theme-elevation-500)" }}>No shipping address on file.</p>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>Line items</h2>
        {order.items.length === 0 ? (
          <p style={{ color: "var(--theme-elevation-500)" }}>No line items.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Variant</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Unit price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={`${it.sku}-${idx}`}>
                  <td style={tdStyle}>{it.sku}</td>
                  <td style={tdStyle}>{it.product_name}</td>
                  <td style={tdStyle}>{it.variant_key ?? "—"}</td>
                  <td style={tdStyle}>{it.quantity}</td>
                  <td style={tdStyle}>{formatMoney(it.unit_price, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>Shipment</h2>
        <Field label="Shiprocket order id" value={order.shiprocket_order_id ?? "—"} />
        <Field label="Shiprocket shipment id" value={order.shiprocket_shipment_id ?? "—"} />
        <Field label="AWB code" value={order.awb_code ?? "—"} />
        <Field label="Courier" value={order.courier_name ?? "—"} />
        <Field label="Shipment status" value={order.shipment_status ?? "—"} />
        <Field label="Shipment status at" value={formatDateTime(order.shipment_status_at)} />
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>Payments</h2>
        {order.payments.length === 0 ? (
          <p style={{ color: "var(--theme-elevation-500)" }}>No payment records.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>PhonePe payment id</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>
            <tbody>
              {order.payments.map((p, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{formatMoney(p.amount, order.currency)}</td>
                  <td style={tdStyle}>{p.status ?? "—"}</td>
                  <td style={tdStyle}>{p.phonepe_payment_id ?? "—"}</td>
                  <td style={tdStyle}>{formatDateTime(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.88rem", padding: "0.15rem 0" }}>
      <span style={{ minWidth: "180px", color: "var(--theme-elevation-500)" }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  padding: "1.25rem",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "6px",
  background: "var(--theme-elevation-50)",
}
const cardTitleStyle: React.CSSProperties = {
  margin: "0 0 0.75rem",
  fontSize: "1rem",
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
