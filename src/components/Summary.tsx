import { packages, rooms } from '../data'
import { useBooking } from '../BookingContext'
import { calculatePrice, formatCurrency } from '../utils'

export function BookingSummary({ testId }: { testId: string }) {
  const { state } = useBooking()
  const room = rooms.find((item) => item.id === state.roomId)
  const selectedPackage = packages.find((item) => item.id === state.packageId)
  const price = calculatePrice(state)
  return (
    <aside className="booking-summary" data-test-id={`${testId}-panel`}>
      <p className="eyebrow" data-test-id={`${testId}-eyebrow`}>Your stay</p>
      <h2 data-test-id={`${testId}-title`}>Booking summary</h2>
      {room && <div className={`summary-image ${room.imageClass}`} data-test-id={`${testId}-room-image`} role="img" aria-label={room.name} />}
      <dl data-test-id={`${testId}-details-list`}>
        <div data-test-id={`${testId}-room-row`}><dt data-test-id={`${testId}-room-label`}>Room</dt><dd data-test-id={`${testId}-room-value`}>{room?.name ?? 'Not selected'}</dd></div>
        <div data-test-id={`${testId}-nights-row`}><dt data-test-id={`${testId}-nights-label`}>Nights</dt><dd data-test-id={`${testId}-nights-value`}>{price.nights}</dd></div>
        {selectedPackage && <div data-test-id={`${testId}-package-row`}><dt data-test-id={`${testId}-package-label`}>Package</dt><dd data-test-id={`${testId}-package-value`}>{selectedPackage.name}{state.flowVariant === 'breakfast-included' && selectedPackage.id === 'breakfast' ? ' · breakfast included' : ''}</dd></div>}
        {price.discount > 0 && <div className="discount" data-test-id={`${testId}-discount-row`}><dt data-test-id={`${testId}-discount-label`}>Member discount</dt><dd data-test-id={`${testId}-discount-value`}>−{formatCurrency(price.discount)}</dd></div>}
        <div data-test-id={`${testId}-subtotal-row`}><dt data-test-id={`${testId}-subtotal-label`}>Subtotal</dt><dd data-test-id={`${testId}-subtotal-value`}>{formatCurrency(price.subtotal)}</dd></div>
        <div data-test-id={`${testId}-tax-row`}><dt data-test-id={`${testId}-tax-label`}>Taxes & fees</dt><dd data-test-id={`${testId}-tax-value`}>{formatCurrency(price.taxes)}</dd></div>
        <div className="total" data-test-id={`${testId}-total-row`}><dt data-test-id={`${testId}-total-label`}>Total</dt><dd data-test-id={`${testId}-total-value`}>{formatCurrency(price.total)}</dd></div>
      </dl>
    </aside>
  )
}
