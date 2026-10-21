import { useEffect, useRef, useState } from 'react'
import { BellRing, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { subscribe, type RealtimeEvent } from '../lib/realtime'

export type Notice = { text: string; to?: string; linkLabel?: string }

// Aviso flutuante para eventos em tempo real (Socket.io).
export function LiveNotice({ build }: { build: (event: RealtimeEvent, payload: unknown) => Notice | null }) {
  const [notice, setNotice] = useState<Notice | null>(null)
  const buildRef = useRef(build)

  useEffect(() => {
    buildRef.current = build
  })

  useEffect(() => subscribe((event, payload) => {
    const next = buildRef.current(event, payload)
    if (next) setNotice(next)
  }), [])

  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(null), 10_000)
    return () => window.clearTimeout(id)
  }, [notice])

  if (!notice) return null
  return (
    <div role="status" className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-xl shadow-orange-900/10">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white"><BellRing size={18} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{notice.text}</p>
        {notice.to && <Link to={notice.to} onClick={() => setNotice(null)} className="mt-1 inline-block text-sm font-bold text-brand hover:text-brand-dark">{notice.linkLabel ?? 'Ver'}</Link>}
      </div>
      <button type="button" onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600" aria-label="Fechar aviso"><X size={16} /></button>
    </div>
  )
}
