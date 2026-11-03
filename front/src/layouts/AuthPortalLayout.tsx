import { Navigate, Outlet } from 'react-router-dom'
import { usePortal } from '../auth/usePortal'
import { MotoboyAuthLayout } from './MotoboyAuthLayout'
import { RestaurantAuthLayout } from './RestaurantAuthLayout'

// Escolhe o layout de login/cadastro de acordo com o perfil da URL.
export function AuthPortalLayout() {
  const portal = usePortal()
  if (!portal) return <Navigate to="/" replace />
  return portal.key === 'motoboy'
    ? <MotoboyAuthLayout><Outlet /></MotoboyAuthLayout>
    : <RestaurantAuthLayout><Outlet /></RestaurantAuthLayout>
}
