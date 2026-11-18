import { useEffect, useMemo, useState } from 'react'
import { divIcon, latLngBounds } from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchRoute, type LatLng } from '../lib/geo'

export type MapPoint = LatLng & { kind: 'restaurant' | 'customer' | 'courier'; label: string }

type LiveMapProps = {
  points: MapPoint[]
  // Ordem dos pontos usados para traçar a rota (ex.: motoboy -> restaurante -> cliente).
  route?: LatLng[]
  className?: string
  onRoute?: (info: { km: number; minutes: number } | null) => void
}

const colors = { restaurant: '#ff4812', customer: '#1b100d', courier: '#059669' }
const glyphs = { restaurant: 'R', customer: 'C', courier: 'M' }

// Marcadores em HTML/CSS (não dependem das imagens padrão do Leaflet).
const icons = Object.fromEntries(
  (Object.keys(colors) as MapPoint['kind'][]).map((kind) => [
    kind,
    divIcon({
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
      html: `<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:9999px;background:${colors[kind]};color:#fff;font:700 13px/1 Inter,system-ui,sans-serif;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.25)">${glyphs[kind]}</span>`,
    }),
  ]),
) as Record<MapPoint['kind'], ReturnType<typeof divIcon>>

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap()
  const key = points.map((point) => `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`).join('|')
  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 15)
    else map.fitBounds(latLngBounds(points.map((point) => [point.lat, point.lng])), { padding: [40, 40], maxZoom: 16 })
    // Reenquadra só quando os pontos mudam de lugar de verdade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key])
  return null
}

export function LiveMap({ points, route, className = '', onRoute }: LiveMapProps) {
  const routeKey = (route ?? []).map((point) => `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`).join('|')
  // Rota pelas ruas já calculada para a rota atual; enquanto não chega,
  // o mapa mostra a linha reta entre os pontos.
  const [streetRoute, setStreetRoute] = useState<{ key: string; path: LatLng[] } | null>(null)
  const path = !route || route.length < 2 ? null : streetRoute?.key === routeKey ? streetRoute.path : route

  useEffect(() => {
    let cancelled = false
    const stops = route ?? []
    if (stops.length < 2) {
      onRoute?.(null)
      return
    }
    fetchRoute(stops).then((result) => {
      if (cancelled) return
      setStreetRoute({ key: routeKey, path: result?.path ?? stops })
      onRoute?.(result ? { km: result.km, minutes: result.minutes } : null)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])

  const center = useMemo(() => points[0] ?? { lat: -23.5615, lng: -46.6558 }, [points])

  return (
    <div className={`relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${className}`}>
      <MapContainer center={[center.lat, center.lng]} zoom={14} scrollWheelZoom className="absolute inset-0 h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {path && <Polyline positions={path.map((point) => [point.lat, point.lng])} pathOptions={{ color: '#ff4812', weight: 5, opacity: 0.85 }} />}
        {points.map((point) => <Marker key={`${point.kind}-${point.label}`} position={[point.lat, point.lng]} icon={icons[point.kind]}><Popup>{point.label}</Popup></Marker>)}
        <FitBounds points={points} />
      </MapContainer>
      {!points.length && <p className="absolute inset-0 z-[500] grid place-items-center text-sm text-muted">Sem localização para exibir.</p>}
    </div>
  )
}

export function MapLegend({ kinds }: { kinds: MapPoint['kind'][] }) {
  const labels = { restaurant: 'Restaurante', customer: 'Cliente', courier: 'Motoboy' }
  return <div className="flex flex-wrap gap-4 text-xs text-muted">{kinds.map((kind) => <span key={kind} className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full" style={{ background: colors[kind] }} />{labels[kind]}</span>)}</div>
}
