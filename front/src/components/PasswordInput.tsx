import { useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from './Input'

export function PasswordInput(props: Omit<ComponentProps<typeof Input>, 'type' | 'trailing'>) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={<button type="button" onClick={() => setVisible((value) => !value)} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
    />
  )
}
