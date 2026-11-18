import { useOutletContext } from 'react-router-dom'
import type { GpsState } from './useCourierGps'

// Dados compartilhados pelo layout do motoboy com as telas (ex.: GPS).
export type MotoboyOutletContext = { gps: GpsState }

export const useMotoboyContext = () => useOutletContext<MotoboyOutletContext>()
