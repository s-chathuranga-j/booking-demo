import type { GuestDetails } from '../types'

interface GuestFieldsProps {
  guest: GuestDetails
  onChange: (guest: GuestDetails) => void
  testIdPrefix: 'guest-information' | 'checkout'
  v2: boolean
}

export function GuestFields({ guest, onChange, testIdPrefix: id, v2 }: GuestFieldsProps) {
  const set = (key: keyof GuestDetails, value: string) => onChange({ ...guest, [key]: value })
  return <div className="form-grid" data-test-id={`${id}-guest-grid`}>
    <label data-test-id={`${id}-title-label`}>Title *<select required value={guest.title} onChange={e=>set('title',e.target.value)} data-test-id={`${id}-title-select`}><option value="" data-test-id={`${id}-title-empty-option`}>Choose</option><option data-test-id={`${id}-title-ms-option`}>Ms</option><option data-test-id={`${id}-title-mr-option`}>Mr</option><option data-test-id={`${id}-title-mx-option`}>Mx</option></select></label>
    <label data-test-id={`${id}-first-name-label`}>{v2 ? 'Given name' : 'First name'} *<input required autoComplete="given-name" value={guest.firstName} onChange={e=>set('firstName',e.target.value)} data-test-id={`${id}-first-name-input`}/></label>
    <label data-test-id={`${id}-last-name-label`}>{v2 ? 'Family name' : 'Last name'} *<input required autoComplete="family-name" value={guest.lastName} onChange={e=>set('lastName',e.target.value)} data-test-id={`${id}-last-name-input`}/></label>
    <label data-test-id={`${id}-email-label`}>{v2 ? 'Email address' : 'Email'} *<input type="email" required autoComplete="email" value={guest.email} onChange={e=>set('email',e.target.value)} data-test-id={id === 'checkout' ? 'checkout-guest-email-input' : `${id}-email-input`}/></label>
    <label data-test-id={`${id}-phone-label`}>Phone<input type="tel" autoComplete="tel" value={guest.phone} onChange={e=>set('phone',e.target.value)} data-test-id={`${id}-phone-input`}/></label>
    <label data-test-id={`${id}-country-label`}>Country *<select required value={guest.country} onChange={e=>set('country',e.target.value)} data-test-id={`${id}-country-select`}><option value="" data-test-id={`${id}-country-empty-option`}>Choose country</option><option value="DE" data-test-id={`${id}-country-de-option`}>Germany</option><option value="GB" data-test-id={`${id}-country-gb-option`}>United Kingdom</option><option value="US" data-test-id={`${id}-country-us-option`}>United States</option></select></label>
    <label data-test-id={`${id}-arrival-label`}>Arrival time *<select required value={guest.arrivalTime} onChange={e=>set('arrivalTime',e.target.value)} data-test-id={`${id}-arrival-select`}><option value="" data-test-id={`${id}-arrival-empty-option`}>Choose a time</option><option data-test-id={`${id}-arrival-early-option`}>Before 15:00</option><option data-test-id={`${id}-arrival-normal-option`}>15:00 – 18:00</option><option data-test-id={`${id}-arrival-late-option`}>After 18:00</option></select></label>
    <label className="full" data-test-id={`${id}-requests-label`}>Special requests<textarea value={guest.requests} onChange={e=>set('requests',e.target.value)} rows={3} data-test-id={`${id}-requests-textarea`}/></label>
  </div>
}
