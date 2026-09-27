import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { BookingProvider, useBooking } from './BookingContext'
import { Layout } from './components/Layout'
import { RouteGuard } from './components/RouteGuard'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { BookingDetailsPage } from './pages/BookingDetailsPage'
import { PackagesPage } from './pages/PackagesPage'
import { PaymentFramePage } from './pages/PaymentFramePage'
import { RoomsPage } from './pages/RoomsPage'
import { SearchPage } from './pages/SearchPage'
import { GuestInformationPage } from './pages/GuestInformationPage'
import { SignInPage } from './pages/SignInPage'

function AppRoutes() {
  const location = useLocation()
  const { dispatch } = useBooking()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const requestedFlow = params.get('flow')
    if (requestedFlow === 'standard' || requestedFlow === 'checkout-guest' || requestedFlow === 'breakfast-included') {
      dispatch({ type: 'SET_FLOW_VARIANT', payload: requestedFlow })
    }
    const ui = params.get('ui')
    if (ui === 'v1' || ui === 'v2') dispatch({ type: 'SET_DEMO', payload: { uiVersion: ui } })
    const bug = params.get('bug')
    if (bug === 'none' || bug === 'tax') dispatch({ type: 'SET_DEMO', payload: { bug } })
  }, [dispatch, location.search])
  if (location.pathname === '/payment-frame') return <PaymentFramePage />
  return <Layout><Routes>
    <Route path="/" element={<SearchPage />} />
    <Route path="/sign-in" element={<SignInPage />} />
    <Route path="/rooms" element={<RouteGuard require="search"><RoomsPage /></RouteGuard>} />
    <Route path="/packages" element={<RouteGuard require="room"><PackagesPage /></RouteGuard>} />
    <Route path="/guest-information" element={<RouteGuard require="package"><GuestInformationPage /></RouteGuard>} />
    <Route path="/checkout" element={<RouteGuard require="package"><CheckoutPage /></RouteGuard>} />
    <Route path="/confirmation" element={<RouteGuard require="confirmation"><ConfirmationPage /></RouteGuard>} />
    <Route path="/my-booking" element={<RouteGuard require="confirmation"><BookingDetailsPage /></RouteGuard>} />
    <Route path="*" element={<SearchPage />} />
  </Routes></Layout>
}

export default function App() {
  return <BrowserRouter><BookingProvider><AppRoutes /></BookingProvider></BrowserRouter>
}
