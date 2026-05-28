import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'RM') {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency === 'RM' ? 'MYR' : currency,
    currencyDisplay: 'code',
  })
    .format(amount)
    .replace('MYR', currency);
}
