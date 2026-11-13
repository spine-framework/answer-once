
import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/card'


interface AdminStatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
}


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