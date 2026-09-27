import catalog from '../shared/catalog.json' with { type: 'json' }

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

const required = (condition, code, message, details) => {
  if (!condition) throw new ApiError(400, code, message, details)
}

export const nightsBetween = (start, end) => {
  if (!start || !end) return 0
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000))
}

export function calculateQuote(input, { member = false } = {}) {
  required(input && typeof input === 'object', 'INVALID_REQUEST', 'A JSON request body is required.')
  const nights = nightsBetween(input.search?.checkIn, input.search?.checkOut)
  required(nights > 0, 'INVALID_DATES', 'Check-out must be after check-in.', { fields: ['search.checkIn', 'search.checkOut'] })

  const room = catalog.rooms.find((item) => item.id === input.roomId)
  required(room, 'ROOM_NOT_FOUND', 'The selected room does not exist.', { roomId: input.roomId })
  required(room.available, 'ROOM_UNAVAILABLE', 'The selected room is unavailable.', { roomId: input.roomId })

  const selectedPackage = catalog.packages.find((item) => item.id === input.packageId)
  required(selectedPackage, 'PACKAGE_NOT_FOUND', 'The selected package does not exist.', { packageId: input.packageId })

  const requestedExtras = input.extras ?? {}
  const normalizedExtras = {}
  let extrasTotal = 0
  for (const extra of catalog.extras) {
    const quantity = Number(requestedExtras[extra.id] ?? 0)
    required(Number.isInteger(quantity) && quantity >= 0 && quantity <= extra.maxQuantity, 'INVALID_EXTRA_QUANTITY', `Invalid quantity for ${extra.name}.`, { extraId: extra.id, maxQuantity: extra.maxQuantity })
    if (quantity > 0) normalizedExtras[extra.id] = quantity
    extrasTotal += extra.price * quantity
  }

  const roomTotal = room.nightlyRate * nights
  const discount = member ? Number((roomTotal * catalog.memberDiscount).toFixed(2)) : 0
  const packageTotal = selectedPackage.pricePerNight * nights
  const subtotal = Number((roomTotal - discount + packageTotal + extrasTotal).toFixed(2))
  const taxes = Number((subtotal * 0.12).toFixed(2))
  const total = Number((subtotal + taxes).toFixed(2))

  return { currency: 'EUR', nights, roomTotal, discount, packageTotal, extrasTotal, subtotal, taxes, total, extras: normalizedExtras }
}

// The one demo member account. The password comes from DEMO_MEMBER_PASSWORD so tests can keep it out of their text.
export const memberAccount = { title: 'Ms', firstName: 'Nora', lastName: 'Lind', email: 'member@havenpine.test', tier: 'Pine Circle' }

export function authenticate(credentials, password = process.env.DEMO_MEMBER_PASSWORD ?? 'pine-circle-2026') {
  const email = typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : ''
  if (email !== memberAccount.email || credentials?.password !== password) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'The email or password is incorrect.')
  }
  return memberAccount
}

export function validateGuest(guest) {
  required(guest && typeof guest === 'object', 'INVALID_GUEST', 'Guest details are required.')
  required(guest.title && guest.firstName?.trim() && guest.lastName?.trim(), 'INVALID_GUEST_NAME', 'Guest title, first name, and last name are required.')
  required(typeof guest.email === 'string' && guest.email.includes('@'), 'INVALID_GUEST_EMAIL', 'A valid guest email is required.')
  required(guest.country && guest.arrivalTime, 'INVALID_GUEST_DETAILS', 'Guest country and arrival time are required.')
}

export function validateNotes(notes) {
  if (!notes) return null
  required(typeof notes.name === 'string' && /\.(md|txt)$/i.test(notes.name), 'INVALID_NOTES_FILE', 'Notes must be a .md or .txt file.')
  required(typeof notes.content === 'string', 'INVALID_NOTES_CONTENT', 'Notes file content must be text.')
  required(Buffer.byteLength(notes.content, 'utf8') <= 64 * 1024, 'NOTES_FILE_TOO_LARGE', 'Notes file must be 64 KB or smaller.')
  return { name: notes.name, type: notes.type || 'text/plain', content: notes.content }
}

export function createReference(lastName) {
  return `HP-${lastName.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase().padEnd(3, 'X')}-2701`
}

export function createBooking(input, createdAt = new Date().toISOString(), member = null) {
  validateGuest(input?.guest)
  required(input?.payment?.status === 'approved', 'PAYMENT_NOT_APPROVED', 'An approved payment is required.')
  required(/^\d{4}$/.test(input.payment.lastFour ?? ''), 'INVALID_PAYMENT_REFERENCE', 'Payment lastFour must contain four digits.')
  required(['standard', 'checkout-guest', 'breakfast-included'].includes(input.flowVariant), 'INVALID_FLOW_VARIANT', 'Unknown booking flow variant.')

  const quote = calculateQuote(input, { member: Boolean(member) })
  const room = catalog.rooms.find((item) => item.id === input.roomId)
  const selectedPackage = catalog.packages.find((item) => item.id === input.packageId)
  const notes = validateNotes(input.notes)
  const reference = createReference(input.guest.lastName)

  return {
    reference,
    createdAt,
    status: 'confirmed',
    flowVariant: input.flowVariant,
    search: input.search,
    room,
    package: selectedPackage,
    extras: catalog.extras.filter((extra) => quote.extras[extra.id]).map((extra) => ({ ...extra, quantity: quote.extras[extra.id] })),
    guest: input.guest,
    member: member ? { email: member.email, tier: member.tier } : null,
    payment: { lastFour: input.payment.lastFour, status: 'paid' },
    notes,
    price: quote,
  }
}

export { catalog }
