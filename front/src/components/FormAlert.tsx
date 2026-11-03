import type { ReactNode } from 'react'

const tones = {
  error: 'bg-red-50 text-red-700',
  success: 'bg-emerald-50 text-emerald-800',
  info: 'bg-slate-100 text-slate-700',
}

export function FormAlert({ tone = 'error', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
}
