"use client"

import Link from "next/link"

interface NavLink {
  label: string
  href: string
}

const policyLinks = [
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Terms & Conditions", href: "/policies/terms-and-conditions" },
  { label: "Shipping Policy", href: "/policies/shipping-policy" },
  { label: "Refund Policy", href: "/policies/refund-policy" },
  { label: "Accessibility Statement", href: "/policies/accessibility" },
]

interface SiteFooterProps {
  shopLinks: NavLink[]
}

export function SiteFooter({ shopLinks }: SiteFooterProps) {
  return (
    <footer className="bg-[#1A1A1A] text-[#C9B99A]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Col 1 — Brand + Shop links */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="font-serif text-3xl tracking-[0.15em] uppercase text-[#FDFAF5] hover:text-[#B8975A] transition-colors duration-200 self-start"
            >
              Elowen
            </Link>
            <nav aria-label="Shop navigation" className="flex flex-col gap-3">
              {shopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#8C7B6B] hover:text-[#C9B99A] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 2 — Policy links + Contact */}
          <div className="flex flex-col gap-6 md:pt-[3.75rem]">
            <div className="flex flex-col gap-3">
              {policyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#8C7B6B] hover:text-[#C9B99A] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="font-sans text-[0.7rem] tracking-[0.1em] uppercase text-[#8C7B6B] hover:text-[#C9B99A] transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#2C2C2C]">
              <p className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B] mb-1">
                Get in Touch
              </p>
              <a
                href="mailto:Khandalent259@gmail.com"
                className="font-sans text-[0.7rem] text-[#8C7B6B] hover:text-[#C9B99A] transition-colors duration-200"
              >
                Khandalent259@gmail.com
              </a>
              <a
                href="tel:+919509912259"
                className="font-sans text-[0.7rem] text-[#8C7B6B] hover:text-[#C9B99A] transition-colors duration-200"
              >
                +91 95099 12259
              </a>
            </div>
          </div>

          {/* Col 3 — Newsletter */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-serif text-lg text-[#FDFAF5] tracking-wide">
                The Inner Circle
              </p>
              <p className="font-sans text-[0.75rem] text-[#8C7B6B] mt-2 leading-relaxed">
                Join our community to receive early access to new collections and exclusive member events.
              </p>
            </div>
            <FooterNewsletter />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-[#2C2C2C] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B] hover:text-[#C9B99A] transition-colors duration-200"
            >
              Pinterest
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B] hover:text-[#C9B99A] transition-colors duration-200"
            >
              Instagram
            </a>
          </div>
          <p className="font-sans text-[0.65rem] text-[#8C7B6B] tracking-wide">
            © {new Date().getFullYear()} Elowen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterNewsletter() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-3"
      aria-label="Newsletter signup"
    >
      <label
        htmlFor="footer-email"
        className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B]"
      >
        Email Address *
      </label>
      <input
        id="footer-email"
        type="email"
        required
        placeholder="your@email.com"
        className="bg-transparent border-b border-[#2C2C2C] focus:border-[#B8975A] outline-none py-2 font-sans text-[0.875rem] text-[#C9B99A] placeholder:text-[#4A4A4A] transition-colors duration-200"
      />
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 accent-[#B8975A]"
        />
        <span className="font-sans text-[0.65rem] text-[#8C7B6B] leading-relaxed">
          Subscribe to our newsletter
        </span>
      </label>
      <button
        type="submit"
        className="self-start font-sans text-[0.65rem] tracking-[0.12em] uppercase text-[#C9B99A] border-b border-[#C9B99A] hover:text-[#FDFAF5] hover:border-[#FDFAF5] transition-colors duration-200 pb-0.5"
      >
        Subscribe
      </button>
    </form>
  )
}
