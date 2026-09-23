import { extras, packages, rooms } from './data'
import type { BookingState } from './types'

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(value)

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))

export const nightsBetween = (start?: string, end?: string) => {
  if (!start || !end) return 0
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000))
}

export const calculatePrice = (state: BookingState) => {
  const nights = nightsBetween(state.search?.checkIn, state.search?.checkOut)
  const room = rooms.find((item) => item.id === state.roomId)
  const selectedPackage = packages.find((item) => item.id === state.packageId)
  const roomTotal = (room?.nightlyRate ?? 0) * nights
  const packageTotal = (selectedPackage?.pricePerNight ?? 0) * nights
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price * (state.extras[extra.id] ?? 0), 0)
  const subtotal = roomTotal + packageTotal + extrasTotal
  const taxes = subtotal * 0.12
  return { nights, roomTotal, packageTotal, extrasTotal, subtotal, taxes, total: subtotal + taxes }
}

export const createReference = (lastName: string) =>
  `HP-${lastName.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase().padEnd(3, 'X')}-2701`
