export function LoadingState({ label = 'Carregando informações...' }: { label?: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500"><span className="size-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />{label}</div>
}
