import type { ClienteType } from '../utils/ClienteType'
import { create } from 'zustand'

type ClienteStore = {
    cliente: ClienteType
    logaCliente: (clienteLogado: ClienteType) => void
    deslogaCliente: () => void
}

export const useClienteStore = create<ClienteStore>((set) => ({
    cliente: {} as ClienteType,
    logaCliente: (clienteLogado) => set({cliente: clienteLogado}),
    deslogaCliente: () => set({cliente: {} as ClienteType})
}))