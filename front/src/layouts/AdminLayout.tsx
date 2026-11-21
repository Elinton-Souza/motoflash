import { Bike } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Header } from '../components/Header'
import { Sidebar, type NavigationItem } from '../components/Sidebar'

const items: NavigationItem[] = [
  { label: 'Entregadores', to: '/admin/couriers', icon: Bike },
]

// Área do administrador da plataforma: gestão dos entregadores.
export function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const leave = () => {
    logout()
    navigate('/entrar/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar items={items} onLogout={leave} home="/admin/couriers" />
      <div className="min-w-0 flex-1">
        <Header title="Gestão de entregadores" name={user?.name ?? ''} role="Administrador" onLogout={leave} />
        <main className="mx-auto max-w-7xl p-4 pb-24 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
