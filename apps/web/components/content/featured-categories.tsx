import Image from "next/image"
import Link from "next/link"

interface Category {
  _id: string
  title: string
  slug: { current: string }
  image?: { url: string; alt?: string }
}

interface FeaturedCategoriesProps {
  categories: Category[]
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (!categories?.length) return null

  return (
    <section className="w-full py-16 md:py-20 bg-[#FDFAF5]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Section label */}
        <p className="font-sans text-[0.65rem] tracking-[0.15em] uppercase text-[#8C7B6B] mb-8">
          Shop by Category
        </p>

        {/* Grid — 3 col desktop matching LAICE reference */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {categories.slice(0, 3).map((cat) => (
            <Link
              key={cat._id}
              href={`/collections/${cat.slug.current}`}
              className="group relative overflow-hidden block"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] bg-[#F5F0E8] overflow-hidden">
                {cat.image?.url ? (
                  <Image
                    src={cat.image.url}
                    alt={cat.image.alt ?? cat.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-[#E8D9C0]" />
                )}
              </div>

              {/* Label */}
              <div className="mt-3">
                <p className="font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#2C2C2C] group-hover:text-[#B8975A] transition-colors duration-200">
                  {cat.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
