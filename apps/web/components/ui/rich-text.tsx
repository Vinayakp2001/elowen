import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react"
import { cn } from "@/lib/utils"

interface RichTextProps {
  content: Record<string, unknown>
  className?: string
}

export function RichText({ content, className }: RichTextProps) {
  return (
    <div
      className={cn(
        "font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed [&_h1]:font-serif [&_h1]:text-[#2C2C2C] [&_h2]:font-serif [&_h2]:text-[#2C2C2C] [&_h3]:font-serif [&_h3]:text-[#2C2C2C] [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        className
      )}
    >
      <PayloadRichText data={content} />
    </div>
  )
}
