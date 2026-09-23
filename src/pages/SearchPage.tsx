import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBooking } from '../BookingContext'
import type { BookingSearch } from '../types'
import { formatDate, nightsBetween } from '../utils'

const days = Array.from({ length: 31 }, (_, index) => `2026-07-${String(index + 1).padStart(2, '0')}`)

export function SearchPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useBooking()
  const [form, setForm] = useState<BookingSearch>({ destination: 'Berlin', checkIn: '', checkOut: '', adults: 2, children: 0, rooms: 1, roomGuests: [{ adults: 2, children: 0 }], accessibleRoom: false, flexibleDates: false })
  const [choosing, setChoosing] = useState<'checkin' | 'checkout' | null>(null)
  const [error, setError] = useState('')
  const chooseDate = (date: string) => {
    if (choosing === 'checkin') { setForm({ ...form, checkIn: date, checkOut: form.checkOut > date ? form.checkOut : '' }); setChoosing('checkout') }
    else { setForm({ ...form, checkOut: date }); setChoosing(null) }
  }
  const setRoomCount = (rooms: number) => {
    const roomGuests = Array.from({ length: rooms }, (_, index) => form.roomGuests?.[index] ?? { adults: 2, children: 0 })
    setForm({ ...form, rooms, roomGuests, adults: roomGuests.reduce((sum, room) => sum + room.adults, 0), children: roomGuests.reduce((sum, room) => sum + room.children, 0) })
  }
  const setRoomGuests = (index: number, field: 'adults' | 'children', value: number) => {
    const roomGuests = (form.roomGuests ?? []).map((room, roomIndex) => roomIndex === index ? { ...room, [field]: value } : room)
    setForm({ ...form, roomGuests, adults: roomGuests.reduce((sum, room) => sum + room.adults, 0), children: roomGuests.reduce((sum, room) => sum + room.children, 0) })
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.checkIn || !form.checkOut || nightsBetween(form.checkIn, form.checkOut) < 1) { setError('Choose a check-out date after your check-in date.'); return }
    dispatch({ type: 'SET_SEARCH', payload: form }); navigate('/rooms')
  }
  return (
    <section className="hero" data-test-id="search-page">
      <div className="hero-copy" data-test-id="search-hero-copy">
        <p className="eyebrow" data-test-id="search-eyebrow">Stay somewhere considered</p>
        <h1 data-test-id="search-heading">A calmer side<br data-test-id="search-heading-break" /> of Berlin.</h1>
        <p data-test-id="search-intro">Thoughtful rooms, seasonal food and a little more time for yourself—in the green heart of the city.</p>
        <ul className="trust-list" data-test-id="search-benefits-list"><li data-test-id="search-benefit-cancel">Free cancellation</li><li data-test-id="search-benefit-rate">Best rate guaranteed</li><li data-test-id="search-benefit-support">Local support</li></ul>
      </div>
      <form className="search-card" onSubmit={submit} data-test-id="search-form" noValidate>
        <div className="card-heading" data-test-id="search-card-heading"><p className="eyebrow" data-test-id="search-card-eyebrow">Plan your stay</p><h2 data-test-id="search-card-title">Find a room</h2></div>
        <div className="flow-switcher" data-test-id="search-flow-switcher"><span data-test-id="search-flow-label">Demo flow</span><Link className={state.flowVariant === 'standard' ? 'active' : ''} to="/?flow=standard" data-test-id="search-standard-flow-link">Standard</Link><Link className={state.flowVariant === 'checkout-guest' ? 'active' : ''} to="/?flow=checkout-guest" data-test-id="search-checkout-guest-flow-link">A/B variant</Link></div>
        <label data-test-id="search-destination-label">Destination<select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} data-test-id="search-destination-select"><option data-test-id="search-destination-berlin-option">Berlin, Germany</option><option data-test-id="search-destination-hamburg-option">Hamburg, Germany</option><option data-test-id="search-destination-munich-option">Munich, Germany</option></select></label>
        <div className="stay-fields" data-test-id="search-stay-fields">
          <button type="button" onClick={() => setChoosing('checkin')} className="date-button" data-test-id="search-checkin-button"><span data-test-id="search-checkin-label">Check in</span><strong data-test-id="search-checkin-value">{form.checkIn ? formatDate(form.checkIn) : 'Select date'}</strong></button>
          <button type="button" onClick={() => setChoosing('checkout')} className="date-button" data-test-id="search-checkout-button"><span data-test-id="search-checkout-label">Check out</span><strong data-test-id="search-checkout-value">{form.checkOut ? formatDate(form.checkOut) : 'Select date'}</strong></button>
          <label className="rooms-field" data-test-id="search-rooms-label">Rooms<select value={form.rooms} onChange={(e) => setRoomCount(Number(e.target.value))} data-test-id="search-rooms-select">{[1,2,3].map(n => <option key={n} value={n} data-test-id={`search-rooms-${n}-option`}>{n}</option>)}</select></label>
        </div>
        {choosing && <div className="calendar" data-test-id={`search-${choosing}-calendar`} role="dialog" aria-label={`Choose ${choosing} date`}>
          <div className="calendar-head" data-test-id={`search-${choosing}-calendar-heading`}><strong data-test-id={`search-${choosing}-calendar-month`}>July 2026</strong><button type="button" onClick={() => setChoosing(null)} aria-label="Close calendar" data-test-id={`search-${choosing}-calendar-close`}>×</button></div>
          <div className="weekdays" data-test-id={`search-${choosing}-weekdays`}>{['Mo','Tu','We','Th','Fr','Sa','Su'].map((day) => <span key={day} data-test-id={`search-${choosing}-weekday-${day.toLowerCase()}`}>{day}</span>)}</div>
          <div className="calendar-grid" data-test-id={`search-${choosing}-calendar-grid`}><i data-test-id={`search-${choosing}-calendar-empty-1`} /><i data-test-id={`search-${choosing}-calendar-empty-2`} />{days.map((date) => {
            const disabled = choosing === 'checkout' && !!form.checkIn && date <= form.checkIn
            return <button type="button" key={date} disabled={disabled} className={date === form.checkIn || date === form.checkOut ? 'selected' : ''} onClick={() => chooseDate(date)} data-test-id={`search-${choosing}-day-${date}`}>{Number(date.slice(-2))}</button>
          })}</div>
        </div>}
        <div className="room-guests-list" data-test-id="search-room-guests-list">{form.roomGuests?.map((room, index) => <details className="room-guests-section" key={index} data-test-id={`search-room-${index + 1}-section`}><summary data-test-id={`search-room-${index + 1}-summary`}><span data-test-id={`search-room-${index + 1}-title`}>Room {index + 1}</span><span data-test-id={`search-room-${index + 1}-occupancy`}>{room.adults} adults, {room.children} children</span></summary><div className="room-guests-fields" data-test-id={`search-room-${index + 1}-fields`}><label data-test-id={`search-room-${index + 1}-adults-label`}>Adults<select value={room.adults} onChange={(e) => setRoomGuests(index, 'adults', Number(e.target.value))} data-test-id={`search-room-${index + 1}-adults-select`}>{[1,2,3,4].map(n => <option key={n} value={n} data-test-id={`search-room-${index + 1}-adults-${n}-option`}>{n}</option>)}</select></label><label data-test-id={`search-room-${index + 1}-children-label`}>Children<select value={room.children} onChange={(e) => setRoomGuests(index, 'children', Number(e.target.value))} data-test-id={`search-room-${index + 1}-children-select`}>{[0,1,2,3].map(n => <option key={n} value={n} data-test-id={`search-room-${index + 1}-children-${n}-option`}>{n}</option>)}</select></label></div></details>)}</div>
        <label className="check-row" data-test-id="search-flexible-label"><input type="checkbox" checked={form.flexibleDates} onChange={(e) => setForm({ ...form, flexibleDates: e.target.checked })} data-test-id="search-flexible-checkbox"/><span data-test-id="search-flexible-text">My dates are flexible (± 2 days)</span></label>
        <label className="check-row" data-test-id="search-accessible-label"><input type="checkbox" checked={form.accessibleRoom} onChange={(e) => setForm({ ...form, accessibleRoom: e.target.checked })} data-test-id="search-accessible-checkbox"/><span data-test-id="search-accessible-text">I need an accessible room</span></label>
        {error && <p className="error" role="alert" data-test-id="search-date-error">{error}</p>}
        <button className="primary" type="submit" data-test-id="search-submit-button">Search available rooms <span data-test-id="search-submit-arrow">→</span></button>
      </form>
    </section>
  )
}
