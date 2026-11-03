export const onlyDigits = (value: string) => value.replace(/\D/g, '')

// (11) 98888-7777 ou (11) 3333-4444
export function maskPhone(value: string) {
  let digits = onlyDigits(value)
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2)
  digits = digits.slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export const isValidPhone = (value: string) => {
  const length = onlyDigits(value).length
  return length === 10 || length === 11
}

// Placa no padrão antigo (ABC1234) ou Mercosul (ABC1D23).
export const maskPlate = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)

export const isValidPlate = (value: string) => /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(value)

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
