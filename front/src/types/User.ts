export type UserRole = 'motoboy' | 'restaurant'

export interface User { id: string; name: string; role: UserRole; avatar?: string }
