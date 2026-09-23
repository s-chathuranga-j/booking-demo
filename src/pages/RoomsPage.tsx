import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../BookingContext'
import { rooms } from '../data'
import { formatCurrency, formatDate, nightsBetween } from '../utils'

export function RoomsPage() {
  const { state, dispatch } = useBooking(); const navigate = useNavigate()
  const [maxPrice, setMaxPrice] = useState(420); const [breakfast, setBreakfast] = useState(false); const [sort, setSort] = useState('recommended')
  const visible = useMemo(() => rooms.filter(r => r.nightlyRate <= maxPrice && (!breakfast || r.amenities.includes('Breakfast'))).sort((a,b) => sort === 'price-low' ? a.nightlyRate-b.nightlyRate : sort === 'price-high' ? b.nightlyRate-a.nightlyRate : 0), [maxPrice, breakfast, sort])
  const nights = nightsBetween(state.search?.checkIn, state.search?.checkOut)
  const choose = (id: string) => { dispatch({ type: 'SET_ROOM', payload: id }); navigate('/packages') }
  return <section className="content-page" data-test-id="rooms-page">
    <div className="page-heading" data-test-id="rooms-heading-block"><p className="eyebrow" data-test-id="rooms-eyebrow">{state.search?.destination} · {formatDate(state.search!.checkIn)} — {formatDate(state.search!.checkOut)}</p><h1 data-test-id="rooms-heading">Choose your room</h1><p data-test-id="rooms-subheading">{nights} nights · {state.search?.adults} guests · Best rate guaranteed</p></div>
    <div className="room-layout" data-test-id="rooms-layout">
      <aside className="filters" data-test-id="rooms-filters"><h2 data-test-id="rooms-filters-title">Filter rooms</h2><label data-test-id="rooms-price-label">Maximum nightly price <strong data-test-id="rooms-price-value">{formatCurrency(maxPrice)}</strong><input type="range" min="180" max="420" step="5" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} data-test-id="rooms-price-slider" /></label><label className="check-row" data-test-id="rooms-breakfast-label"><input type="checkbox" checked={breakfast} onChange={e => setBreakfast(e.target.checked)} data-test-id="rooms-breakfast-checkbox"/><span data-test-id="rooms-breakfast-text">Breakfast included</span></label><label data-test-id="rooms-sort-label">Sort by<select value={sort} onChange={e => setSort(e.target.value)} data-test-id="rooms-sort-select"><option value="recommended" data-test-id="rooms-sort-recommended-option">Recommended</option><option value="price-low" data-test-id="rooms-sort-low-option">Price: low to high</option><option value="price-high" data-test-id="rooms-sort-high-option">Price: high to low</option></select></label></aside>
      <div className="room-results" data-test-id="rooms-results" aria-live="polite"><p data-test-id="rooms-result-count">{visible.length} rooms match your stay</p>{visible.map(room => <article className={`room-card ${!room.available ? 'unavailable' : ''}`} key={room.id} data-test-id={`rooms-${room.id}-card`}>
        <div className={`room-image ${room.imageClass}`} role="img" aria-label={`${room.name} interior`} data-test-id={`rooms-${room.id}-image`}><span data-test-id={`rooms-${room.id}-image-badge`}>{room.available ? 'Only 2 left' : 'Sold out'}</span></div>
        <div className="room-info" data-test-id={`rooms-${room.id}-info`}><div data-test-id={`rooms-${room.id}-heading-row`}><h2 data-test-id={`rooms-${room.id}-name`}>{room.name}</h2><p className="price" data-test-id={`rooms-${room.id}-price`}><strong data-test-id={`rooms-${room.id}-price-value`}>{formatCurrency(room.nightlyRate)}</strong><span data-test-id={`rooms-${room.id}-price-unit`}> / night</span></p></div><p data-test-id={`rooms-${room.id}-description`}>{room.description}</p><ul className="amenities" data-test-id={`rooms-${room.id}-amenities`}>{room.amenities.map(a => <li key={a} data-test-id={`rooms-${room.id}-amenity-${a.toLowerCase().replaceAll(' ','-')}`}>{a}</li>)}</ul><div className="room-action" data-test-id={`rooms-${room.id}-action`}><span data-test-id={`rooms-${room.id}-stay-total`}>{formatCurrency(room.nightlyRate*nights)} for {nights} nights</span><button className="primary" disabled={!room.available} onClick={() => choose(room.id)} data-test-id={`rooms-${room.id}-select-button`}>{room.available ? 'Select room' : 'Unavailable'}</button></div></div>
      </article>)}</div>
    </div>
  </section>
}
