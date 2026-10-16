// CIL[BEGIN stable_id="~/.framework/src/components/ui/sonner.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/sonner.tsx"]
// CIL[DOC-MACRO purpose="Import next-themes hook, the sonner Toaster component, and Lucide icons for toast notifications"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide theme-aware toaster dependencies and the icon set used for toast states"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/sonner.tsx" layer="ui" related_files=".framework/src/components/ui/sonner.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="useTheme, Sonner Toaster, ToasterProps, and Lucide icons available in module scope" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports useTheme from next-themes, the Toaster component and its props type from sonner, and five status icons from lucide-react" notable_decisions="Uses sonner v2 and lucide-react icons"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Import next-themes hook, the sonner Toaster component, and Lucide icons for toast notifications'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sonner.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/sonner.tsx:toaster:constant" type="constant" identity="Toaster" parent="~/.framework/src/components/ui/sonner.tsx"]
// CIL[DOC-MACRO purpose="Render a theme-aware toast notification wrapper with custom Lucide icons and style variables"]
// CIL[DOC-RESPONSIBILITY responsibility="Display sonner toast notifications using the current theme and a set of custom status icons"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/sonner.tsx" layer="ui" related_files=".framework/src/components/ui/sonner.tsx"]
// CIL[DOC-CONTRACT inputs="props: ToasterProps from sonner" outputs="JSX Sonner component configured with the active theme, CSS variables, custom icons, and a toast className" errors="none" side_effects="renders a React component tree"]
// CIL[DOC-MICRO logic_summary="Reads the current theme from next-themes, then renders the sonner Toaster with custom icons, CSS custom properties mapped to the Tailwind theme, and a cn-toast className" notable_decisions="Defaults the theme to system; maps --popover, --popover-foreground, --border, and --radius CSS variables"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a theme-aware toast notification wrapper with custom Lucide icons and style variables'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sonner.tsx:toaster:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/sonner.tsx:exports:statement" type="statement" identity="exports" parent="~/.framework/src/components/ui/sonner.tsx"]
// CIL[DOC-MACRO purpose="Expose the configured Toaster component for external use"]
// CIL[DOC-RESPONSIBILITY responsibility="Make the sonner Toaster wrapper available to other modules"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/sonner.tsx" layer="ui" related_files=".framework/src/components/ui/sonner.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Toaster named export" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export of the Toaster constant" notable_decisions="Flat export surface"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
export { Toaster }
// CIL[DOC-VECTOR type="context" content="purpose='Expose the configured Toaster component for external use'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sonner.tsx:exports:statement"]
