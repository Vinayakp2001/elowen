import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-6">
      <div className="max-w-md text-center flex flex-col gap-6">
        <p className="font-sans text-[0.65rem] tracking-[0.2em] uppercase text-[#C9B99A]">
          404
        </p>
        <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] leading-[1.2]">
          Page Not Found
        </h1>
        <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed">
          The page you are looking for may have moved or no longer exists.
        </p>
        <Link
          href="/"
          className="self-center font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] pb-0.5 transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
