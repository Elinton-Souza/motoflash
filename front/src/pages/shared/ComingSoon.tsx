import { ArrowRight, Construction } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '../../components/Card'

export function ComingSoon() {
  const location = useLocation()
  const isMotoboy = location.pathname.startsWith('/motoboy')
  const home = isMotoboy ? '/motoboy/dashboard' : '/restaurant/dashboard'
  return <Card className="mx-auto mt-16 max-w-xl p-10 text-center shadow-sm"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-orange-50 text-brand"><Construction size={26} /></span><h2 className="mt-5 text-xl font-bold text-ink">Tela em preparação</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Esta área será desenvolvida nas próximas etapas. A estrutura de navegação já está pronta.</p><Link to={home} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark">Voltar à visão geral <ArrowRight size={16} /></Link></Card>
}
