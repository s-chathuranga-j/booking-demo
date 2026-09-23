export interface BookingSearch {
  destination: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  rooms: number
  roomGuests?: RoomGuests[]
  accessibleRoom: boolean
  flexibleDates: boolean
}

export interface RoomGuests {
  adults: number
  children: number
}

export interface Room {
  id: string
  name: string
  description: string
  nightlyRate: number
  capacity: number
  amenities: string[]
  available: boolean
  imageClass: string
}

export interface Package {
  id: string
  name: string
  description: string
  pricePerNight: number
  features: string[]
}

export interface Extra {
  id: string
  name: string
  description: string
  price: number
  unit: string
  maxQuantity: number
}

export interface GuestDetails {
  title: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  arrivalTime: string
  requests: string
}

export interface PaymentResult {
  status: 'approved' | 'declined'
  lastFour: string
}

export interface BookingConfirmation {
  reference: string
  createdAt: string
  paymentLastFour: string
}

export interface BookingState {
  flowVariant: 'standard' | 'checkout-guest'
  search: BookingSearch | null
  roomId: string | null
  packageId: string | null
  extras: Record<string, number>
  guest: GuestDetails | null
  confirmation: BookingConfirmation | null
}
