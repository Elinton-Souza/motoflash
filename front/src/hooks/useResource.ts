import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '../lib/api'
import { subscribe, type RealtimeEvent } from '../lib/realtime'

type Options = {
  // Recarrega periodicamente (fallback caso o WebSocket caia).
  refreshMs?: number
  // Recarrega quando algum destes eventos em tempo real chegar.
  events?: RealtimeEvent[]
  // Recarrega quando este valor mudar (ex.: id selecionado na URL).
  key?: string
}

export function useResource<T>(fetcher: () => Promise<T>, { refreshMs, events, key }: Options = {}) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const reload = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError('')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload, key])

  useEffect(() => {
    if (!refreshMs) return
    const id = window.setInterval(() => void reload(), refreshMs)
    return () => window.clearInterval(id)
  }, [reload, refreshMs])

  const eventsKey = events?.join(',') ?? ''
  useEffect(() => {
    if (!eventsKey) return
    const names = eventsKey.split(',')
    return subscribe((event) => {
      if (names.includes(event)) void reload()
    })
  }, [eventsKey, reload])

  return { data, error, loading, reload }
}
