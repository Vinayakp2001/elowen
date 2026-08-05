import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPolicyBySlug } from "@/lib/payload/queries"
import { RichText } from "@/components/ui/rich-text"

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const policy = await getPolicyBySlug(slug).catch(() => null)
  if (!policy) return {}
  return { title: policy.title }
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  const policy = await getPolicyBySlug(slug).catch(() => null)
  if (!policy) notFound()

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] mb-10">{policy.title}</h1>
        {policy.body ? (
          <RichText content={policy.body as Record<string, unknown>} />
        ) : null}
      </div>
    </div>
  )
}
