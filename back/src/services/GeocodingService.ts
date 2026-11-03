// Converte endereços em coordenadas usando o Nominatim (OpenStreetMap),
// que é gratuito e não exige chave. Pela política de uso do Nominatim,
// toda requisição precisa de um User-Agent identificando a aplicação.

export type GeoPoint = { lat: number; lng: number }
export type GeoSuggestion = GeoPoint & { label: string }

type NominatimItem = { lat: string; lon: string; display_name: string }

const NOMINATIM_URL = process.env.GEOCODING_URL ?? "https://nominatim.openstreetmap.org"
const USER_AGENT = process.env.GEOCODING_USER_AGENT ?? "MotoFlash/1.0 (projeto academico Senac RS)"

export class GeocodingService {
  get enabled() {
    return process.env.GEOCODING_DISABLED !== "true"
  }

  async search(query: string, limit = 5): Promise<GeoSuggestion[]> {
    const text = query.trim()
    if (!this.enabled || text.length < 3) return []

    const params = new URLSearchParams({
      q: text,
      format: "jsonv2",
      limit: String(limit),
      countrycodes: "br",
      "accept-language": "pt-BR"
    })

    try {
      const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(6_000)
      })
      if (!response.ok) return []

      const items = (await response.json()) as NominatimItem[]
      return items.map((item) => ({
        lat: Number(item.lat),
        lng: Number(item.lon),
        label: item.display_name
      }))
    } catch (error) {
      console.warn(`[geocoding] não foi possível buscar "${text}": ${(error as Error).message}`)
      return []
    }
  }

  async geocode(address: string): Promise<GeoPoint | null> {
    const [first] = await this.search(address, 1)
    return first ? { lat: first.lat, lng: first.lng } : null
  }
}

// Distância em linha reta entre dois pontos, em km.
export function haversineKm(a: GeoPoint, b: GeoPoint) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}
