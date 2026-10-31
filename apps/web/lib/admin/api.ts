import "server-only"

/**
 * Server-only helper for the FastAPI read-only admin endpoints.
 *
 * Runs exclusively on the Next.js server inside the authenticated Payload admin
 * shell. It attaches the shared admin secret (`x-admin-token`) and talks to the
 * internal FastAPI container URL server-to-server, so neither the token nor the
 * customer PII it fetches is ever exposed to the client bundle.
 *
 * Every call returns a safe `{ data } | { error }` result — it never throws, so
 * server components can render a non-fatal "unable to load" panel instead of
 * crashing the admin page.
 */

// Internal FastAPI base URL. Prod: http://api:8000 (container network).
// Local: http://localhost:8000. The `/api` nginx prefix is NOT used here —
// these are server-to-server calls that bypass nginx entirely.
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8000"

// = the existing Shiprocket webhook token value (settings.shiprocket_webhook_token).
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? process.env.SHIPROCKET_WEBHOOK_TOKEN ?? ""

export interface OrderListItem {
  id: string
  phonepe_order_id: string | null
  status: string
  payment_method: string
  total_amount: string
  currency: string
  customer_email: string | null
  awb_code: string | null
  shipment_status: string | null
  created_at: string
}

export interface OrderListResponse {
  total: number
  page: number
  page_size: number
  orders: OrderListItem[]
}

export interface OrderItemRow {
  sku: string
  variant_key: string | null
  product_name: string
  quantity: number
  unit_price: string
}

export interface OrderPaymentRow {
  amount: string | null
  status: string | null
  phonepe_payment_id: string | null
  created_at: string
}

export interface OrderDetail extends OrderListItem {
  shipping_address: Record<string, unknown> | null
  shiprocket_order_id: string | null
  shiprocket_shipment_id: string | null
  courier_name: string | null
  shipment_status_at: string | null
  updated_at: string
  items: OrderItemRow[]
  payments: OrderPaymentRow[]
}

export interface NewsletterItem {
  email: string
  created_at: string
}

export interface NewsletterListResponse {
  total: number
  page: number
  page_size: number
  signups: NewsletterItem[]
}

export type AdminResult<T> = { data: T; error?: never } | { data?: never; error: string }

async function adminFetch<T>(path: string): Promise<AdminResult<T>> {
  if (!ADMIN_API_TOKEN) {
    return { error: "Admin API token is not configured." }
  }
  try {
    const res = await fetch(`${API_INTERNAL_URL}${path}`, {
      headers: { "x-admin-token": ADMIN_API_TOKEN },
      cache: "no-store",
    })
    if (res.status === 404) return { error: "not_found" }
    if (!res.ok) return { error: `Request failed (${res.status}).` }
    const data = (await res.json()) as T
    return { data }
  } catch {
    return { error: "Unable to reach the data service." }
  }
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v))
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

export function fetchOrders(opts: {
  page?: number
  pageSize?: number
  status?: string
  q?: string
}): Promise<AdminResult<OrderListResponse>> {
  const query = buildQuery({
    page: opts.page,
    page_size: opts.pageSize,
    status: opts.status,
    q: opts.q,
  })
  return adminFetch<OrderListResponse>(`/admin/orders${query}`)
}

export function fetchOrderDetail(id: string): Promise<AdminResult<OrderDetail>> {
  return adminFetch<OrderDetail>(`/admin/orders/${encodeURIComponent(id)}`)
}

export function fetchNewsletter(opts: {
  page?: number
  pageSize?: number
}): Promise<AdminResult<NewsletterListResponse>> {
  const query = buildQuery({ page: opts.page, page_size: opts.pageSize })
  return adminFetch<NewsletterListResponse>(`/admin/newsletter${query}`)
}

/** Server-to-server CSV fetch for the export proxy route. Returns raw text. */
export async function fetchNewsletterCsv(): Promise<AdminResult<string>> {
  if (!ADMIN_API_TOKEN) return { error: "Admin API token is not configured." }
  try {
    const res = await fetch(`${API_INTERNAL_URL}/admin/newsletter/export`, {
      headers: { "x-admin-token": ADMIN_API_TOKEN },
      cache: "no-store",
    })
    if (!res.ok) return { error: `Request failed (${res.status}).` }
    const data = await res.text()
    return { data }
  } catch {
    return { error: "Unable to reach the data service." }
  }
}
