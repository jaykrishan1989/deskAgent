import { useState } from 'react'
import { PRICE, WEEKS_PER_MONTH } from '../content.js'
import { clamp, money } from '../format.js'

const CALLS = { min: 0, max: 40, fallback: 8 }
const RATE = { min: 5, max: 90, fallback: 40 }
const VALUE = { min: 40, max: 2500, fallback: 320 }

function Slider({ id, label, min, max, step = 1, value, onChange, suffix = '' }) {
  const update = (next) => onChange(clamp(next, min, max, value))

  return (
    <div className="slider">
      <div className="slider-label">
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
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => update(event.target.value)}
      />
    </div>
  )
}

export default function Roi() {
  const [calls, setCalls] = useState(CALLS.fallback)
  const [rate, setRate] = useState(RATE.fallback)
  const [value, setValue] = useState(VALUE.fallback)

  const jobs = calls * WEEKS_PER_MONTH * (rate / 100)
  const gross = jobs * value
  const net = gross - PRICE
  const jobLabel = jobs < 10 ? jobs.toFixed(1) : String(Math.round(jobs))

  return (
    <section className="section" id="numbers" aria-labelledby="numbers-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">Your numbers</p>
          <h2 id="numbers-title">Price the month against the calls you already miss.</h2>
          <p className="lede">
            Move the sliders to match your shop. This is an estimate from your inputs, not a promise of revenue.
          </p>
        </div>
        <div className="roi-grid">
          <div className="roi-controls">
            <Slider
              id="missed-calls"
              label="Calls you can’t answer in a week"
              min={CALLS.min}
              max={CALLS.max}
              value={calls}
              onChange={setCalls}
            />
            <Slider
              id="book-rate"
              label="Share of those calls that would book"
              min={RATE.min}
              max={RATE.max}
              value={rate}
              onChange={setRate}
              suffix="%"
            />
            <Slider
              id="job-value"
              label="Average value of a booked job"
              min={VALUE.min}
              max={VALUE.max}
              step={10}
              value={value}
              onChange={setValue}
            />
            <p className="formula">
              Missed calls per week × {WEEKS_PER_MONTH} weeks × the share that would book × your average job.
              DeskAgent’s {money(PRICE)} comes off at the end.
            </p>
          </div>
          <div className="roi-card" aria-live="polite" aria-atomic="true">
            <p className="kicker">Work those calls could book</p>
            <p className={net >= 0 ? 'roi-figure' : 'roi-figure roi-figure--low'}>{money(Math.round(gross))}</p>
            <p className="roi-jobs">About {jobLabel} appointments a month, from the calls you said you miss.</p>
            <dl className="roi-rows">
              <div>
                <dt>DeskAgent</dt>
                <dd>{money(PRICE)}</dd>
              </div>
              <div>
                <dt>Left after the price</dt>
                <dd>{money(Math.round(net))}</dd>
              </div>
            </dl>
            <p className="formula">
              {calls === 0
                ? `Set the calls you miss. The price stays ${money(PRICE)}.`
                : `One booked job at ${money(value)} is the comparison. The subscription is ${money(PRICE)}.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
