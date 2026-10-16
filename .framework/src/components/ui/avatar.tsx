// CIL[BEGIN stable_id="~/.framework/src/components/ui/avatar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/avatar.tsx"]
// CIL[DOC-MACRO purpose="Import the dependencies and utilities used by the avatar component module"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React, Radix UI Avatar, and the cn utility to the Avatar subcomponents"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/avatar.tsx" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, AvatarPrimitive, and cn bindings available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import third-party and local dependencies required by the avatar components" notable_decisions="Uses the @/lib/utils alias to import the cn class-name utility"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]










import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Import the dependencies and utilities used by the avatar component module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/avatar.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/avatar.tsx:Avatar:component" type="component" identity="Avatar" parent="~/.framework/src/components/ui/avatar.tsx"]
// CIL[DOC-MACRO purpose="Render an avatar root element with configurable size and Tailwind styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a styled AvatarPrimitive.Root wrapper that supports default, sm, and lg sizes"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/avatar.tsx" layer="ui" related_files=".framework/src/components/ui/avatar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, size: default|sm|lg, and standard AvatarPrimitive.Root props" outputs="JSX element styled as a rounded avatar root with data attributes" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wrap AvatarPrimitive.Root and apply size-aware Tailwind classes via cn, including a subtle border overlay" notable_decisions="Uses data-size attributes and dark mode mix-blend utilities for the border"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an avatar root element with configurable size and Tailwind styling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/avatar.tsx:Avatar:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarImage:component" type="component" identity="AvatarImage" parent="~/.framework/src/components/ui/avatar.tsx"]
// CIL[DOC-MACRO purpose="Render the image content of an avatar"]
// CIL[DOC-RESPONSIBILITY responsibility="Display an image inside an Avatar, cropped to a circle and covering the container"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/avatar.tsx" layer="ui" related_files=".framework/src/components/ui/avatar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: spread of standard AvatarPrimitive.Image props" outputs="JSX image element with rounded cover styling" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wrap AvatarPrimitive.Image and apply aspect-square, size-full, rounded-full, and object-cover classes" notable_decisions="Merges additional className with the cover classes"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the image content of an avatar'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarImage:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarFallback:component" type="component" identity="AvatarFallback" parent="~/.framework/src/components/ui/avatar.tsx"]
// CIL[DOC-MACRO purpose="Render placeholder content when an avatar image cannot be displayed"]
// CIL[DOC-RESPONSIBILITY responsibility="Show initials or an icon inside an Avatar when no image is loaded"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/avatar.tsx" layer="ui" related_files=".framework/src/components/ui/avatar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: spread of standard AvatarPrimitive.Fallback props" outputs="JSX fallback element with muted background and centered content" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wrap AvatarPrimitive.Fallback and apply a centered, rounded, muted background with size-aware text" notable_decisions="Reduces text size for sm avatars via the group-data selector"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render placeholder content when an avatar image cannot be displayed'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarFallback:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarBadge:component" type="component" identity="AvatarBadge" parent="~/.framework/src/components/ui/avatar.tsx"]
// CIL[DOC-MACRO purpose="Render a small status badge overlaid on an avatar"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a positioned badge at the bottom-right of an Avatar, adapting to avatar size"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/avatar.tsx" layer="ui" related_files=".framework/src/components/ui/avatar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: spread of standard span props" outputs="JSX span element positioned absolutely over the avatar" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render an absolute positioned span with primary background and size-aware dimensions" notable_decisions="Uses group-data selectors for sm/default/lg sizing and hides nested svg on sm"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a small status badge overlaid on an avatar'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarBadge:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarGroup:component" type="component" identity="AvatarGroup" parent="~/.framework/src/components/ui/avatar.tsx"]
// CIL[DOC-MACRO purpose="Group multiple avatars into a compact, overlapping stack"]
// CIL[DOC-RESPONSIBILITY responsibility="Layout a horizontal row of Avatars with negative horizontal spacing"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/avatar.tsx" layer="ui" related_files=".framework/src/components/ui/avatar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: spread of standard div props" outputs="JSX div element containing the overlapped avatar children" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render a flex container that overlaps child avatars and adds a ring around each" notable_decisions="Uses Tailwind space-negative utilities and attribute selectors for child styling"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Group multiple avatars into a compact, overlapping stack'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarGroup:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarGroupCount:component" type="component" identity="AvatarGroupCount" parent="~/.framework/src/components/ui/avatar.tsx"]
// CIL[DOC-MACRO purpose="Render a circular counter for additional avatars in a group"]
// CIL[DOC-RESPONSIBILITY responsibility="Show the number of hidden or extra avatars beyond those visible in an AvatarGroup"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/avatar.tsx" layer="ui" related_files=".framework/src/components/ui/avatar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: spread of standard div props" outputs="JSX div element styled as a count badge with size-aware scaling" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render a centered count element with muted background and group-based size scaling" notable_decisions="Scales size and svg icon dimensions based on the parent AvatarGroup size"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs/relaxed text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a circular counter for additional avatars in a group'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/avatar.tsx:AvatarGroupCount:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/avatar.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/avatar.tsx"]
// CIL[DOC-MACRO purpose="Re-export the Avatar subcomponents and the Avatar root"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the public API of the avatar module for consumers"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/avatar.tsx" layer="ui" related_files=".framework/src/components/ui/avatar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, and AvatarBadge named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export list for the Avatar components" notable_decisions="Exports all subcomponents so consumers can compose them explicitly"]
// CIL[DOC-CONFIDENCE pass="second" score="0.9" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-export the Avatar subcomponents and the Avatar root'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/avatar.tsx:exports:variable"]
