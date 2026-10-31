import React from "react"

/**
 * Extra admin nav links for the read-only custom views (Orders, Newsletter).
 * Rendered via admin.components.afterNavLinks. Grouped under "Shop" and
 * "Marketing" headings to match Payload's native grouped-nav look.
 */
export default function AdminNavLinks() {
  return (
    <React.Fragment>
      <NavGroup label="Shop">
        <NavLink href="/admin/orders-view" label="Orders" />
      </NavGroup>
      <NavGroup label="Marketing">
        <NavLink href="/admin/newsletter-view" label="Newsletter Signups" />
      </NavGroup>
    </React.Fragment>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <div
        style={{
          padding: "0.5rem 1rem 0.25rem",
          fontSize: "0.6875rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--theme-elevation-400)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        padding: "0.5rem 1rem",
        color: "var(--theme-elevation-800)",
        textDecoration: "none",
        fontSize: "0.9rem",
      }}
    >
      {label}
    </a>
  )
}
