"use client"
// Patched CodeEditor that guards against useMonaco() returning null on first render.
// Replaces @payloadcms/ui/elements/CodeEditor via webpack alias.

import React, { useEffect, useRef } from "react"

interface CodeEditorProps {
  value?: string
  onChange?: (value: string | undefined) => void
  language?: string
  height?: number | string
  readOnly?: boolean
  className?: string
  [key: string]: unknown
}

// Lazy-load the real CodeEditor only after Monaco is ready
let RealCodeEditor: React.ComponentType<CodeEditorProps> | null = null

export function CodeEditor(props: CodeEditorProps) {
  const [ready, setReady] = React.useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    // Dynamically import Monaco-dependent editor only on client after mount
    import("@monaco-editor/react").then(() => {
      if (mountedRef.current) {
        // Now safe to load Payload's CodeEditor
        import("@payloadcms/ui/elements/CodeEditor")
          .then((mod) => {
            RealCodeEditor = mod.CodeEditor ?? mod.default
            if (mountedRef.current) setReady(true)
          })
          .catch(() => setReady(false))
      }
    }).catch(() => {
      // Monaco not available, skip
    })
    return () => { mountedRef.current = false }
  }, [])

  if (!ready || !RealCodeEditor) {
    // Render a plain textarea fallback while Monaco loads
    return (
      <textarea
        value={props.value ?? ""}
        onChange={(e) => props.onChange?.(e.target.value)}
        readOnly={props.readOnly}
        className={props.className}
        style={{
          width: "100%",
          minHeight: typeof props.height === "number" ? props.height : 120,
          fontFamily: "monospace",
          fontSize: 13,
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: 4,
          resize: "vertical",
          background: "#1e1e1e",
          color: "#d4d4d4",
        }}
      />
    )
  }

  return <RealCodeEditor {...props} />
}

export default CodeEditor
