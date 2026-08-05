interface PayloadUpload {
  url?: string | null
  alt?: string | null
  filename?: string | null
}

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"

/**
 * Returns the public URL for a Payload upload object.
 *
 * Payload serves media at /api/media/file/<filename> via its own route handler.
 * We strip the origin to get a relative path, then decode any double-encoded
 * percent signs (e.g. %2520 → %20) that cause Next.js image optimizer 400 errors.
 */
export function getImageUrl(image: PayloadUpload | null | undefined): string {
  if (!image?.url) return ""

  let url = image.url

  // Strip server origin to produce a relative path
  if (url.startsWith(SERVER_URL)) {
    url = url.slice(SERVER_URL.length)
  }

  // Fix double-encoded URLs: %2520 → %20, %252F → %2F, etc.
  // This happens when filenames with spaces/special chars get double-encoded
  try {
    const decoded = decodeURIComponent(url)
    // Only use decoded version if it actually changed (i.e. was double-encoded)
    if (decoded !== url) {
      url = decoded
    }
  } catch {
    // If decoding fails, use as-is
  }

  return url
}
