import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { homeFor } from '../auth/context'
import { RequireRole } from '../auth/RequireRole'
import { usePortal } from '../auth/usePortal'
import { useAuth } from '../auth/useAuth'
import { AdminLayout } from '../layouts/AdminLayout'
import { AuthPortalLayout } from '../layouts/AuthPortalLayout'
import { isPublicPortal } from '../lib/portal'
import { CourierDetails } from '../pages/admin/CourierDetails'
import { Couriers } from '../pages/admin/Couriers'
import { MotoboyLayout } from '../layouts/MotoboyLayout'
import { RestaurantLayout } from '../layouts/RestaurantLayout'
import { ForgotPassword } from '../pages/auth/ForgotPassword'
import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { Welcome } from '../pages/auth/Welcome'
import { DeliveryInProgress } from '../pages/motoboy/DeliveryInProgress'
import { DeliveryRequest } from '../pages/motoboy/DeliveryRequest'
import { MotoboyDashboard } from '../pages/motoboy/MotoboyDashboard'
import { MotoboyFinance } from '../pages/motoboy/MotoboyFinance'
import { MotoboyProfile } from '../pages/motoboy/MotoboyProfile'
import { DeliveryTracking } from '../pages/restaurant/DeliveryTracking'
import { NewDelivery } from '../pages/restaurant/NewDelivery'
import { Orders } from '../pages/restaurant/Orders'
import { RestaurantDashboard } from '../pages/restaurant/RestaurantDashboard'
import { RestaurantFinance } from '../pages/restaurant/RestaurantFinance'
import { RestaurantSettings } from '../pages/restaurant/RestaurantSettings'

// Links antigos (/register?role=...) continuam funcionando.
function LegacyRegister() {
  const role = new URLSearchParams(useLocation().search).get('role')
  return <Navigate to={role === 'MOTOBOY' ? '/cadastro/motoboy' : role === 'RESTAURANT' ? '/cadastro/restaurante' : '/'} replace />
}

// Cadastro e recuperação de senha só existem para motoboy e restaurante.
// O administrador é criado direto no banco (seed).
function PublicPortalOnly({ children }: { children: React.ReactElement }) {
  const portal = usePortal()
  return portal && !isPublicPortal(portal.key) ? <Navigate to={`/entrar/${portal.key}`} replace /> : children
}

export function AppRoutes() {
  const { user } = useAuth()
  // Usuário já logado não precisa ver as telas de acesso.
  const guest = (element: React.ReactElement) => (user ? <Navigate to={homeFor(user.role)} replace /> : element)

  return <Routes>
    <Route path="/" element={guest(<Welcome />)} />
    <Route element={<AuthPortalLayout />}>
      <Route path="/entrar/:portal" element={guest(<Login />)} />
      <Route path="/cadastro/:portal" element={guest(<PublicPortalOnly><Register /></PublicPortalOnly>)} />
      <Route path="/recuperar-senha/:portal" element={<PublicPortalOnly><ForgotPassword /></PublicPortalOnly>} />
    </Route>
    <Route path="/register" element={<LegacyRegister />} />
    <Route path="/select-profile" element={<Navigate to="/" replace />} />

    <Route element={<RequireRole role="MOTOBOY" />}>
      <Route path="/motoboy" element={<MotoboyLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MotoboyDashboard />} />
        <Route path="request" element={<DeliveryRequest />} />
        <Route path="delivery" element={<DeliveryInProgress />} />
        <Route path="finance" element={<MotoboyFinance />} />
        <Route path="profile" element={<MotoboyProfile />} />
      </Route>
    </Route>

    <Route element={<RequireRole role="RESTAURANT" />}>
      <Route path="/restaurant" element={<RestaurantLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="new-delivery" element={<NewDelivery />} />
        <Route path="tracking" element={<DeliveryTracking />} />
        <Route path="finance" element={<RestaurantFinance />} />
        <Route path="settings" element={<RestaurantSettings />} />
      </Route>
    </Route>

    <Route element={<RequireRole role="ADMIN" />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="couriers" replace />} />
        <Route path="couriers" element={<Couriers />} />
        <Route path="couriers/:id" element={<CourierDetails />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
