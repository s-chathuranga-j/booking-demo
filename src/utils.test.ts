import { describe, expect, it } from 'vitest'
import { calculatePrice, createReference, nightsBetween } from './utils'
import { initialState } from './BookingContext'

describe('booking utilities', () => {
  it('counts nights between dates', () => expect(nightsBetween('2026-07-10','2026-07-14')).toBe(4))
  it('returns a deterministic booking reference', () => expect(createReference('Müller')).toBe('HP-MLL-2701'))
  it('calculates room, package, extras and tax', () => {
    const price = calculatePrice({ ...initialState, search: { destination:'Berlin',checkIn:'2026-07-10',checkOut:'2026-07-12',adults:2,children:0,rooms:1,accessibleRoom:false,flexibleDates:false }, roomId:'garden-queen', packageId:'breakfast', extras:{'sparkling-wine':1} })
    expect(price).toMatchObject({ nights:2, roomTotal:370, discount:0, packageTotal:56, extrasTotal:42, subtotal:468, taxes:56.16, total:524.16 })
  })
  const stay = { ...initialState, search: { destination:'Berlin',checkIn:'2026-07-10',checkOut:'2026-07-12',adults:2,children:0,rooms:1,accessibleRoom:false,flexibleDates:false }, roomId:'garden-queen', packageId:'breakfast', extras:{'sparkling-wine':1} }
  it('matches the API member price', () => {
    const member = { token:'t', title:'Ms', firstName:'Nora', lastName:'Lind', email:'member@havenpine.test', tier:'Pine Circle' }
    expect(calculatePrice({ ...stay, member })).toMatchObject({ discount:55.5, subtotal:412.5, total:462 })
  })
  it('charges the wrong tax only when the tax bug is on', () => {
    expect(calculatePrice({ ...stay, bug:'tax' }).total).toBeCloseTo(566.28)
  })
})
