import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useBooking } from '../BookingContext'
import { BookingSummary } from '../components/Summary'
import { GuestFields } from '../components/GuestFields'
import { guestIsValid, initialGuest } from '../guestUtils'
import type { PaymentResult } from '../types'
import { createApiBooking } from '../api'

export function CheckoutPage() {
  const { state, dispatch } = useBooking()
  const navigate = useNavigate()
  const combinedFlow = state.flowVariant === 'checkout-guest'
  const v2 = state.uiVersion === 'v2'
  const [guest, setGuest] = useState(() => initialGuest(state.guest, state.member))
  const [terms, setTerms] = useState(false)
  const [payment, setPayment] = useState<PaymentResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notesFile, setNotesFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === 'HAVEN_PAYMENT') {
        setPayment({ status: event.data.status, lastFour: event.data.lastFour })
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])

  if (!combinedFlow && !state.guest) return <Navigate to="/guest-information" replace />

  const finalGuest = combinedFlow ? guest : state.guest!
  const selectNotesFile = (file: File | undefined) => {
    if (!file) { setNotesFile(null); setFileError(''); return }
    const extension = file.name.toLowerCase().split('.').pop()
    if (extension !== 'md' && extension !== 'txt') { setNotesFile(null); setFileError('Choose a Markdown (.md) or text (.txt) file.'); return }
    setNotesFile(file)
    setFileError('')
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (combinedFlow && !guestIsValid(guest)) { setError('Complete all required guest details.'); return }
    if (!terms) { setError('Accept the booking terms to continue.'); return }
    if (!payment) { setError('Validate your card details in the secure payment form.'); return }
    if (payment.status === 'declined') { setError('Payment declined. Try the demo success card instead.'); return }
    setError('')
    setBusy(true)
    if (combinedFlow) dispatch({ type: 'SET_GUEST', payload: guest })
    try {
      const booking = await createApiBooking({ ...state, guest: finalGuest }, payment, notesFile)
      dispatch({ type: 'CONFIRM', payload: { reference: booking.reference, createdAt: booking.createdAt, paymentLastFour: booking.payment.lastFour } })
      navigate('/confirmation')
    } catch (bookingError) {
      setBusy(false)
      setError(bookingError instanceof Error ? bookingError.message : 'The booking API could not complete the reservation.')
    }
  }

  return <section className="content-page" data-test-id="checkout-page">
    <div className="page-heading" data-test-id="checkout-heading-block"><p className="eyebrow" data-test-id="checkout-eyebrow">{combinedFlow ? 'A/B test experience' : 'Secure checkout'}</p><h1 data-test-id="checkout-heading">{combinedFlow ? 'Complete your booking' : 'Payment'}</h1><p data-test-id="checkout-subheading">Your room is held for the next 10 minutes.</p>{combinedFlow && <span className="variant-badge" data-test-id="checkout-variant-badge">Variant: guest details at checkout</span>}</div>
    <form onSubmit={submit} noValidate data-test-id="checkout-form"><div className="split-layout" data-test-id="checkout-layout"><div data-test-id="checkout-form-column">
      {combinedFlow && <fieldset className="form-section" data-test-id="checkout-guest-section"><legend data-test-id="checkout-guest-legend">Guest details</legend><GuestFields guest={guest} onChange={setGuest} testIdPrefix="checkout" v2={v2} /></fieldset>}
      {!combinedFlow && <div className="checkout-guest-summary" data-test-id="checkout-guest-summary"><div data-test-id="checkout-guest-summary-copy"><p className="eyebrow" data-test-id="checkout-guest-summary-eyebrow">Guest information</p><strong data-test-id="checkout-guest-summary-name">{state.guest?.title} {state.guest?.firstName} {state.guest?.lastName}</strong><span data-test-id="checkout-guest-summary-email">{state.guest?.email}</span></div><button type="button" className="text-button" onClick={() => navigate('/guest-information')} data-test-id="checkout-edit-guest-button">Edit</button></div>}
      <fieldset className="form-section" data-test-id="checkout-payment-section"><legend data-test-id="checkout-payment-legend">Secure payment</legend><p className="demo-note" data-test-id="checkout-payment-demo-note">Demo cards: <strong data-test-id="checkout-success-card">4242 4242 4242 4242</strong> succeeds; <strong data-test-id="checkout-decline-card">4000 0000 0000 0002</strong> declines. Use any future expiry and 3-digit CVV.</p><iframe src="/payment-frame" title="Secure card details" className="payment-frame" data-test-id="checkout-payment-iframe" />{payment && <p className={payment.status === 'approved' ? 'success' : 'error'} role="status" data-test-id="checkout-payment-status">Card ending {payment.lastFour}: {payment.status}</p>}</fieldset>
      <fieldset className="form-section notes-upload-section" data-test-id="checkout-notes-section"><legend data-test-id="checkout-notes-legend">Notes to the hotel</legend><p data-test-id="checkout-notes-description">Optionally attach special instructions or other notes as a Markdown or text file.</p><label className="file-upload" data-test-id="checkout-notes-file-label"><span data-test-id="checkout-notes-file-prompt">Choose a .md or .txt file</span><input type="file" accept=".md,.txt,text/markdown,text/plain" onChange={(event) => selectNotesFile(event.target.files?.[0])} data-test-id="checkout-notes-file-input" /></label>{notesFile && <div className="file-selection" data-test-id="checkout-notes-file-selection"><span data-test-id="checkout-notes-file-name">{notesFile.name}</span><span data-test-id="checkout-notes-file-size">{Math.max(1, Math.ceil(notesFile.size / 1024))} KB</span><button type="button" onClick={() => { setNotesFile(null); setFileError('') }} data-test-id="checkout-notes-file-remove-button">Remove</button></div>}{fileError && <p className="error" role="alert" data-test-id="checkout-notes-file-error">{fileError}</p>}</fieldset>
      <label className="check-row terms" data-test-id="checkout-terms-label"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} data-test-id="checkout-terms-checkbox"/><span data-test-id="checkout-terms-text">{v2 ? 'I accept the terms and cancellation policy.' : 'I agree to the booking conditions and cancellation policy.'}</span></label>{error && <p className="error" role="alert" data-test-id="checkout-submit-error">{error}</p>}<button className="primary wide" type="submit" disabled={busy} data-test-id="checkout-confirm-button">{busy ? <><span className="spinner" data-test-id="checkout-loading-spinner"/> Processing booking…</> : <>{v2 ? 'Complete booking' : 'Confirm and pay'} <span data-test-id="checkout-confirm-arrow">→</span></>}</button>
    </div><BookingSummary testId="checkout-summary" /></div></form>
  </section>
}
