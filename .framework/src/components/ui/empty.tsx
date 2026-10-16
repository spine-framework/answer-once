// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Empty-state UI component module for the design system"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and export the empty-state component suite"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports cva and cn, then re-exports six subcomponents for empty states" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework-developer"]










import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Empty-state UI component module for the design system'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:Empty:component" type="component" identity="Empty" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Root empty-state layout container"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a centered, bordered empty-state wrapper that accepts className"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/empty.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional CSS class, props: remaining div props" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto a div and merges Tailwind utility classes with cn()" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Root empty-state layout container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:Empty:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:EmptyHeader:component" type="component" identity="EmptyHeader" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Header area inside an empty state"]
// CIL[DOC-RESPONSIBILITY responsibility="Center the icon and title group vertically with a small gap"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/empty.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional CSS class, props: remaining div props" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a flex column with a max-width and appends className via cn()" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-1", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Header area inside an empty state'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:EmptyHeader:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:emptyMediaVariants:constant" type="constant" identity="emptyMediaVariants" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Style variants for the empty-state media icon wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide tailwind class strings for the default and icon media variants"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/empty.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="variant: 'default' | 'icon'" outputs="Tailwind CSS class string for the media wrapper" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="cva() with a default transparent state and an icon variant that adds a muted background" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Style variants for the empty-state media icon wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:emptyMediaVariants:constant"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:EmptyMedia:component" type="component" identity="EmptyMedia" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Icon or media area for an empty state"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a media container styled by emptyMediaVariants based on the selected variant"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/empty.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional CSS class, variant: visual style, props: remaining div props" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects the icon variant and merges the resulting cva() class with className using cn()" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Icon or media area for an empty state'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:EmptyMedia:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:EmptyTitle:component" type="component" identity="EmptyTitle" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Title text for an empty state"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a small, medium-weight heading for empty-state messaging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/empty.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional CSS class, props: remaining div props" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies a font-heading text-sm style and appends className through cn()" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn(
        "font-heading text-sm font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Title text for an empty state'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:EmptyTitle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:EmptyDescription:component" type="component" identity="EmptyDescription" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Description text for an empty state"]
// CIL[DOC-RESPONSIBILITY responsibility="Render muted, small body text with link styling for empty-state help"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/empty.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional CSS class, props: remaining paragraph props" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses text-muted-foreground with relaxed line height and underline rules for nested links" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Description text for an empty state'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:EmptyDescription:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:EmptyContent:component" type="component" identity="EmptyContent" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Body content area for an empty state"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a centered, bounded text container for custom empty-state children"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/empty.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional CSS class, props: remaining div props" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a max-w-sm flex column with text-balance and appends className via cn()" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-2 text-xs/relaxed text-balance",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Body content area for an empty state'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:EmptyContent:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/empty.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/empty.tsx"]
// CIL[DOC-MACRO purpose="Public API export for the empty-state component set"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose all named empty-state subcomponents for consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/empty.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports: Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Re-exports the six component symbols from this module" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
// CIL[DOC-VECTOR type="context" content="purpose='Public API export for the empty-state component set'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/empty.tsx:exports:variable"]
