import type { GuestDetails, Member } from './types'

export const emptyGuest: GuestDetails = { title: '', firstName: '', lastName: '', email: '', phone: '', country: '', arrivalTime: '', requests: '' }

export const guestIsValid = (guest: GuestDetails) =>
  Boolean(guest.title && guest.firstName.trim() && guest.lastName.trim() && guest.email.includes('@') && guest.country && guest.arrivalTime)

// A signed-in member starts with their name and email filled in.
export const initialGuest = (guest: GuestDetails | null, member: Member | null): GuestDetails =>
  guest ?? (member ? { ...emptyGuest, title: member.title, firstName: member.firstName, lastName: member.lastName, email: member.email } : emptyGuest)
