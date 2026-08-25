import type { Metadata } from "next"
import RegisterClient from "./register-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return <RegisterClient />
}
