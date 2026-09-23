import type { GuestDetails } from './types'

export const emptyGuest: GuestDetails = { title: '', firstName: '', lastName: '', email: '', phone: '', country: '', arrivalTime: '', requests: '' }

export const guestIsValid = (guest: GuestDetails) =>
  Boolean(guest.title && guest.firstName.trim() && guest.lastName.trim() && guest.email.includes('@') && guest.country && guest.arrivalTime)
