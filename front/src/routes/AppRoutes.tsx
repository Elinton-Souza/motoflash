import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { MotoboyLayout } from '../layouts/MotoboyLayout'
import { RestaurantLayout } from '../layouts/RestaurantLayout'
import { Login } from '../pages/auth/Login'
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
  return <Routes>
    <Route element={<AuthLayout />}><Route path="/" element={<Login />} /></Route>
    <Route path="/select-profile" element={<SelectProfile />} />
    <Route path="/motoboy" element={<MotoboyLayout />}><Route path="dashboard" element={<MotoboyDashboard />} /><Route path="request" element={<DeliveryRequest />} /><Route path="delivery" element={<DeliveryInProgress />} /><Route path="finance" element={<MotoboyFinance />} /><Route path="profile" element={<MotoboyProfile />} /></Route>
    <Route path="/restaurant" element={<RestaurantLayout />}><Route path="dashboard" element={<RestaurantDashboard />} /><Route path="new-delivery" element={<NewDelivery />} /><Route path="tracking" element={<DeliveryTracking />} /><Route path="finance" element={<RestaurantFinance />} /><Route path="settings" element={<RestaurantSettings />} /></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
