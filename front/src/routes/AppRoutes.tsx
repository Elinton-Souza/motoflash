import { Navigate, Route, Routes } from 'react-router-dom'
import { homeFor } from '../auth/context'
import { RequireRole } from '../auth/RequireRole'
import { useAuth } from '../auth/useAuth'
import { AuthLayout } from '../layouts/AuthLayout'
import { MotoboyLayout } from '../layouts/MotoboyLayout'
import { RestaurantLayout } from '../layouts/RestaurantLayout'
import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { SelectProfile } from '../pages/auth/SelectProfile'
import { MotoboyDashboard } from '../pages/motoboy/MotoboyDashboard'
import { DeliveryRequest } from '../pages/motoboy/DeliveryRequest'
import { DeliveryInProgress } from '../pages/motoboy/DeliveryInProgress'
import { MotoboyFinance } from '../pages/motoboy/MotoboyFinance'
import { RestaurantDashboard } from '../pages/restaurant/RestaurantDashboard'
import { NewDelivery } from '../pages/restaurant/NewDelivery'
import { DeliveryTracking } from '../pages/restaurant/DeliveryTracking'
import { RestaurantFinance } from '../pages/restaurant/RestaurantFinance'
import { RestaurantSettings } from '../pages/restaurant/RestaurantSettings'
import { MotoboyProfile } from '../pages/motoboy/MotoboyProfile'

export function AppRoutes() {
  const { user } = useAuth()
  const loggedHome = user ? homeFor(user.role) : null

  return <Routes>
    <Route element={<AuthLayout />}>
      <Route path="/" element={loggedHome && loggedHome !== '/' ? <Navigate to={loggedHome} replace /> : <Login />} />
      <Route path="/register" element={<Register />} />
    </Route>
    <Route path="/select-profile" element={<SelectProfile />} />
    <Route element={<RequireRole role="MOTOBOY" />}>
      <Route path="/motoboy" element={<MotoboyLayout />}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<MotoboyDashboard />} /><Route path="request" element={<DeliveryRequest />} /><Route path="delivery" element={<DeliveryInProgress />} /><Route path="finance" element={<MotoboyFinance />} /><Route path="profile" element={<MotoboyProfile />} /></Route>
    </Route>
    <Route element={<RequireRole role="RESTAURANT" />}>
      <Route path="/restaurant" element={<RestaurantLayout />}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<RestaurantDashboard />} /><Route path="new-delivery" element={<NewDelivery />} /><Route path="tracking" element={<DeliveryTracking />} /><Route path="finance" element={<RestaurantFinance />} /><Route path="settings" element={<RestaurantSettings />} /></Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
