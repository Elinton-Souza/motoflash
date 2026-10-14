import { Link } from 'react-router-dom'

type LogoProps = { compact?: boolean; to?: string }

export function Logo({ compact = false, to = '/' }: LogoProps) {
  return (
    <Link to={to} className="inline-flex rounded-2xl bg-[#160d09] p-1.5 shadow-[0_12px_24px_-14px_rgba(82,18,5,0.7)] ring-1 ring-white/10 transition hover:-translate-y-0.5" aria-label="MotoFlash - início">
      <img src="/image.png" alt="MotoFlash" className={`h-auto object-contain ${compact ? 'w-18' : 'w-34'}`} />
    </Link>
  )
}
