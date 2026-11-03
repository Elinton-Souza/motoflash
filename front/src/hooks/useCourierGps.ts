import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { distanceKm, type LatLng } from '../lib/geo'
import { gpsErrorMessage } from '../lib/gps'

export type GpsState = {
  // "watching": GPS ativo enviando a posição; "error": sem permissão/sinal.
  status: 'idle' | 'watching' | 'error'
  position: LatLng | null
  accuracy: number | null
  lastSentAt: number | null
  error: string
}

const MIN_INTERVAL_MS = 8_000
const MIN_DISTANCE_KM = 0.03

// Acompanha o GPS do celular enquanto o motoboy está online ou em entrega
// e envia a posição para a API. Durante uma corrida, a API repassa a posição
// ao restaurante em tempo real (evento localizacao_motoboy_atualizada).
export function useCourierGps(enabled: boolean): GpsState {
  const [state, setState] = useState<GpsState>({ status: 'idle', position: null, accuracy: null, lastSentAt: null, error: '' })
  const lastSent = useRef<{ at: number; point: LatLng } | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (!('geolocation' in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((current) => ({ ...current, status: 'error', error: 'Este aparelho não tem GPS disponível no navegador.' }))
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude }
        setState((current) => ({ ...current, status: 'watching', position: point, accuracy: position.coords.accuracy, error: '' }))

        const previous = lastSent.current
        const now = Date.now()
        const moved = previous ? distanceKm(previous.point, point) >= MIN_DISTANCE_KM : true
        if (previous && now - previous.at < MIN_INTERVAL_MS && !moved) return
        if (previous && now - previous.at < MIN_INTERVAL_MS / 2) return

        lastSent.current = { at: now, point }
        api('/users/me/location', { method: 'PUT', body: point })
          .then(() => setState((current) => ({ ...current, lastSentAt: now })))
          .catch(() => undefined)
      },
      (error) => setState((current) => ({ ...current, status: 'error', error: gpsErrorMessage(error) })),
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [enabled])

  return enabled ? state : { ...state, status: 'idle' }
}
