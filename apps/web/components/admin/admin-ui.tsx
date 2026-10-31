import React from "react"

/** Small shared presentational helpers for the read-only admin views. */

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatMoney(amount: string | null, currency: string): string {
  if (amount == null) return "—"
  const num = Number(amount)
  const code = (currency || "inr").toUpperCase()
  if (isNaN(num)) return `${amount} ${code}`
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: code }).format(num)
  } catch {
    return `${num.toFixed(2)} ${code}`
  }
}

export function AdminPanel({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "error"
}) {
  const borderColor =
    tone === "error" ? "var(--theme-error-500, #ef4444)" : "var(--theme-elevation-150)"
  return (
    <div
      style={{
        padding: "1.5rem",
        border: `1px solid ${borderColor}`,
        borderRadius: "6px",
        background: "var(--theme-elevation-50)",
        color: "var(--theme-text)",
        fontSize: "0.9rem",
      }}
    >
      {children}
    </div>
  )
}
