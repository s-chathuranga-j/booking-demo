import { useState, type FormEvent } from 'react'
import { useBooking } from '../BookingContext'

export function PaymentFramePage() {
  const { state } = useBooking()
  const [card, setCard] = useState(''); const [expiry, setExpiry] = useState(''); const [cvv, setCvv] = useState(''); const [name, setName] = useState(''); const [error, setError] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault(); const digits = card.replace(/\D/g, '')
    if (digits.length !== 16 || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length !== 3 || !name.trim()) { setError('Please enter complete, valid card details.'); return }
    window.parent.postMessage({ type: 'HAVEN_PAYMENT', status: digits === '4000000000000002' ? 'declined' : 'approved', lastFour: digits.slice(-4) }, window.location.origin)
  }
  return <main className="payment-frame-page" data-test-id="payment-page"><form onSubmit={submit} data-test-id="payment-form" noValidate><label data-test-id="payment-card-number-label">Card number<input inputMode="numeric" autoComplete="cc-number" value={card} onChange={e => setCard(e.target.value)} placeholder="4242 4242 4242 4242" data-test-id="payment-card-number-input"/></label><div className="payment-row" data-test-id="payment-expiry-cvv-row"><label data-test-id="payment-expiry-label">Expiry<input autoComplete="cc-exp" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="12/30" data-test-id="payment-expiry-input"/></label><label data-test-id="payment-cvv-label">CVV<input inputMode="numeric" autoComplete="cc-csc" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" data-test-id="payment-cvv-input"/></label></div><label data-test-id="payment-cardholder-label">Name on card<input autoComplete="cc-name" value={name} onChange={e => setName(e.target.value)} data-test-id="payment-cardholder-input"/></label>{error && <p role="alert" className="error" data-test-id="payment-error">{error}</p>}<button className="primary wide" type="submit" data-test-id="payment-submit-button">{state.uiVersion === 'v2' ? 'Verify card' : 'Validate card'}</button></form></main>
}
