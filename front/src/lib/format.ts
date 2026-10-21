import type { Money } from '../types/api'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatMoney = (value: Money | null | undefined) => money.format(Number(value ?? 0))

export function formatKm(km: number | null | undefined) {
  return km == null ? '—' : `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
}

// Estimativa simples para trânsito urbano (~20 km/h) + tempo de coleta.
export const estimateMinutes = (km: number) => Math.max(5, Math.round((km / 20) * 60) + 5)

export function formatToday() {
  const text = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()

export const isToday = (value: string | null | undefined) => !!value && isSameDay(new Date(value), new Date())

// Datas (início do dia) dos últimos `count` dias, do mais antigo para hoje.
export function lastDays(count: number) {
  const today = startOfDay(new Date())
  return Array.from({ length: count }, (_, index) => new Date(today.getTime() - (count - 1 - index) * 86_400_000))
}

export const weekdayShort = (date: Date) => date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')

export function formatRelative(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000)
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  if (isSameDay(date, new Date())) return `Hoje, ${time}`
  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${time}`
}

export const formatRating = (rating: number | null | undefined) => (rating ?? 5).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
