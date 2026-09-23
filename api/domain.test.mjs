import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError, calculateQuote, createBooking } from './domain.mjs'

const request = {
  flowVariant: 'standard',
  search: { destination: 'Berlin', checkIn: '2026-07-10', checkOut: '2026-07-12', adults: 2, children: 0, rooms: 1 },
  roomId: 'garden-queen',
  packageId: 'breakfast',
  extras: { 'sparkling-wine': 1 },
  guest: { title: 'Ms', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '', country: 'DE', arrivalTime: '15:00 – 18:00', requests: '' },
  payment: { status: 'approved', lastFour: '4242' },
}

describe('booking API domain', () => {
  it('calculates the same deterministic quote as the UI', () => {
    assert.deepEqual(calculateQuote(request), { currency: 'EUR', nights: 2, roomTotal: 370, packageTotal: 56, extrasTotal: 42, subtotal: 468, taxes: 56.16, total: 524.16, extras: { 'sparkling-wine': 1 } })
  })

  it('creates a completed booking with notes', () => {
    const booking = createBooking({ ...request, notes: { name: 'arrival.md', type: 'text/markdown', content: '# Late arrival' } }, '2026-07-10T10:00:00.000Z')
    assert.equal(booking.reference, 'HP-LOV-2701')
    assert.equal(booking.status, 'confirmed')
    assert.equal(booking.notes.name, 'arrival.md')
    assert.equal(booking.price.total, 524.16)
  })

  it('rejects declined payments', () => {
    assert.throws(() => createBooking({ ...request, payment: { status: 'declined', lastFour: '0002' } }), (error) => error instanceof ApiError && error.code === 'PAYMENT_NOT_APPROVED')
  })
})
