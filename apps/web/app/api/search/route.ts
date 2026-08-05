import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@payload-config"
import { getImageUrl } from "@/lib/payload/image"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  try {
    const payload = await getPayload({ config })

    const [productsRes, collectionsRes] = await Promise.all([
      payload.find({
        collection: "products",
        where: {
          or: [
            { title: { contains: q } },
            { sku: { contains: q } },
          ],
        },
        limit: 6,
        depth: 1,
      }),
      payload.find({
        collection: "collections",
        where: {
          title: { contains: q },
        },
        limit: 3,
        depth: 1,
      }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = productsRes.docs.map((doc: any) => ({
      type: "product",
      title: doc.title as string,
      slug: doc.slug as string,
      imageUrl: doc.images?.[0]
        ? getImageUrl(doc.images[0].image ?? doc.images[0])
        : undefined,
      price: doc.price as number,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collections = collectionsRes.docs.map((doc: any) => ({
      type: "collection",
      title: doc.title as string,
      slug: doc.slug as string,
      imageUrl: doc.heroImage ? getImageUrl(doc.heroImage) : undefined,
    }))

    return NextResponse.json([...products, ...collections])
  } catch {
    return NextResponse.json([])
  }
}
