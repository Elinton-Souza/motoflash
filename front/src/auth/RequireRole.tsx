import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '../types/api'
import { homeFor } from './context'
import { useAuth } from './useAuth'

// Protege as rotas de cada perfil: sem login volta para o login, e um
// usuário de outro perfil é levado para a própria área.
export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
  return <Outlet />
}
