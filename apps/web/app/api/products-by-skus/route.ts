import { NextRequest, NextResponse } from "next/server"
import { getProductsBySkus } from "@/lib/payload/queries"

export async function GET(req: NextRequest) {
  const skusParam = req.nextUrl.searchParams.get("skus")
  if (!skusParam) return NextResponse.json([])

  const skus = skusParam.split(",").map((s) => s.trim()).filter(Boolean)
  const products = await getProductsBySkus(skus)

  const result = products
    .filter(Boolean)
    .map((p: any) => ({
      sku: p.sku,
      title: p.title,
      price: p.price,
      imageUrl: p.images?.[0]?.url ?? "",
      slug: p.slug?.current ?? "",
    }))

  return NextResponse.json(result)
}
