"use client"

import * as React from "react"
import { IconMinus } from "@tabler/icons-react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  nonce,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
  nonce?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      nonce={nonce}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)

  // Safely access the slot with proper bounds checking
  const slot = inputOTPContext?.slots?.[index]
  const { char, hasFakeCaret, isActive } = slot ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        // Base styles
        "text-copy-14 relative flex h-9 w-9 items-center justify-center shadow-xs transition-all outline-none",
        // Border styles
        "border-input border-y border-r first:border-l",
        // Border radius
        "first:rounded-l-md last:rounded-r-md",
        // Background
        "dark:bg-input/30",
        // Active state styles
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        // Invalid state styles
        "aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive",
        "data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <IconMinus />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot }
