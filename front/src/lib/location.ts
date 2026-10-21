// O MVP ainda não converte endereços em coordenadas (geocodificação).
// Para a busca por proximidade (PostGIS) funcionar, o cliente e o motoboy
// recebem coordenadas próximas a este ponto de referência, a mesma região
// dos usuários de exemplo do seed.
export const BASE_LOCATION = { lat: -23.5615, lng: -46.6558 }

// Ponto aleatório a até `maxKm` do ponto de referência.
export function nearbyPoint(maxKm: number) {
  const distanceKm = Math.random() * maxKm
  const angle = Math.random() * 2 * Math.PI
  const lat = BASE_LOCATION.lat + (distanceKm / 111) * Math.cos(angle)
  const lng = BASE_LOCATION.lng + (distanceKm / (111 * Math.cos((BASE_LOCATION.lat * Math.PI) / 180))) * Math.sin(angle)
  return { lat, lng }
}
