import { describe, expect, it } from 'vitest'
import { bookingReducer, initialState } from './BookingContext'

describe('booking reducer', () => {
  it('resets dependent selections when a room changes', () => {
    const state = { ...initialState, roomId:'garden-queen', packageId:'breakfast', extras:{parking:1} }
    expect(bookingReducer(state,{type:'SET_ROOM',payload:'pine-suite'})).toMatchObject({roomId:'pine-suite',packageId:null,extras:{}})
  })
  it('returns initial state on reset', () => expect(bookingReducer({...initialState,roomId:'pine-suite'},{type:'RESET'})).toEqual(initialState))
  it('keeps the member and demo controls through a reset', () => {
    const member = { token:'t', title:'Ms', firstName:'Nora', lastName:'Lind', email:'member@havenpine.test', tier:'Pine Circle' }
    const state = { ...initialState, member, uiVersion:'v2' as const, bug:'tax' as const, roomId:'pine-suite' }
    expect(bookingReducer(state,{type:'RESET'})).toEqual({ ...initialState, member, uiVersion:'v2', bug:'tax' })
  })
  it('preserves the selected flow when a new search starts', () => {
    const state = bookingReducer(initialState, { type:'SET_FLOW_VARIANT', payload:'checkout-guest' })
    const next = bookingReducer(state, { type:'SET_SEARCH', payload:{ destination:'Berlin',checkIn:'2026-07-10',checkOut:'2026-07-12',adults:2,children:0,rooms:1,accessibleRoom:false,flexibleDates:false } })
    expect(next.flowVariant).toBe('checkout-guest')
  })
})
