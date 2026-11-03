import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { homeFor } from '../auth/context'
import { RequireRole } from '../auth/RequireRole'
import { useAuth } from '../auth/useAuth'
import { AuthPortalLayout } from '../layouts/AuthPortalLayout'
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

export function AppRoutes() {
  const { user } = useAuth()
  // Usuário já logado não precisa ver as telas de acesso.
  const guest = (element: React.ReactElement) => (user && user.role !== 'ADMIN' ? <Navigate to={homeFor(user.role)} replace /> : element)

  return <Routes>
    <Route path="/" element={guest(<Welcome />)} />
    <Route element={<AuthPortalLayout />}>
      <Route path="/entrar/:portal" element={guest(<Login />)} />
      <Route path="/cadastro/:portal" element={guest(<Register />)} />
      <Route path="/recuperar-senha/:portal" element={<ForgotPassword />} />
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

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
