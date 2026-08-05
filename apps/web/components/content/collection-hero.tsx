import Image from "next/image"

interface CollectionHeroProps {
  title: string
  description?: string
  imageUrl?: string
}

export function CollectionHero({ title, description, imageUrl }: CollectionHeroProps) {
  return (
    <section className="relative w-full h-[40vh] min-h-[280px] max-h-[480px] overflow-hidden bg-[#2C2C2C]">
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority
            className="object-cover object-center opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#1A1A1A]/30" />
        </>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-[2.5rem] md:text-[3.5rem] text-[#FDFAF5] leading-[1.1] tracking-[-0.01em]">
          {title}
        </h1>
        {description && (
          <p className="font-sans text-[0.875rem] text-[#C9B99A] mt-3 max-w-md leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
