import type { BookingState, Member, PaymentResult } from './types'

interface NotesPayload {
  name: string
  type: string
  content: string
}

interface ApiBooking {
  reference: string
  createdAt: string
  payment: { lastFour: string; status: string }
}

interface ApiResponse<T> {
  data: T
}

interface ApiErrorResponse {
  error?: { message?: string }
}

export async function signIn(email: string, password: string): Promise<Member> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await response.json() as ApiResponse<{ token: string; member: Omit<Member, 'token'> }> & ApiErrorResponse
  if (!response.ok) throw new Error(body.error?.message ?? 'Sign in failed.')
  return { ...body.data.member, token: body.data.token }
}

export async function createApiBooking(state: BookingState, payment: PaymentResult, notesFile: File | null): Promise<ApiBooking> {
  const notes: NotesPayload | undefined = notesFile ? { name: notesFile.name, type: notesFile.type, content: await notesFile.text() } : undefined
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(state.member && { Authorization: `Bearer ${state.member.token}` }) },
    body: JSON.stringify({
      flowVariant: state.flowVariant,
      search: state.search,
      roomId: state.roomId,
      packageId: state.packageId,
      extras: state.extras,
      guest: state.guest,
      payment,
      notes,
    }),
  })
  const body = await response.json() as ApiResponse<ApiBooking> & ApiErrorResponse
  if (!response.ok) throw new Error(body.error?.message ?? 'The booking API could not complete the reservation.')
  return body.data
}
