import { useState } from 'react'
import { Link } from 'react-router-dom'
import { included, paths, PRICE, WEEKS_PER_MONTH } from '../content.js'
import { clamp, money } from '../format.js'
import { PageHeader, useTitle } from '../components/Layout.jsx'

export default function PricingPage() {
  useTitle('Pricing — DeskAgent')
  const [calls, setCalls] = useState(8)
  const [rate, setRate] = useState(40)
  const [value, setValue] = useState(320)
  const jobs = calls * WEEKS_PER_MONTH * (rate / 100)
  const gross = jobs * value
  const net = gross - PRICE
  const jobLabel = jobs < 10 ? jobs.toFixed(1) : String(Math.round(jobs))

  return (
    <article className="page">
      <PageHeader
        kicker="Pricing"
        title="One monthly charge."
        lede={`DeskAgent is ${money(PRICE)} a month. That is the cost of having the telephone answered, and the appointment made.`}
      />

      <div className="paths">
        {paths.map((path) => (
          <article key={path.id} className={path.featured ? 'featured' : undefined}>
            <h2>{path.title}</h2>
            <p>{path.body}</p>
          </article>
        ))}
      </div>

      <section className="charge" aria-labelledby="charge-title">
        <div>
          <p id="charge-title" className="amount">
            {money(PRICE)}
          </p>
          <p>per month</p>
        </div>
        <div>
          <ul>
            {included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="btn" to="/enquire">
            Enquire
          </Link>
        </div>
      </section>

      <section className="rule-block" aria-labelledby="calc-title">
        <h2 id="calc-title">Set it against the calls you miss</h2>
        <p className="lede">
          These figures come from what you enter. They are an estimate, not a promise of revenue.
        </p>
        <div className="calc">
          <div className="sliders">
            <Slider
              id="missed-calls"
              label="Calls you cannot answer in a week"
              min={0}
              max={40}
              value={calls}
              onChange={setCalls}
            />
            <Slider
              id="book-rate"
              label="Share of those calls that would book"
              min={5}
              max={90}
              value={rate}
              onChange={setRate}
              suffix="%"
            />
            <Slider
              id="job-value"
              label="Average value of a booked job"
              min={40}
              max={2500}
              step={10}
              value={value}
              onChange={setValue}
            />
            <p className="fine">
              Missed calls per week × {WEEKS_PER_MONTH} weeks × the share that would book × the average job.
              DeskAgent’s {money(PRICE)} is then taken off.
            </p>
          </div>
          <div className="calc-result" aria-live="polite">
            <p className="kicker">Work those calls could book</p>
            <p className="result">{money(Math.round(gross))}</p>
            <p>About {jobLabel} appointments a month.</p>
            <dl>
              <div>
                <dt>DeskAgent</dt>
                <dd>{money(PRICE)}</dd>
              </div>
              <div>
                <dt>Left after the charge</dt>
                <dd>{money(Math.round(net))}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </article>
  )
}

function Slider({ id, label, min, max, step = 1, value, onChange, suffix }) {
  const update = (next) => onChange(clamp(next, min, max, value))
  return (
    <div className="slider">
      <div className="slider-top">
        <label htmlFor={id}>{label}</label>
        <input
          aria-label={label}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => update(event.target.value)}
        />
        {suffix ? <span>{suffix}</span> : null}
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => update(event.target.value)} />
    </div>
  )
}
