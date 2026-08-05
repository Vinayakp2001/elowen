"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[0.75rem] tracking-[0.1em] uppercase text-[#8C7B6B] font-sans"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "bg-transparent border-0 border-b border-[#C9B99A] focus:border-[#B8975A] outline-none py-2 font-sans text-[1rem] text-[#2C2C2C] placeholder:text-[#8C7B6B] placeholder:text-[0.875rem] placeholder:tracking-[0.05em] transition-colors duration-200 w-full",
            error && "border-red-400",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[0.75rem] text-red-500 tracking-wide">{error}</span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
