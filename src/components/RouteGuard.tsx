import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useBooking } from '../BookingContext'

export function RouteGuard({ require, children }: { require: 'search' | 'room' | 'package' | 'confirmation'; children: ReactNode }) {
  const { state } = useBooking()
  const allowed = require === 'search' ? !!state.search : require === 'room' ? !!state.roomId : require === 'package' ? !!state.packageId : !!state.confirmation
  return allowed ? <>{children}</> : <Navigate to="/" replace />
}
