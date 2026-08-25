import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Elowen team.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[480px] mx-auto px-6 py-20">
        <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] mb-3">Contact</h1>
        <p className="font-sans text-[0.875rem] text-[#8C7B6B] mb-12 leading-relaxed">
          We would love to hear from you. Reach us at{" "}
          <a
            href="mailto:Khandalent259@gmail.com"
            className="text-[#2C2C2C] border-b border-[#C9B99A] hover:border-[#B8975A] transition-colors duration-200"
          >
            Khandalent259@gmail.com
          </a>{" "}
          or call us at{" "}
          <a
            href="tel:+919509912259"
            className="text-[#2C2C2C] border-b border-[#C9B99A] hover:border-[#B8975A] transition-colors duration-200"
          >
            +91 95099 12259
          </a>
          . You can also use the form below.
        </p>

        <form className="flex flex-col gap-8" aria-label="Contact form">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B]">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="bg-transparent border-b border-[#C9B99A] focus:border-[#B8975A] outline-none py-2 font-sans text-[0.875rem] text-[#2C2C2C] transition-colors duration-200"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="bg-transparent border-b border-[#C9B99A] focus:border-[#B8975A] outline-none py-2 font-sans text-[0.875rem] text-[#2C2C2C] transition-colors duration-200"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B]">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              className="bg-transparent border-b border-[#C9B99A] focus:border-[#B8975A] outline-none py-2 font-sans text-[0.875rem] text-[#2C2C2C] resize-none transition-colors duration-200"
            />
          </div>
          <button
            type="submit"
            className="self-start font-sans text-[0.7rem] tracking-[0.12em] uppercase bg-[#2C2C2C] text-[#FDFAF5] px-8 py-3 hover:bg-[#1A1A1A] transition-colors duration-200"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
