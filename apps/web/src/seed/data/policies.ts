/**
 * Static policy seed data (Req 7). Slugs match the storefront footer links so
 * /policies/[slug] pages resolve: privacy-policy, terms-and-conditions,
 * shipping-policy, refund-policy, accessibility. `body` paragraphs are built
 * into Lexical rich text by seedPolicies (Req 7.3).
 */

export interface PolicySeed {
  title: string
  slug: string
  body: string[]
}

export const policies: PolicySeed[] = [
  {
    title: "Shipping Policy",
    slug: "shipping-policy",
    body: [
      "All orders are processed within 2 business days. Finished pieces ship via insured courier.",
      "Shipping within India is complimentary on all orders. Tracking details are shared once your order is dispatched.",
    ],
  },
  {
    title: "Refund Policy",
    slug: "refund-policy",
    body: [
      "We accept returns of unworn, undamaged pieces within 14 days of delivery for a full refund.",
      "Made-to-order and engraved pieces are final sale and cannot be returned.",
    ],
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    body: [
      "We collect only the information needed to process your orders and improve your experience.",
      "Your personal data is never sold. Payment details are handled securely by our payment partner.",
    ],
  },
  {
    title: "Terms & Conditions",
    slug: "terms-and-conditions",
    body: [
      "By placing an order you agree to our terms of sale, including pricing, availability, and delivery terms.",
      "All designs and imagery remain the property of Elowen by Khandal Enterprises.",
    ],
  },
  {
    title: "Accessibility Statement",
    slug: "accessibility",
    body: [
      "We are committed to making elowen.co.in usable for everyone, including people using assistive technology.",
      "If you encounter any accessibility barrier, please contact us and we will work to resolve it.",
    ],
  },
]
