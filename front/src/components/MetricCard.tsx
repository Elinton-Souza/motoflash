import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

type MetricCardProps = { label: string; value: string; icon: LucideIcon; trend?: string }

export function MetricCard({ label, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="grid size-9 place-items-center rounded-lg bg-flash-soft text-brand"><Icon size={18} /></span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-ink">{value}</p>
      {trend && <p className="mt-1.5 text-xs text-emerald-600">{trend}</p>}
    </Card>
  )
}
