import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ApiError, calculateQuote, catalog, createBooking } from './domain.mjs'

const bookings = new Map()
const openApiPath = fileURLToPath(new URL('./openapi.json', import.meta.url))

const sendJson = (response, status, payload, requestId) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-ID',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'X-Request-ID': requestId,
  })
  response.end(JSON.stringify(payload))
}

const readJson = async (request) => {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 128 * 1024) throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body must be 128 KB or smaller.')
    chunks.push(chunk)
  }
  if (chunks.length === 0) throw new ApiError(400, 'INVALID_REQUEST', 'A JSON request body is required.')
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must contain valid JSON.')
  }
}

export function createApiServer() {
  return createServer(async (request, response) => {
    const requestId = request.headers['x-request-id'] || crypto.randomUUID()
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

    try {
      if (request.method === 'OPTIONS') return sendJson(response, 204, {}, requestId)
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return sendJson(response, 200, { data: { status: 'ok', service: 'haven-pine-booking-api', timestamp: new Date().toISOString() } }, requestId)
      }
      if (request.method === 'GET' && url.pathname === '/api/rooms') return sendJson(response, 200, { data: catalog.rooms }, requestId)
      if (request.method === 'GET' && url.pathname === '/api/packages') return sendJson(response, 200, { data: catalog.packages }, requestId)
      if (request.method === 'GET' && url.pathname === '/api/extras') return sendJson(response, 200, { data: catalog.extras }, requestId)
      if (request.method === 'GET' && url.pathname === '/api/openapi.json') {
        const specification = JSON.parse(await readFile(openApiPath, 'utf8'))
        return sendJson(response, 200, specification, requestId)
      }
      if (request.method === 'POST' && url.pathname === '/api/quotes') {
        const quote = calculateQuote(await readJson(request))
        return sendJson(response, 200, { data: quote }, requestId)
      }
      if (request.method === 'POST' && url.pathname === '/api/bookings') {
        const booking = createBooking(await readJson(request))
        bookings.set(booking.reference, booking)
        response.setHeader('Location', `/api/bookings/${encodeURIComponent(booking.reference)}`)
        return sendJson(response, 201, { data: booking }, requestId)
      }
      const bookingMatch = request.method === 'GET' && url.pathname.match(/^\/api\/bookings\/([^/]+)$/)
      if (bookingMatch) {
        const reference = decodeURIComponent(bookingMatch[1]).toUpperCase()
        const booking = bookings.get(reference)
        if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'No booking exists for this reference.', { reference })
        return sendJson(response, 200, { data: booking }, requestId)
      }
      throw new ApiError(404, 'ROUTE_NOT_FOUND', 'The requested API route does not exist.')
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(500, 'INTERNAL_ERROR', 'An unexpected API error occurred.')
      if (!(error instanceof ApiError)) console.error(error)
      return sendJson(response, apiError.status, { error: { code: apiError.code, message: apiError.message, details: apiError.details, requestId } }, requestId)
    }
  })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3001)
  createApiServer().listen(port, '0.0.0.0', () => console.log(`Haven & Pine API listening on port ${port}`))
}
