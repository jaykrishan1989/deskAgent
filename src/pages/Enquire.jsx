import { cloneElement, useEffect, useId, useRef, useState } from 'react'
import { industryOptions, PRICE } from '../content.js'
import { money } from '../format.js'
import { PageHeader, useTitle } from '../components/Layout.jsx'

const EMPTY = { name: '', business: '', industry: '', phone: '', email: '', notes: '' }

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Please give your name.'
  if (!values.business.trim()) errors.business = 'Please give the business name.'
  if (!values.industry) errors.industry = 'Please choose a trade.'
  if (values.phone.replace(/\D/g, '').length < 7) errors.phone = 'Please give the telephone line customers call.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Please give a valid email address.'
  return errors
}

export default function Enquire() {
  useTitle('Enquire — DeskAgent')
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(null)
  const receiptRef = useRef(null)
  const formId = useId()

  useEffect(() => {
    if (saved) receiptRef.current?.focus()
  }, [saved])

  const setField = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    const first = ['name', 'business', 'industry', 'phone', 'email'].find((key) => nextErrors[key])
    if (first) {
      document.getElementById(`${formId}-${first}`)?.focus()
      return
    }
    const payload = {
      name: values.name.trim(),
      business: values.business.trim(),
      industry: values.industry,
      phone: values.phone.trim(),
      email: values.email.trim(),
      notes: values.notes.trim(),
      savedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem('deskagent.setupRequest', JSON.stringify(payload))
    } catch {
      /* The confirmation still shows what was entered. */
    }
    setSaved(payload)
  }

  return (
    <article className="page enquire-page">
      <PageHeader
        kicker="Enquire"
        title="Put DeskAgent on the line."
        lede={`${money(PRICE)} a month. Tell us the business, the telephone line, and what it should book.`}
      />
      <div className="enquire-grid">
        <ul className="plain-list">
          <li>Customers keep the number they already call.</li>
          <li>You set the services and the open windows.</li>
          <li>You receive the appointment and a short brief.</li>
        </ul>
        <div className="form-panel">
          {saved ? (
            <div className="receipt" role="status" tabIndex={-1} ref={receiptRef}>
              <p className="kicker">Noted on this device</p>
              <h2>{saved.business}</h2>
              <p>Nothing was sent to a server. A live arrangement would answer this line from the details below.</p>
              <dl>
                <div>
                  <dt>Telephone</dt>
                  <dd>{saved.phone}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{saved.email}</dd>
                </div>
                <div>
                  <dt>Trade</dt>
                  <dd>{saved.industry}</dd>
                </div>
                <div>
                  <dt>To book</dt>
                  <dd>{saved.notes || 'The services described at setup'}</dd>
                </div>
                <div>
                  <dt>Charge</dt>
                  <dd>{money(PRICE)} a month</dd>
                </div>
              </dl>
              <button type="button" className="btn" onClick={() => setSaved(null)}>
                Amend details
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <Field id={`${formId}-name`} label="Your name" error={errors.name}>
                <input id={`${formId}-name`} name="name" autoComplete="name" value={values.name} onChange={setField('name')} aria-invalid={Boolean(errors.name)} />
              </Field>
              <Field id={`${formId}-business`} label="Business name" error={errors.business}>
                <input id={`${formId}-business`} name="organization" autoComplete="organization" value={values.business} onChange={setField('business')} aria-invalid={Boolean(errors.business)} />
              </Field>
              <Field id={`${formId}-industry`} label="Trade" error={errors.industry}>
                <select id={`${formId}-industry`} name="industry" value={values.industry} onChange={setField('industry')} aria-invalid={Boolean(errors.industry)}>
                  <option value="">Choose one</option>
                  {industryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id={`${formId}-phone`} label="The line customers call" error={errors.phone}>
                <input id={`${formId}-phone`} name="tel" type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={setField('phone')} aria-invalid={Boolean(errors.phone)} />
              </Field>
              <Field id={`${formId}-email`} label="Email" error={errors.email}>
                <input id={`${formId}-email`} name="email" type="email" autoComplete="email" value={values.email} onChange={setField('email')} aria-invalid={Boolean(errors.email)} />
              </Field>
              <Field id={`${formId}-notes`} label="What should it book?">
                <textarea id={`${formId}-notes`} name="notes" rows={4} value={values.notes} onChange={setField('notes')} />
              </Field>
              <button className="btn" type="submit">
                Send enquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  )
}

function Field({ id, label, error, children }) {
  const control = cloneElement(children, { 'aria-describedby': error ? `${id}-error` : undefined })
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {control}
      {error ? (
        <span className="err" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  )
}
