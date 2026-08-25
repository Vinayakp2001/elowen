import type { Metadata } from "next"
import AccountClient from "./account-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AccountPage() {
  return <AccountClient />
}
