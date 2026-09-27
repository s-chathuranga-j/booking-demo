/* eslint-disable react-refresh/only-export-components -- reducer and hook are intentionally colocated with their provider */
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { BookingConfirmation, BookingSearch, BookingState, GuestDetails, Member } from './types'

const STORAGE_KEY = 'haven-pine-booking'

export const initialState: BookingState = {
  flowVariant: 'standard', uiVersion: 'v1', bug: 'none', member: null, search: null, roomId: null, packageId: null, extras: {}, guest: null, confirmation: null,
}

// The demo controls and the signed-in member outlive any single booking.
const settings = ({ flowVariant, uiVersion, bug, member }: BookingState) => ({ flowVariant, uiVersion, bug, member })

type Action =
  | { type: 'SET_FLOW_VARIANT'; payload: BookingState['flowVariant'] }
  | { type: 'SET_DEMO'; payload: Partial<Pick<BookingState, 'uiVersion' | 'bug'>> }
  | { type: 'SIGN_IN'; payload: Member }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_SEARCH'; payload: BookingSearch }
  | { type: 'SET_ROOM'; payload: string }
  | { type: 'SET_PACKAGE'; payload: string }
  | { type: 'SET_EXTRA'; payload: { id: string; quantity: number } }
  | { type: 'SET_GUEST'; payload: GuestDetails }
  | { type: 'CONFIRM'; payload: BookingConfirmation }
  | { type: 'RESET' }

export function bookingReducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case 'SET_FLOW_VARIANT': return { ...state, flowVariant: action.payload }
    case 'SET_DEMO': return { ...state, ...action.payload }
    case 'SIGN_IN': return { ...state, member: action.payload }
    case 'SIGN_OUT': return { ...state, member: null }
    case 'SET_SEARCH': return { ...initialState, ...settings(state), search: action.payload }
    case 'SET_ROOM': return { ...state, roomId: action.payload, packageId: null, extras: {} }
    case 'SET_PACKAGE': return { ...state, packageId: action.payload }
    case 'SET_EXTRA': return { ...state, extras: { ...state.extras, [action.payload.id]: action.payload.quantity } }
    case 'SET_GUEST': return { ...state, guest: action.payload }
    case 'CONFIRM': return { ...state, confirmation: action.payload }
    case 'RESET': return { ...initialState, ...settings(state) }
  }
}

interface BookingContextValue {
  state: BookingState
  dispatch: React.Dispatch<Action>
}

const BookingContext = createContext<BookingContextValue | null>(null)

function loadState(): BookingState {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY)
    return value ? { ...initialState, ...JSON.parse(value) as BookingState } : initialState
  } catch { return initialState }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState, loadState)
  useEffect(() => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])
  return <BookingContext.Provider value={{ state, dispatch }}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const value = useContext(BookingContext)
  if (!value) throw new Error('useBooking must be used inside BookingProvider')
  return value
}
