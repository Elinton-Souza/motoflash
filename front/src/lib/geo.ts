import { api } from './api'

export type LatLng = { lat: number; lng: number }
export type AddressSuggestion = LatLng & { label: string }

export const searchAddress = (query: string) => api<AddressSuggestion[]>(`/geo/search?q=${encodeURIComponent(query)}`)

// Distância em linha reta, em km.
export function distanceKm(a: LatLng, b: LatLng) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export const hasPoint = (lat: number | null | undefined, lng: number | null | undefined): LatLng | null =>
  lat != null && lng != null ? { lat, lng } : null

// Rota de moto pelas ruas usando o servidor público do OSRM. Se ele não
// responder, o mapa liga os pontos em linha reta.
const OSRM_URL = import.meta.env.VITE_OSRM_URL ?? 'https://router.project-osrm.org'

export async function fetchRoute(points: LatLng[]): Promise<{ path: LatLng[]; km: number; minutes: number } | null> {
  if (points.length < 2) return null
  const coords = points.map((point) => `${point.lng},${point.lat}`).join(';')
  try {
    const response = await fetch(`${OSRM_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson`, { signal: AbortSignal.timeout(6000) })
    if (!response.ok) return null
    const data = await response.json()
    const route = data.routes?.[0]
    if (!route) return null
    return {
      path: (route.geometry.coordinates as [number, number][]).map(([lng, lat]) => ({ lat, lng })),
      km: route.distance / 1000,
      minutes: Math.round(route.duration / 60),
    }
  } catch {
    return null
  }
}

// Abre a navegação no app de mapas do celular (Google Maps ou Waze).
export const googleMapsLink = (to: LatLng) => `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}&travelmode=driving`
export const wazeLink = (to: LatLng) => `https://waze.com/ul?ll=${to.lat},${to.lng}&navigate=yes`
