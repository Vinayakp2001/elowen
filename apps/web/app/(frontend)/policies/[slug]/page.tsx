import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const revalidate = false

// ---------------------------------------------------------------------------
// Static policy content — no CMS required
// ---------------------------------------------------------------------------

const policies: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Introduction",
        body: `Elowen ("we", "us", or "our") operates the website elowen.co.in. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website or make a purchase. By using our site, you agree to the terms of this policy. Last updated: June 2025.`,
      },
      {
        heading: "Information We Collect",
        body: `We collect information you provide directly to us, including:
• Name and contact details (email address, phone number)
• Shipping and billing address
• Payment information (processed securely via our payment gateway — we do not store card details)
• Order history and preferences
• Communications you send us

We also collect certain information automatically when you visit our site, such as IP address, browser type, pages visited, and device information via cookies and similar technologies.`,
      },
      {
        heading: "How We Use Your Information",
        body: `We use the information we collect to:
• Process and fulfill your orders
• Send order confirmations and shipping updates
• Respond to your queries and provide customer support
• Send promotional communications (only with your consent)
• Improve our website and services
• Comply with legal obligations`,
      },
      {
        heading: "Data Sharing",
        body: `We do not sell your personal information. We share your data only with:
• Payment processors to complete transactions
• Shipping partners to deliver your orders
• Service providers who assist us in operating our website (bound by confidentiality agreements)
• Law enforcement when required by law`,
      },
      {
        heading: "Data Security",
        body: `We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. All payment transactions are encrypted via SSL.`,
      },
      {
        heading: "Your Rights",
        body: `You have the right to access, correct, or delete your personal information. To exercise any of these rights, contact us at Khandalent259@gmail.com or +91 95099 12259.`,
      },
      {
        heading: "Contact",
        body: `For any privacy-related questions, contact us at:\nEmail: Khandalent259@gmail.com\nPhone: +91 95099 12259`,
      },
    ],
  },

  "terms-and-conditions": {
    title: "Terms & Conditions",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: `By accessing and using elowen.co.in, you accept and agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website. We reserve the right to update these terms at any time without prior notice.`,
      },
      {
        heading: "Products and Pricing",
        body: `All product descriptions, images, and prices are as accurate as possible. We reserve the right to correct any errors and to change prices without notice. Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.`,
      },
      {
        heading: "Orders and Payment",
        body: `By placing an order, you represent that you are at least 18 years of age and that all information you provide is accurate. We reserve the right to refuse or cancel any order at our discretion. Payment must be received in full before an order is processed and dispatched.`,
      },
      {
        heading: "Intellectual Property",
        body: `All content on this website — including text, images, logos, and design — is the property of Elowen and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use our content without prior written permission.`,
      },
      {
        heading: "Limitation of Liability",
        body: `To the fullest extent permitted by law, Elowen shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the value of the order in question.`,
      },
      {
        heading: "Governing Law",
        body: `These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Rajasthan, India.`,
      },
      {
        heading: "Contact",
        body: `For any queries regarding these terms, contact us at:\nEmail: Khandalent259@gmail.com\nPhone: +91 95099 12259`,
      },
    ],
  },

  "shipping-policy": {
    title: "Shipping Policy",
    sections: [
      {
        heading: "Order Processing",
        body: `Orders are processed within 2–3 business days of payment confirmation. You will receive an email confirmation once your order is dispatched. Orders placed on weekends or public holidays will be processed on the next business day.`,
      },
      {
        heading: "Delivery Timelines",
        body: `• Standard Delivery (within India): 5–7 business days after dispatch
• Express Delivery (select pin codes): 2–3 business days after dispatch

Delivery timelines are estimates and may vary depending on your location and courier availability. Elowen is not responsible for delays caused by the courier partner or circumstances beyond our control.`,
      },
      {
        heading: "Shipping Charges",
        body: `Shipping charges are calculated at checkout based on your delivery address and the weight of the order. Free shipping is available on orders above a specified threshold, which will be displayed on the website.`,
      },
      {
        heading: "Tracking",
        body: `Once your order is dispatched, you will receive a tracking number via email and/or SMS. You can use this to track your shipment through the courier's website.`,
      },
      {
        heading: "Delivery Areas",
        body: `We currently ship to all serviceable pin codes within India. For remote or unserviceable areas, we will contact you to arrange an alternative or issue a refund.`,
      },
      {
        heading: "Damaged or Lost Shipments",
        body: `If your order arrives damaged or is lost in transit, please contact us within 48 hours of the expected delivery date at Khandalent259@gmail.com or +91 95099 12259. We will investigate and arrange a replacement or refund as appropriate.`,
      },
      {
        heading: "Contact",
        body: `For shipping-related queries:\nEmail: Khandalent259@gmail.com\nPhone: +91 95099 12259`,
      },
    ],
  },

  "refund-policy": {
    title: "Refund & Return Policy",
    sections: [
      {
        heading: "Return Window",
        body: `We accept returns within 7 days of delivery. To be eligible for a return, items must be unused, unworn, in their original condition, and in original packaging with all tags intact.`,
      },
      {
        heading: "Non-Returnable Items",
        body: `The following items are not eligible for return or exchange:
• Custom or personalised jewellery
• Items purchased during sale or clearance
• Items that show signs of wear, alteration, or damage after delivery`,
      },
      {
        heading: "How to Initiate a Return",
        body: `To initiate a return, contact us within 7 days of receiving your order:\n• Email: Khandalent259@gmail.com\n• Phone: +91 95099 12259\n\nProvide your order number, reason for return, and photographs of the item. Once approved, we will share return shipping instructions. Return shipping costs are borne by the customer unless the item is defective or incorrectly sent.`,
      },
      {
        heading: "Refund Process",
        body: `Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund. Approved refunds are processed within 7–10 business days to your original payment method. The time for funds to appear in your account may vary depending on your bank or payment provider.`,
      },
      {
        heading: "Exchanges",
        body: `We offer exchanges for a different size or variant of the same product, subject to availability. Contact us at Khandalent259@gmail.com to arrange an exchange.`,
      },
      {
        heading: "Defective or Incorrect Items",
        body: `If you receive a defective, damaged, or incorrect item, please contact us within 48 hours of delivery with photographs. We will arrange a replacement or full refund at no additional cost to you.`,
      },
      {
        heading: "Contact",
        body: `For return and refund queries:\nEmail: Khandalent259@gmail.com\nPhone: +91 95099 12259`,
      },
    ],
  },

  accessibility: {
    title: "Accessibility Statement",
    sections: [
      {
        heading: "Our Commitment",
        body: `Elowen is committed to ensuring that our website is accessible to all users, including those with disabilities. We strive to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.`,
      },
      {
        heading: "Measures We Take",
        body: `We take the following measures to ensure accessibility:
• Providing text alternatives for non-text content
• Ensuring sufficient colour contrast throughout the site
• Making all functionality available via keyboard
• Providing clear and consistent navigation
• Using semantic HTML to support screen readers
• Ensuring forms are labelled correctly`,
      },
      {
        heading: "Known Limitations",
        body: `While we strive for full accessibility, some older content or third-party integrations may not fully meet all guidelines. We are actively working to identify and address these gaps.`,
      },
      {
        heading: "Feedback and Contact",
        body: `If you experience any accessibility barriers on our website, or if you need assistance accessing any content, please contact us:\n\nEmail: Khandalent259@gmail.com\nPhone: +91 95099 12259\n\nWe aim to respond to accessibility queries within 2 business days.`,
      },
    ],
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const policy = policies[slug]
  if (!policy) return {}
  return { title: policy.title }
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  const policy = policies[slug]
  if (!policy) notFound()

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] mb-10">{policy.title}</h1>
        <div className="flex flex-col gap-10">
          {policy.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-serif text-[1.25rem] text-[#2C2C2C] mb-3">{section.heading}</h2>
              <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
