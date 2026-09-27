import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { createApiServer } from './server.mjs'

let server
let baseUrl

before(async () => {
  server = createApiServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))

describe('booking API routes', () => {
  it('returns health and catalog endpoints', async () => {
    const health = await fetch(`${baseUrl}/api/health`)
    const rooms = await fetch(`${baseUrl}/api/rooms`)
    assert.equal(health.status, 200)
    assert.equal((await health.json()).data.status, 'ok')
    assert.equal((await rooms.json()).data.length, 4)
  })

  it('prices a quote for a signed-in member and refuses a stale token', async () => {
    const login = await fetch(`${baseUrl}/api/auth/login`, { method: 'POST', body: JSON.stringify({ email: 'member@havenpine.test', password: 'pine-circle-2026' }) })
    const { token } = (await login.json()).data
    const quote = { search: { checkIn: '2026-07-10', checkOut: '2026-07-12' }, roomId: 'garden-queen', packageId: 'breakfast' }
    const priced = await fetch(`${baseUrl}/api/quotes`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(quote) })
    assert.equal((await priced.json()).data.discount, 55.5)
    const stale = await fetch(`${baseUrl}/api/quotes`, { method: 'POST', headers: { Authorization: 'Bearer nope' }, body: JSON.stringify(quote) })
    assert.equal(stale.status, 401)
  })

  it('returns structured errors for unknown bookings', async () => {
    const response = await fetch(`${baseUrl}/api/bookings/HP-NOT-FOUND`)
    const body = await response.json()
    assert.equal(response.status, 404)
    assert.equal(body.error.code, 'BOOKING_NOT_FOUND')
    assert.ok(body.error.requestId)
  })
})
