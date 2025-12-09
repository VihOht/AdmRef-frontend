import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


interface CurrencyFormatOptions {
  currency: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export const formatCurrency = (value: number, currency: string): string => {
  const currencyMap: Record<string, CurrencyFormatOptions> = {
    USD: { currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    BRL: { currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    EUR: { currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    GBP: { currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  }

  const options = currencyMap[currency] || { currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: options.currency,
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
  }).format(value)
}