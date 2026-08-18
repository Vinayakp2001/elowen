"use client"

import React, { useEffect, useState } from "react"
import { useSelection } from "@payloadcms/ui"
import { toast } from "sonner"

interface NavItem {
  id: string
  label: string
  slug: string
  products?: Array<{ id: string } | string>
}

export function AssignNavItemAction() {
  const { selectedIDs } = useSelection()
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [selectedNavId, setSelectedNavId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const defaults: NavItem[] = [
      { id: "default-new-arrivals", label: "New Arrivals", slug: "new-arrivals" },
      { id: "default-rings", label: "Rings", slug: "rings" },
      { id: "default-necklaces", label: "Necklaces", slug: "necklaces" },
      { id: "default-earrings", label: "Earrings", slug: "earrings" },
    ]
    fetch("/api/nav-items?limit=100&depth=0")
      .then((r) => r.json())
      .then((data) => {
        const cmsItems: NavItem[] = data?.docs ?? []
        const cmsslugs = new Set(cmsItems.map((i) => i.slug))
        // Show CMS items first, then any defaults not already covered
        const merged = [
          ...cmsItems,
          ...defaults.filter((d) => !cmsslugs.has(d.slug)),
        ]
        setNavItems(merged)
      })
      .catch(() => setNavItems(defaults))
  }, [])

  const hasSelection = selectedIDs.length > 0

  async function handleAssign() {
    if (!selectedNavId) {
      toast.error("Please select a nav item first.")
      return
    }
    setLoading(true)
    try {
      let navId = selectedNavId

      // If this is a default (not yet in CMS), create it first
      if (selectedNavId.startsWith("default-")) {
        const defaultItem = navItems.find((n) => n.id === selectedNavId)
        if (!defaultItem) throw new Error("Nav item not found")
        const createRes = await fetch("/api/nav-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: defaultItem.label, slug: defaultItem.slug, order: 0 }),
        })
        const created = await createRes.json()
        navId = created.doc?.id ?? created.id
        // Update local state so label lookup works
        setNavItems((prev) =>
          prev.map((n) => (n.id === selectedNavId ? { ...n, id: String(navId) } : n))
        )
        setSelectedNavId(String(navId))
      }

      // Fetch the nav item's current products list
      const res = await fetch(`/api/nav-items/${navId}?depth=0`)
      const navItem: NavItem = await res.json()
      const existing = (navItem.products ?? []).map((p) =>
        typeof p === "string" ? p : p.id
      )
      // Merge existing + newly selected, deduplicated
      const merged = Array.from(new Set([...existing, ...selectedIDs.map(String)]))
      // PATCH the nav item with the merged products list
      await fetch(`/api/nav-items/${navId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: merged }),
      })
      toast.success(`Added ${selectedIDs.length} product(s) to "${navItems.find((n) => n.id === selectedNavId)?.label}".`)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!hasSelection) return null

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 8px" }}>
      <span style={{ fontSize: "0.8rem", color: "var(--theme-elevation-400)" }}>
        {selectedIDs.length} selected — assign to nav:
      </span>
      <select
        value={selectedNavId}
        onChange={(e) => setSelectedNavId(e.target.value)}
        style={{
          padding: "4px 8px",
          fontSize: "0.8rem",
          borderRadius: "4px",
          border: "1px solid var(--theme-elevation-200)",
          background: "var(--theme-bg)",
          color: "var(--theme-text)",
          cursor: "pointer",
        }}
      >
        <option value="">-- Select nav item --</option>
        {navItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={loading || !selectedNavId}
        style={{
          padding: "4px 12px",
          fontSize: "0.8rem",
          borderRadius: "4px",
          border: "none",
          background: loading || !selectedNavId ? "var(--theme-elevation-200)" : "var(--theme-success-500, #22c55e)",
          color: loading || !selectedNavId ? "var(--theme-elevation-500)" : "#fff",
          cursor: loading || !selectedNavId ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {loading ? "Assigning…" : "Assign"}
      </button>
    </div>
  )
}
