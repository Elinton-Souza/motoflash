// Gera o código numérico de retirada (4 a 6 dígitos) que o restaurante
// mostra na tela e o motoboy digita para liberar a entrega (Épico 2/3/4).
export function generateCode(digits: number = 4): string {
  if (digits < 4 || digits > 6) {
    throw new Error("O código de retirada deve ter entre 4 e 6 dígitos")
  }

  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  const code = Math.floor(min + Math.random() * (max - min + 1))

  return String(code)
}
