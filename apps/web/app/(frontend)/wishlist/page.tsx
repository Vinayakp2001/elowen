import type { Metadata } from "next"
import { WishlistClient } from "./wishlist-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function WishlistPage() {
  // We can't read Zustand on the server, so we render the client shell
  // which handles fetching product data via a server action
  return <WishlistClient />
}
