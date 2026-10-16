// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminStatsCard.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Module header for the AdminStatsCard component: imports React, LucideIcon, and Card/CardContent UI primitives"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare module-level imports required by the AdminStatsCard component"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/ui/card.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, LucideIcon type, and shadcn Card/CardContent components" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin developers"]

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
// CIL[DOC-VECTOR type="context" content="purpose='Module header for the AdminStatsCard component: imports React, LucideIcon, and Card/CardContent UI primitives'; No verified external callers; imports: .framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminStatsCard.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminStatsCard.tsx:AdminStatsCardProps:interface" type="interface" identity="AdminStatsCardProps" parent="AdminStatsCard"]
// CIL[DOC-MACRO purpose="Props interface for the AdminStatsCard stat tile component"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the typed contract consumed by AdminStatsCard"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/AdminStatsCard.tsx,.framework/src/components/ui/card.tsx"]
// CIL[DOC-CONTRACT inputs="title: string; value: string | number; icon: LucideIcon; iconColor?: string" outputs="interface type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional iconColor defaults to text-primary" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface AdminStatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Props interface for the AdminStatsCard stat tile component'; No verified external callers; imports: .framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminStatsCard.tsx:AdminStatsCardProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminStatsCard.tsx:AdminStatsCard:function" type="function" identity="AdminStatsCard" parent=""]
// CIL[DOC-MACRO purpose="Renders an admin dashboard stat card with icon, title, and value"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a small stat card tile for admin dashboards"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/AdminStatsCard.tsx,.framework/src/components/ui/card.tsx"]
// CIL[DOC-CONTRACT inputs="title: string; value: string | number; icon: LucideIcon; iconColor?: string (default 'text-primary')" outputs="JSX Card component" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps title and value in a Card with an icon, applying optional icon color class" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function AdminStatsCard({ title, value, icon: Icon, iconColor = "text-primary" }: AdminStatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </dt>
              <dd className="text-lg font-semibold text-foreground">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an admin dashboard stat card with icon, title, and value'; No verified external callers; imports: .framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminStatsCard.tsx:AdminStatsCard:function"]