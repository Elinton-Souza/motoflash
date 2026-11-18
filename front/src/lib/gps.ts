import { nearbyPoint } from './location'
import type { LatLng } from './geo'

export type GpsMode = 'gps' | 'approximate'

// Lê a posição atual do aparelho. Sem permissão (ou sem GPS), usa uma
// posição aproximada perto do ponto de referência para a demonstração
// continuar funcionando.
export function readPosition(timeoutMs = 8000): Promise<{ point: LatLng; mode: GpsMode }> {
  return new Promise((resolve) => {
    const fallback = () => resolve({ point: nearbyPoint(0.8), mode: 'approximate' })
    if (!('geolocation' in navigator)) return fallback()
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ point: { lat: position.coords.latitude, lng: position.coords.longitude }, mode: 'gps' }),
      fallback,
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 15_000 },
    )
  })
}

export function gpsErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return 'Permissão de localização negada. Libere o GPS no navegador.'
  if (error.code === error.POSITION_UNAVAILABLE) return 'Não foi possível obter o sinal de GPS.'
  return 'O GPS demorou para responder.'
}
