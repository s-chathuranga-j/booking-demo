import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useBooking } from '../BookingContext'

const baseSteps = [
  { path: '/', label: 'Search' }, { path: '/rooms', label: 'Room' },
  { path: '/packages', label: 'Package' },
]

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { state } = useBooking()
  const steps = state.flowVariant === 'standard'
    ? [...baseSteps, { path: '/guest-information', label: 'Guest' }, { path: '/checkout', label: 'Payment' }]
    : [...baseSteps, { path: '/checkout', label: 'Checkout' }]
  const active = Math.max(0, steps.findIndex((step) => step.path === location.pathname))
  const showSteps = !['/payment-frame', '/confirmation', '/my-booking'].includes(location.pathname)
  return (
    <div className="app-shell" data-test-id="layout-shell">
      <header className="site-header" data-test-id="layout-header">
        <Link to="/" className="brand" data-test-id="layout-brand-link" aria-label="Haven and Pine home">
          <span className="brand-mark" data-test-id="layout-brand-mark">H&P</span>
          <span className="brand-copy" data-test-id="layout-brand-copy"><strong data-test-id="layout-brand-name">Haven & Pine</strong><small data-test-id="layout-brand-tagline">Boutique Hotel · Berlin</small></span>
        </Link>
        <a href="tel:+49305550184" className="header-contact" data-test-id="layout-contact-link">Need help? +49 30 555 0184</a>
      </header>
      {showSteps && <nav className="steps" aria-label="Booking progress" data-test-id="layout-progress-nav">
        <ol data-test-id="layout-progress-list">{steps.map((step, index) => (
          <li className={index <= active ? 'active' : ''} key={step.path} data-test-id={`layout-progress-${step.label.toLowerCase()}-item`} aria-current={index === active ? 'step' : undefined}>
            <span data-test-id={`layout-progress-${step.label.toLowerCase()}-number`}>{index + 1}</span>
            <em data-test-id={`layout-progress-${step.label.toLowerCase()}-label`}>{step.label}</em>
          </li>
        ))}</ol>
      </nav>}
      <main data-test-id="layout-main">{children}</main>
      <footer data-test-id="layout-footer"><span data-test-id="layout-footer-copyright">© 2026 Haven & Pine</span><span data-test-id="layout-footer-note">A fictional hotel for automation demonstrations</span></footer>
    </div>
  )
}
