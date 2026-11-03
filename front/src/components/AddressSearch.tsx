import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { searchAddress, type AddressSuggestion } from '../lib/geo'
import { Input } from './Input'

type AddressSearchProps = {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  // Chamado quando o usuário escolhe uma sugestão (com as coordenadas).
  onSelect: (suggestion: AddressSuggestion | null) => void
}

// Campo de endereço com sugestões do OpenStreetMap (via API /geo/search).
export function AddressSearch({ id, label, value, error, onChange, onSelect }: AddressSearchProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const skipNext = useRef(false)

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false
      return
    }
    if (value.trim().length < 5) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([])
      return
    }
    setLoading(true)
    const timer = window.setTimeout(() => {
      searchAddress(value)
        .then((items) => {
          setSuggestions(items)
          setOpen(true)
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 450)
    return () => window.clearTimeout(timer)
  }, [value])

  function choose(item: AddressSuggestion) {
    skipNext.current = true
    onChange(item.label.split(', ').slice(0, 4).join(', '))
    onSelect(item)
    setOpen(false)
  }

  return (
    <div className="relative">
      <Input
        id={id}
        label={label}
        placeholder="Rua, número, bairro e cidade"
        autoComplete="off"
        value={value}
        error={error}
        hint={loading ? 'Buscando endereço...' : 'Escolha uma sugestão para marcar o ponto exato no mapa.'}
        onChange={(event) => {
          onChange(event.target.value)
          onSelect(null)
        }}
        onFocus={() => suggestions.length && setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute inset-x-0 top-[76px] z-[1000] max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg" role="listbox">
          {suggestions.map((item) => (
            <li key={`${item.lat},${item.lng}`}>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)} className="flex w-full gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand" /><span className="line-clamp-2">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
