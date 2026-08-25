import type { Metadata } from "next"
import CallbackClient from "./callback-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthCallbackPage() {
  return <CallbackClient />
}
