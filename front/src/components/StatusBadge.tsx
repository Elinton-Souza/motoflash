type Status = 'online' | 'available' | 'accepted' | 'pickup' | 'delivery' | 'completed' | 'cancelled' | 'waiting'

const styles: Record<Status, string> = {
  online: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  available: 'bg-blue-50 text-blue-700 ring-blue-100',
  accepted: 'bg-blue-50 text-blue-700 ring-blue-100',
  pickup: 'bg-violet-50 text-violet-700 ring-violet-100',
  delivery: 'bg-amber-50 text-amber-700 ring-amber-100',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  cancelled: 'bg-red-50 text-red-700 ring-red-100',
  waiting: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function StatusBadge({ status, children }: { status: Status | string; children: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status as Status] ?? styles.waiting} `}><span className="size-1.5 rounded-full bg-current" />{children}</span>
}
