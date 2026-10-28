import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Elowen Fine Jewelry"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FDFAF5",
          position: "relative",
        }}
      >
        {/* Subtle border frame */}
        <div
          style={{
            position: "absolute",
            inset: "32px",
            border: "1px solid #E8D9C0",
            display: "flex",
          }}
        />

        {/* Corner accents */}
        <div style={{ position: "absolute", top: "48px", left: "48px", width: "24px", height: "24px", borderTop: "1px solid #B8975A", borderLeft: "1px solid #B8975A", display: "flex" }} />
        <div style={{ position: "absolute", top: "48px", right: "48px", width: "24px", height: "24px", borderTop: "1px solid #B8975A", borderRight: "1px solid #B8975A", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "48px", left: "48px", width: "24px", height: "24px", borderBottom: "1px solid #B8975A", borderLeft: "1px solid #B8975A", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "48px", right: "48px", width: "24px", height: "24px", borderBottom: "1px solid #B8975A", borderRight: "1px solid #B8975A", display: "flex" }} />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Brand name */}
          <div
            style={{
              fontSize: "80px",
              fontWeight: "300",
              color: "#2C2C2C",
              letterSpacing: "0.15em",
              fontFamily: "serif",
              lineHeight: 1,
            }}
          >
            ELOWEN
          </div>

          {/* Divider */}
          <div
            style={{
              width: "60px",
              height: "1px",
              backgroundColor: "#B8975A",
              display: "flex",
            }}
          />

          {/* Tagline */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: "300",
              color: "#8C7B6B",
              letterSpacing: "0.25em",
              fontFamily: "sans-serif",
              textTransform: "uppercase",
            }}
          >
            Fine Jewelry
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: "14px",
              color: "#C9B99A",
              letterSpacing: "0.1em",
              fontFamily: "sans-serif",
              marginTop: "8px",
            }}
          >
            elowen.co.in
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
