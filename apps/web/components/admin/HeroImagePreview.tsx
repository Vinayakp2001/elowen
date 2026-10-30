"use client"

import React, { useEffect, useState } from "react"
import { useFormFields } from "@payloadcms/ui"

type Mode = "desktop" | "mobile"

/**
 * Admin-only, display-only preview of how the homepage hero image will be
 * cropped on Desktop vs Mobile. It mirrors the live crop rules used in
 * `components/content/hero-section.tsx`:
 *   object-cover + (desktop) object-left-top / (mobile) object-center
 *
 * It reads the currently-selected `hero.image` media id from live form state
 * (updates before save), resolves it to a URL via Payload REST, and renders it
 * inside a Desktop and a Mobile frame. It never writes any field or the DB.
 */
export function HeroImagePreview() {
  const [mode, setMode] = useState<Mode>("desktop")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fetchFailed, setFetchFailed] = useState(false)

  // Subscribe to the live value of hero.image (the media document id).
  const mediaId = useFormFields(([fields]) => {
    const v = fields?.["hero.image"]?.value
    return typeof v === "object" && v !== null ? (v as { id?: string | number }).id : v
  }) as string | number | undefined | null

  useEffect(() => {
    let cancelled = false

    if (mediaId === undefined || mediaId === null || mediaId === "") {
      setImageUrl(null)
      setFetchFailed(false)
      return
    }

    setFetchFailed(false)
    fetch(`/api/media/${mediaId}?depth=0`)
      .then((r) => {
        if (!r.ok) throw new Error("media fetch failed")
        return r.json()
      })
      .then((doc) => {
        if (cancelled) return
        setImageUrl(typeof doc?.url === "string" ? doc.url : null)
      })
      .catch(() => {
        if (cancelled) return
        setImageUrl(null)
        setFetchFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [mediaId])

  const isDesktop = mode === "desktop"

  const frameStyle: React.CSSProperties = isDesktop
    ? { width: "100%", maxWidth: 640, aspectRatio: "16 / 9" }
    : { width: "100%", maxWidth: 240, aspectRatio: "9 / 16" }

  const toggleButton = (value: Mode, label: string): React.CSSProperties => ({
    padding: "6px 14px",
    fontSize: "0.8rem",
    borderRadius: "4px",
    border: "1px solid var(--theme-elevation-200)",
    background: mode === value ? "var(--theme-elevation-150)" : "var(--theme-bg)",
    color: "var(--theme-text)",
    fontWeight: mode === value ? 600 : 400,
    cursor: "pointer",
    transition: "background 0.15s",
  })

  return (
    <div style={{ marginTop: "8px", marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "0.8rem",
          color: "var(--theme-elevation-400)",
          marginBottom: "8px",
        }}
      >
        Crop preview — how this image will appear on each device:
      </div>

      {/* Desktop / Mobile toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button type="button" onClick={() => setMode("desktop")} style={toggleButton("desktop", "Desktop")}>
          Desktop
        </button>
        <button type="button" onClick={() => setMode("mobile")} style={toggleButton("mobile", "Mobile")}>
          Mobile
        </button>
      </div>

      {/* Active frame */}
      <div
        style={{
          ...frameStyle,
          position: "relative",
          overflow: "hidden",
          background: "var(--theme-elevation-100)",
          border: "1px solid var(--theme-elevation-200)",
          borderRadius: "4px",
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Hero crop preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: isDesktop ? "left top" : "center",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "16px",
              fontSize: "0.8rem",
              color: "var(--theme-elevation-400)",
            }}
          >
            {fetchFailed ? "Preview unavailable" : "Upload a hero image to preview"}
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--theme-elevation-400)",
          marginTop: "8px",
        }}
      >
        Tip: keep the main subject centered — mobile crops to the center, so anything near the edges may be cut off.
      </p>
    </div>
  )
}
