import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useBooking } from '../BookingContext'
import { signIn } from '../api'
import { memberDiscount } from '../data'

export function SignInPage() {
  const { dispatch } = useBooking()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Only return to a page of this app, never to an arbitrary URL.
  const next = /^\/[a-z-]*$/.test(params.get('next') ?? '') ? params.get('next')! : '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password) { setError('Enter your email and password.'); return }
    setBusy(true)
    setError('')
    try {
      dispatch({ type: 'SIGN_IN', payload: await signIn(email, password) })
      navigate(next)
    } catch (signInError) {
      setBusy(false)
      setError(signInError instanceof Error ? signInError.message : 'Sign in failed.')
    }
  }

  return <section className="content-page sign-in-page" data-test-id="sign-in-page">
    <div className="page-heading" data-test-id="sign-in-heading-block"><p className="eyebrow" data-test-id="sign-in-eyebrow">Pine Circle members</p><h1 data-test-id="sign-in-heading">Sign in</h1><p data-test-id="sign-in-subheading">Members save {Math.round(memberDiscount * 100)}% on every room. Signing in is optional.</p></div>
    <form className="form-section sign-in-form" onSubmit={submit} noValidate data-test-id="sign-in-form">
      <label data-test-id="sign-in-email-label">Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} data-test-id="sign-in-email-input" /></label>
      <label data-test-id="sign-in-password-label">Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} data-test-id="sign-in-password-input" /></label>
      {error && <p className="error" role="alert" data-test-id="sign-in-error">{error}</p>}
      <button className="primary wide" type="submit" disabled={busy} data-test-id="sign-in-submit-button">{busy ? 'Signing in…' : 'Sign in'}</button>
      <Link to={next} className="guest-link" data-test-id="sign-in-guest-link">Continue as guest</Link>
    </form>
  </section>
}
