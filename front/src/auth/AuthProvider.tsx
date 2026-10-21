import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, loadSession, saveSession, setUnauthorizedHandler } from '../lib/api'
import { connectRealtime } from '../lib/realtime'
import type { Profile, Session } from '../types/api'
import { AuthContext, type RegisterInput } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const [profile, setProfile] = useState<Profile | null>(null)
  const userId = session?.user.id

  const startSession = useCallback((next: Session) => {
    saveSession(next)
    setSession(next)
    return next.user
  }, [])

  const login = useCallback(
    async (email: string, password: string) => startSession(await api<Session>('/auth/login', { method: 'POST', body: { email, password } })),
    [startSession],
  )

  const register = useCallback(
    async (input: RegisterInput) => startSession(await api<Session>('/auth/register', { method: 'POST', body: input })),
    [startSession],
  )

  const logout = useCallback(() => {
    saveSession(null)
    setSession(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    setProfile(await api<Profile>('/users/me'))
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(undefined)
  }, [logout])

  useEffect(() => {
    if (!userId) return
    api<Profile>('/users/me').then(setProfile).catch(() => undefined)
    return connectRealtime(userId)
  }, [userId])

  const value = useMemo(
    () => ({ user: session?.user ?? null, profile, login, register, logout, refreshProfile }),
    [session, profile, login, register, logout, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
