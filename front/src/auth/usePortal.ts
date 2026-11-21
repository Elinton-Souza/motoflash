import { useParams } from 'react-router-dom'
import { portals, type PortalKey } from '../lib/portal'

// Perfil da tela atual de autenticação, vindo da URL (/entrar/:portal).
export function usePortal() {
  const { portal } = useParams()
  return portal && portal in portals ? portals[portal as PortalKey] : null
}
