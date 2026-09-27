import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useBooking } from '../BookingContext'
import { BookingSummary } from '../components/Summary'
import { GuestFields } from '../components/GuestFields'
import { guestIsValid, initialGuest } from '../guestUtils'

export function GuestInformationPage() {
  const { state, dispatch } = useBooking()
  const navigate = useNavigate()
  const [guest, setGuest] = useState(() => initialGuest(state.guest, state.member))
  const [error, setError] = useState('')

  if (state.flowVariant === 'checkout-guest') return <Navigate to="/checkout" replace />

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!guestIsValid(guest)) { setError('Complete all required guest details.'); return }
    dispatch({ type: 'SET_GUEST', payload: guest })
    navigate('/checkout')
  }

  return <section className="content-page" data-test-id="guest-information-page"><div className="page-heading" data-test-id="guest-information-heading-block"><p className="eyebrow" data-test-id="guest-information-eyebrow">Who is staying?</p><h1 data-test-id="guest-information-heading">Guest information</h1><p data-test-id="guest-information-subheading">Tell us who to welcome. Payment comes next.</p></div><form onSubmit={submit} noValidate data-test-id="guest-information-form"><div className="split-layout" data-test-id="guest-information-layout"><div data-test-id="guest-information-form-column"><fieldset className="form-section" data-test-id="guest-information-guest-section"><legend data-test-id="guest-information-guest-legend">Lead guest details</legend><GuestFields guest={guest} onChange={setGuest} testIdPrefix="guest-information" v2={state.uiVersion === 'v2'} /></fieldset>{error && <p className="error" role="alert" data-test-id="guest-information-submit-error">{error}</p>}<button className="primary wide" type="submit" data-test-id="guest-information-continue-button">{state.uiVersion === 'v2' ? 'Review and pay' : 'Continue to payment'} <span data-test-id="guest-information-continue-arrow">→</span></button></div><BookingSummary testId="guest-information-summary" /></div></form></section>
}
