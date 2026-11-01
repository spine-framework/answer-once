// CIL[BEGIN stable_id="~/.framework/src/components/ui/textarea.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/textarea.tsx"]
/**
 * @module   textarea
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides a React component for a customizable textarea, allowing for flexible user input within forms. It integrates utility functions for class name management to ensure consistent styling. INVARIANT: The component must always receive valid props to function correctly.
 *
 * @seeAlso utils.ts (provides utility functions for class name management).
 *
 * @cil-generated
 */









import * as React from "react"

import { cn } from "@/lib/utils"
// CIL[END stable_id="~/.framework/src/components/ui/textarea.tsx:module_header:module_header"]
















// CIL[BEGIN stable_id="~/.framework/src/components/ui/textarea.tsx:Textarea:constant" type="constant" identity="Textarea" parent="~/.framework/src/components/ui/textarea.tsx"]
/**
 * Textarea is a React component that renders a styled HTML textarea element, providing a flexible and customizable input area for user text input within a form.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       cn
 * @cil-generated
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-md border border-input bg-input/20 px-2 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
// CIL[END stable_id="~/.framework/src/components/ui/textarea.tsx:Textarea:constant"]
)
Textarea.displayName = "Textarea"
















export { Textarea }







