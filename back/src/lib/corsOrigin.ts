// Lê CORS_ORIGIN (lista separada por vírgula). Sem valor, libera qualquer origem,
// que é o comportamento usado em desenvolvimento local.
export function corsOrigin(): string | string[] {
  const origins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)

  return origins.length > 0 ? origins : "*"
}
