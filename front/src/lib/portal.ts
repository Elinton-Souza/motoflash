import type { Role } from '../types/api'

// Cada perfil tem a sua própria porta de entrada (login, cadastro e
// recuperação de senha), com o visual pensado para o seu uso:
// o motoboy no celular, o restaurante no computador do balcão.
export type PortalKey = 'motoboy' | 'restaurante' | 'admin'

export const portals = {
  motoboy: {
    key: 'motoboy',
    role: 'MOTOBOY',
    label: 'Motoboy',
    home: '/motoboy/dashboard',
  },
  restaurante: {
    key: 'restaurante',
    role: 'RESTAURANT',
    label: 'Restaurante',
    home: '/restaurant/dashboard',
  },
  // Acesso interno da plataforma (gestão de entregadores). Não tem
  // cadastro público nem recuperação de senha pelo WhatsApp.
  admin: {
    key: 'admin',
    role: 'ADMIN',
    label: 'Administrador',
    home: '/admin/couriers',
  },
} as const satisfies Record<PortalKey, { key: PortalKey; role: Role; label: string; home: string }>

export type Portal = (typeof portals)[PortalKey]

export const portalPaths = (key: PortalKey) => ({
  login: `/entrar/${key}`,
  register: `/cadastro/${key}`,
  forgot: `/recuperar-senha/${key}`,
})

export const portalForRole = (role: Role): PortalKey => (role === 'MOTOBOY' ? 'motoboy' : role === 'ADMIN' ? 'admin' : 'restaurante')

// Perfis que podem se cadastrar e recuperar a senha sozinhos.
export const isPublicPortal = (key: PortalKey) => key !== 'admin'
