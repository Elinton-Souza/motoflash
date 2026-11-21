import { createContext } from 'react'
import type { AuthUser, Profile, Role } from '../types/api'

export type RegisterInput = {
  name: string
  email: string
  password: string
  phone: string
  role: Exclude<Role, 'ADMIN'>
  restaurantName?: string
  restaurantAddress?: string
  vehiclePlate?: string
}

export type AuthContextValue = {
  user: AuthUser | null
  profile: Profile | null
  login: (email: string, password: string, role?: Role) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => void
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function homeFor(role: Role) {
  if (role === 'MOTOBOY') return '/motoboy/dashboard'
  if (role === 'RESTAURANT') return '/restaurant/dashboard'
  if (role === 'ADMIN') return '/admin/couriers'
  return '/'
}

export function loginFor(role: Role) {
  if (role === 'MOTOBOY') return '/entrar/motoboy'
  if (role === 'ADMIN') return '/entrar/admin'
  return '/entrar/restaurante'
}
