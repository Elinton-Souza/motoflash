import { useParams } from 'react-router-dom'
import { portals, type PortalKey } from '../lib/portal'

// Perfil da tela atual de autenticação, vindo da URL (/entrar/:portal).
export function usePortal() {
  const { portal } = useParams()
  return portal === 'motoboy' || portal === 'restaurante' ? portals[portal as PortalKey] : null
}
