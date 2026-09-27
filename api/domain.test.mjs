import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError, authenticate, calculateQuote, createBooking, memberAccount } from './domain.mjs'

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
    assert.deepEqual(calculateQuote(request), { currency: 'EUR', nights: 2, roomTotal: 370, discount: 0, packageTotal: 56, extrasTotal: 42, subtotal: 468, taxes: 56.16, total: 524.16, extras: { 'sparkling-wine': 1 } })
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

  it('accepts every booking flow variant the UI offers', () => {
    for (const flowVariant of ['standard', 'checkout-guest', 'breakfast-included']) {
      assert.equal(createBooking({ ...request, flowVariant }, '2026-07-10T10:00:00.000Z').status, 'confirmed')
    }
  })

  it('takes 15% off the room for members only', () => {
    assert.deepEqual(calculateQuote(request, { member: true }), { currency: 'EUR', nights: 2, roomTotal: 370, discount: 55.5, packageTotal: 56, extrasTotal: 42, subtotal: 412.5, taxes: 49.5, total: 462, extras: { 'sparkling-wine': 1 } })
    assert.equal(createBooking(request, '2026-07-10T10:00:00.000Z', memberAccount).price.total, 462)
  })

  it('signs in the demo member and rejects a wrong password', () => {
    assert.equal(authenticate({ email: ' Member@HavenPine.test ', password: 'secret' }, 'secret').tier, 'Pine Circle')
    assert.throws(() => authenticate({ email: memberAccount.email, password: 'wrong' }, 'secret'), (error) => error instanceof ApiError && error.status === 401)
  })

  it('rejects an unknown flow variant', () => {
    assert.throws(() => createBooking({ ...request, flowVariant: 'mystery' }), (error) => error instanceof ApiError && error.code === 'INVALID_FLOW_VARIANT')
  })
})
