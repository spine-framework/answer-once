// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataStats.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Module header for the DataStats runtime component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare imports and dependencies for the DataStats component"]
// CIL[DOC-CONTEXT module="DataStats" layer="runtime" related_files=".framework/src/components/ui/card.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports types, UI card, and icon utilities used by the DataStats component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineer"]



import { EntityStat } from '../../types/types'
import { Card, CardContent } from '../ui/card'
import * as Icons from 'lucide-react'

// CIL[DOC-VECTOR type="context" content="purpose='Module header for the DataStats runtime component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataStats.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataStats.tsx:datastatsprops:interface"]
// CIL[DOC-MACRO purpose="DataStats component prop type"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the shape of props accepted by DataStats"]
// CIL[DOC-CONTEXT module="DataStats" layer="runtime" related_files=".framework/src/components/runtime/DataStats.tsx,.framework/src/components/ui/card.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="EntityStat[] stats, any[] data, optional boolean loading" outputs="DataStatsProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Type-only interface for DataStats props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface DataStatsProps {
  stats: EntityStat[]
  data: any[]
  loading?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='DataStats component prop type'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataStats.tsx:datastatsprops:interface"]



// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataStats.tsx:colormap:constant"]
// CIL[DOC-MACRO purpose="Color style mapping for stat cards"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide Tailwind CSS class combinations for color themes"]
// CIL[DOC-CONTEXT module="DataStats" layer="runtime" related_files=".framework/src/components/runtime/DataStats.tsx,.framework/src/components/ui/card.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="color key" outputs="Tailwind class string" errors="unknown key falls back to gray" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Record mapping semantic color names to background/text utility classes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500',
  green: 'bg-green-500/10 text-green-500',
  red: 'bg-red-500/10 text-red-500',
  orange: 'bg-orange-500/10 text-orange-500',
  purple: 'bg-purple-500/10 text-purple-500',
  gray: 'bg-muted text-muted-foreground'
}
// CIL[DOC-VECTOR type="context" content="purpose='Color style mapping for stat cards'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataStats.tsx:colormap:constant"]



// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataStats.tsx:datastats:function"]
// CIL[DOC-MACRO purpose="Render data statistics cards"]
// CIL[DOC-RESPONSIBILITY responsibility="Calculate and display entity statistics as a responsive grid of cards"]
// CIL[DOC-CONTEXT module="DataStats" layer="runtime" related_files=".framework/src/components/runtime/DataStats.tsx,.framework/src/components/ui/card.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="stats, data, loading" outputs="JSX grid of cards" errors="none" side_effects="renders React UI"]
// CIL[DOC-MICRO logic_summary="Maps stats to calculated values; uses colorMap and dynamic icon for each card." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function DataStats({ stats, data, loading }: DataStatsProps) {
  const calculateStat = (stat: EntityStat): number => {
    if (!data) return 0
    
    switch (stat.type) {
      case 'count':
        return data.length
      case 'filter_count':
        return data.filter(item => {
          if (!stat.filter) return true
          return Object.entries(stat.filter).every(([key, value]) => {
            const itemValue = key.includes('.') 
              ? key.split('.').reduce((obj, k) => obj?.[k], item)
              : item[key]
            return itemValue === value
          })
        }).length
      default:
        return 0
    }
  }
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[stat.icon] || Icons.Box
        const value = loading ? '-' : calculateStat(stat)
        
        return (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${colorMap[stat.color] || colorMap.gray}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render data statistics cards'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataStats.tsx:datastats:function"]
