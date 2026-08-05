"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "gold"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2C2C2C] text-[#FDFAF5] hover:bg-[#1A1A1A] px-8 py-3 text-[0.75rem] tracking-[0.1em] uppercase font-sans transition-colors duration-200",
  secondary:
    "bg-transparent text-[#2C2C2C] border border-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-[#FDFAF5] px-8 py-3 text-[0.75rem] tracking-[0.1em] uppercase font-sans transition-colors duration-200",
  ghost:
    "bg-transparent text-[#2C2C2C] border-b border-transparent hover:border-[#2C2C2C] px-0 py-2 text-[0.75rem] tracking-[0.1em] uppercase font-sans transition-all duration-200",
  gold:
    "bg-[#B8975A] text-[#2C2C2C] hover:bg-[#D4B483] px-8 py-3 text-[0.75rem] tracking-[0.1em] uppercase font-sans transition-colors duration-200",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(variantClasses[variant], "inline-flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed", className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
