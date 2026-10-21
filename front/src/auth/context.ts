import { createContext } from 'react'
import type { AuthUser, Profile, Role } from '../types/api'

export type RegisterInput = {
  name: string
  email: string
  password: string
  phone?: string
  role: Exclude<Role, 'ADMIN'>
  restaurantName?: string
  restaurantAddress?: string
  vehiclePlate?: string
}

export type AuthContextValue = {
  user: AuthUser | null
  profile: Profile | null
  login: (email: string, password: string) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => void
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function homeFor(role: Role) {
  if (role === 'MOTOBOY') return '/motoboy/dashboard'
  if (role === 'RESTAURANT') return '/restaurant/dashboard'
  return '/'
}
