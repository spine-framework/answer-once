// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-otp.tsx:use_client:directive" type="directive" identity="use_client" parent="module"]
// CIL[DOC-MACRO purpose="Marks the module for client-side execution in Next.js"]
// CIL[DOC-RESPONSIBILITY responsibility="Indicates that this file should only run in the browser"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/input-otp.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="Changes module runtime context to client"]
// CIL[DOC-MICRO logic_summary="Directive indicating client-side rendering" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Marks the module for client-side execution in Next.js'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-otp.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-otp.tsx:module_header:module_header" type="module_header" identity="module_header" parent="module"]
// CIL[DOC-MACRO purpose="Imports and dependencies for the input-otp UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the external libraries and utilities used by the component exports"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Imported symbols available to downstream chunks" errors="N/A" side_effects="Loads React, input-otp, utils, and icons into module scope"]
// CIL[DOC-MICRO logic_summary="Imports React, OTPInput/OTPInputContext, className utility, and MinusIcon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers and UI component consumers"]
import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"
import { MinusIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Imports and dependencies for the input-otp UI components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-otp.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-otp.tsx:inputotp:function" type="function" identity="InputOTP" parent="module"]
// CIL[DOC-MACRO purpose="Render a styled one-time password input wrapper around OTPInput"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap the external OTPInput component with project-specific styling and container className"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/input-otp.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, containerClassName, ...props" outputs="Rendered OTPInput element with merged styles" errors="N/A" side_effects="Renders DOM via React"]
// CIL[DOC-MICRO logic_summary="Merges className and containerClassName with default styles and renders OTPInput" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled one-time password input wrapper around OTPInput'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-otp.tsx:inputotp:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-otp.tsx:inputotpgroup:function" type="function" identity="InputOTPGroup" parent="module"]
// CIL[DOC-MACRO purpose="Render a group container for OTP input slots"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply flex and validation styling to a group of OTP slots"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/input-otp.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="Styled flex div for grouping slots" errors="N/A" side_effects="Renders DOM"]
// CIL[DOC-MICRO logic_summary="Renders a flex div with rounded, invalid-state, and ring styles" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-md has-aria-invalid:border-destructive has-aria-invalid:ring-2 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a group container for OTP input slots'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-otp.tsx:inputotpgroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-otp.tsx:inputotpslot:function" type="function" identity="InputOTPSlot" parent="module"]
// CIL[DOC-MACRO purpose="Render an individual OTP digit slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Display the digit, caret, and active state for a single OTP character position"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/input-otp.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="index, className, ...props; consumes OTPInputContext" outputs="Styled slot div with char and optional fake caret" errors="N/A" side_effects="Renders DOM and subscribes to OTPInputContext"]
// CIL[DOC-MICRO logic_summary="Consumes OTPInputContext to obtain slot state and renders a styled div for one character" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-7 items-center justify-center border-y border-r border-input bg-input/20 text-xs/relaxed transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-2 data-[active=true]:ring-ring/30 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an individual OTP digit slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-otp.tsx:inputotpslot:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-otp.tsx:inputotpseparator:function" type="function" identity="InputOTPSeparator" parent="module"]
// CIL[DOC-MACRO purpose="Render a visual separator between OTP input groups"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a minus icon to visually separate OTP groups"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/input-otp.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="Styled div containing a MinusIcon" errors="N/A" side_effects="Renders DOM"]
// CIL[DOC-MICRO logic_summary="Renders a div with flex alignment and a MinusIcon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a visual separator between OTP input groups'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-otp.tsx:inputotpseparator:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-otp.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="module"]
// CIL[DOC-MACRO purpose="Export the public API of the input-otp UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Make InputOTP, InputOTPGroup, InputOTPSlot, and InputOTPSeparator available to other modules"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/input-otp.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Named exports of all OTP components" errors="N/A" side_effects="Defines the module's external interface"]
// CIL[DOC-MICRO logic_summary="Named export list for InputOTP, InputOTPGroup, InputOTPSlot, and InputOTPSeparator" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
// CIL[DOC-VECTOR type="context" content="purpose='Export the public API of the input-otp UI components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-otp.tsx:module_exports:module_exports"]