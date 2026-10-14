import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = { icon: LucideIcon; title: string; description: string; action?: ReactNode }

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return <div className="flex flex-col items-center px-6 py-12 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Icon size={23} /></span><h3 className="mt-4 text-base font-bold text-ink">{title}</h3><p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">{description}</p>{action && <div className="mt-5">{action}</div>}</div>
}
