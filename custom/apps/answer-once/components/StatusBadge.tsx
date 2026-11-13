import { Badge } from '@core/components/ui/badge'

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
