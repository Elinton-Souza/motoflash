import { MapPin, Navigation } from 'lucide-react'

export function MapMock({ className = '' }: { className?: string }) {
  return (
    <div className={`relative min-h-60 overflow-hidden rounded-2xl bg-slate-100 ${className}`} aria-label="Mapa simulado">
      <div className="absolute -left-8 top-12 h-20 w-[130%] -rotate-12 border-y-8 border-white/80" />
      <div className="absolute -left-10 bottom-12 h-14 w-[130%] rotate-6 border-y-8 border-white/80" />
      <div className="absolute left-[20%] top-[18%] h-[65%] w-[60%] rounded-[45%] border-2 border-dashed border-brand/35" />
      <span className="absolute left-[20%] top-[30%] grid size-9 place-items-center rounded-full bg-brand text-white shadow-lg"><MapPin size={18} /></span>
      <span className="absolute bottom-[24%] right-[20%] grid size-9 place-items-center rounded-full bg-ink text-white shadow-lg"><Navigation size={17} /></span>
      <span className="absolute left-[30%] top-[45%] size-2 rounded-full bg-brand" />
      <span className="absolute right-[32%] top-[34%] size-2 rounded-full bg-brand" />
      <p className="absolute bottom-3 left-4 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm">Mapa ilustrativo</p>
    </div>
  )
}
