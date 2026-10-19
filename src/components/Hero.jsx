import { useEffect, useState } from 'react'
import { CALL_DELAYS, CALL_PHASES, PRICE, scenarios, trades } from '../content.js'
import { formatDuration, money } from '../format.js'
import { useNow, usePrefersReducedMotion, useSequence } from '../hooks.js'
import PhoneStage from './PhoneStage.jsx'

function LocalClock() {
  const now = useNow(1000)
  const when = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(now)

  return <p className="now-line">It’s {when} where you are. DeskAgent would answer.</p>
}

function HeroPhone() {
  const reduced = usePrefersReducedMotion()
  const sample = scenarios[0]
  const phase = useSequence(CALL_PHASES, CALL_DELAYS, { loop: true, token: 'hero', reduced })
  const [seconds, setSeconds] = useState(0)
  const ringing = phase === 0

  useEffect(() => {
    if (reduced || ringing) {
      setSeconds(0)
      return undefined
    }
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [reduced, ringing])

  return (
    <div className="hero-phone">
      <p className="sr-only">
        Sample call for Harbor Plumbing. A customer reports a leaking water heater. DeskAgent books today at 2:30 PM
        at 14 Birch Avenue.
      </p>
      <div aria-hidden="true">
        <PhoneStage
          business={sample.business}
          phase={phase}
          lines={sample.lines}
          booking={sample.booking}
          timer={reduced ? 'Sample' : formatDuration(seconds)}
        />
      </div>
      <p className="demo-note">A sample call. Your line uses your hours and your services.</p>
    </div>
  )
}

export function Marquee() {
  const items = [...trades, ...trades]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((name, index) => (
          <span key={`${name}-${index}`} data-clone={index >= trades.length ? 'true' : 'false'}>
            {name}
            <i>·</i>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="kicker">AI receptionist for service businesses</p>
          <h1>
            Never miss
            <br />
            the call that
            <br />
            <em>books the job.</em>
          </h1>
          <p className="lede-hero">
            DeskAgent answers your customers, understands the request, and makes the appointment. It stays on the line
            while you are with someone else, after you lock up, and on the days the phone usually goes quiet.{' '}
            {money(PRICE)} a month.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#start">
              Put DeskAgent on your line
            </a>
            <a className="btn btn-ghost" href="#studio">
              Hear a sample call
            </a>
            <p className="price-pill">
              <strong>{money(PRICE)}</strong>
              <span>a month</span>
            </p>
          </div>
          <LocalClock />
        </div>
        <HeroPhone />
      </div>
    </section>
  )
}
