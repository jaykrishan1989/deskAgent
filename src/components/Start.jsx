import { cloneElement, useEffect, useId, useRef, useState } from 'react'
import { industryOptions, PRICE } from '../content.js'
import { money } from '../format.js'

const EMPTY = {
  name: '',
  business: '',
  industry: '',
  phone: '',
  email: '',
  notes: '',
}

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Add your name.'
  if (!values.business.trim()) errors.business = 'Add the business name.'
  if (!values.industry) errors.industry = 'Choose an industry.'
  const digits = values.phone.replace(/\D/g, '')
  if (digits.length < 7) errors.phone = 'Add the phone line customers call.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Add a valid email.'
  return errors
}

export default function Start() {
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
      /* The receipt still confirms what was entered. */
    }
    setSaved(payload)
  }

  return (
    <section className="section start" id="start" aria-labelledby="start-title">
      <div className="wrap start-grid">
        <div>
          <p className="kicker">Start</p>
          <h2 id="start-title">Put DeskAgent on the line.</h2>
          <p className="lede">
            {money(PRICE)} a month. Calls get answered. Appointments get made. Tell it the business, the line, and what
            it should book.
          </p>
          <ul className="start-points">
            <li>Customers keep the number they already call.</li>
            <li>You set the services and the open windows.</li>
            <li>You receive the appointment and a short brief.</li>
          </ul>
        </div>
        <div className="form-card">
          {saved ? (
            <div className="receipt" role="status" tabIndex={-1} ref={receiptRef}>
              <p className="kicker">Saved on this device</p>
              <h3>{saved.business}</h3>
              <p>
                Nothing was sent to a server. A live setup would answer this line and book from what you entered.
              </p>
              <dl>
                <div>
                  <dt>Line</dt>
                  <dd>{saved.phone}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{saved.email}</dd>
                </div>
                <div>
                  <dt>Industry</dt>
                  <dd>{saved.industry}</dd>
                </div>
                <div>
                  <dt>Books</dt>
                  <dd>{saved.notes || 'The services you describe at setup'}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>{money(PRICE)} / month</dd>
                </div>
              </dl>
              <button type="button" className="btn btn-dark" onClick={() => setSaved(null)}>
                Edit details
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="form-grid">
                <Field id={`${formId}-name`} label="Your name" error={errors.name}>
                  <input
                    id={`${formId}-name`}
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={setField('name')}
                    aria-invalid={Boolean(errors.name)}
                  />
                </Field>
                <Field id={`${formId}-business`} label="Business name" error={errors.business}>
                  <input
                    id={`${formId}-business`}
                    name="organization"
                    autoComplete="organization"
                    placeholder="Harbor Plumbing"
                    value={values.business}
                    onChange={setField('business')}
                    aria-invalid={Boolean(errors.business)}
                  />
                </Field>
                <Field id={`${formId}-industry`} label="Industry" error={errors.industry} wide>
                  <select
                    id={`${formId}-industry`}
                    name="industry"
                    value={values.industry}
                    onChange={setField('industry')}
                    aria-invalid={Boolean(errors.industry)}
                  >
                    <option value="">Choose one</option>
                    {industryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id={`${formId}-phone`} label="The line customers call" error={errors.phone}>
                  <input
                    id={`${formId}-phone`}
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="(555) 013-0142"
                    value={values.phone}
                    onChange={setField('phone')}
                    aria-invalid={Boolean(errors.phone)}
                  />
                </Field>
                <Field id={`${formId}-email`} label="Email" error={errors.email}>
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourbusiness.com"
                    value={values.email}
                    onChange={setField('email')}
                    aria-invalid={Boolean(errors.email)}
                  />
                </Field>
                <Field id={`${formId}-notes`} label="What should it book?" wide>
                  <textarea
                    id={`${formId}-notes`}
                    name="notes"
                    rows={4}
                    placeholder="Leak calls, estimates, new-patient cleanings, Saturday color appointments…"
                    value={values.notes}
                    onChange={setField('notes')}
                  />
                </Field>
              </div>
              <button className="btn btn-dark form-submit" type="submit">
                Start for {money(PRICE)} a month
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({ id, label, error, wide = false, children }) {
  const control = cloneElement(children, {
    'aria-describedby': error ? `${id}-error` : undefined,
  })

  return (
    <label className={wide ? 'field wide' : 'field'} htmlFor={id}>
      <span>{label}</span>
      {control}
      {error && (
        <span className="err" id={`${id}-error`}>
          {error}
        </span>
      )}
    </label>
  )
}
