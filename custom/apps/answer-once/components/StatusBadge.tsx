// CIL[BEGIN stable_id="~/custom/apps/answer-once/components/StatusBadge.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Status badge for ticket and article statuses"]
// CIL[DOC-RESPONSIBILITY responsibility="Map status strings to badge variants and human labels"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/components/StatusBadge.tsx" layer="custom_app" related_files=".framework/src/components/ui/badge.tsx"]
// CIL[DOC-CONTRACT inputs="status: string" outputs="JSX Badge" errors="none" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Lookup maps for variant and label; defaults to secondary" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import { Badge } from '@core/components/ui/badge'
// CIL[END stable_id="~/custom/apps/answer-once/components/StatusBadge.tsx:module_header:module_header"]

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  new:           'default',
  open:          'default',
  ai_responding: 'outline',
  pending_resolution: 'outline',
  working:       'outline',
  pending:       'outline',
  in_progress:   'outline',
  human_assigned:'destructive',
  returned:      'destructive',
  resolved:      'secondary',
  completed:     'secondary',
  closed:        'secondary',
  candidate:     'outline',
  in_review:     'outline',
  published:     'default',
  archived:      'secondary',
  rejected:      'destructive',
  not_started:   'secondary',
}

const STATUS_LABELS: Record<string, string> = {
  new:           'New',
  open:          'Open',
  ai_responding: 'AI Responding',
  pending_resolution: 'Awaiting Customer',
  working:       'Working',
  pending:       'Pending',
  in_progress:   'In Progress',
  human_assigned:'Escalated',
  returned:      'Returned',
  resolved:      'Resolved',
  completed:     'Completed',
  closed:        'Closed',
  candidate:     'Candidate',
  in_review:     'In Review',
  published:     'Published',
  archived:      'Archived',
  rejected:      'Rejected',
  not_started:   'Not Started',
}

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANTS[status] ?? 'secondary'
  const label = STATUS_LABELS[status] ?? status
  return <Badge variant={variant} className="text-xs">{label}</Badge>
}
