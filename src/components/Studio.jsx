import { useEffect, useRef, useState } from 'react'
import { CALL_DELAYS, CALL_PHASES, scenarios } from '../content.js'
import { formatDuration } from '../format.js'
import { usePrefersReducedMotion, useSequence } from '../hooks.js'
import PhoneStage from './PhoneStage.jsx'

function StudioPhone({ scenario, token, reduced }) {
  const phase = useSequence(CALL_PHASES, CALL_DELAYS, { token, reduced })
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
    <PhoneStage
      business={scenario.business}
      phase={phase}
      lines={scenario.lines}
      booking={scenario.booking}
      timer={reduced ? 'Sample' : formatDuration(seconds)}
      announce
    />
  )
}

export default function Studio() {
  const reduced = usePrefersReducedMotion()
  const [current, setCurrent] = useState(scenarios[0].id)
  const [replay, setReplay] = useState(0)
  const buttons = useRef([])
  const scenario = scenarios.find((item) => item.id === current) ?? scenarios[0]
  const selectedIndex = scenarios.findIndex((item) => item.id === scenario.id)

  const onKeyDown = (event) => {
    const key = event.key
    let next = null
    if (key === 'ArrowDown' || key === 'ArrowRight') next = (selectedIndex + 1) % scenarios.length
    if (key === 'ArrowUp' || key === 'ArrowLeft') next = (selectedIndex - 1 + scenarios.length) % scenarios.length
    if (key === 'Home') next = 0
    if (key === 'End') next = scenarios.length - 1
    if (next == null) return
    event.preventDefault()
    setCurrent(scenarios[next].id)
    buttons.current[next]?.focus()
  }

  return (
    <section className="section studio" id="studio" aria-labelledby="studio-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">A demonstration</p>
          <h2 id="studio-title">The appointment gets made on the same call.</h2>
          <p className="lede">
            Four sample businesses. The same agent. It asks what a front desk would ask, then books inside the hours
            that shop allows.
          </p>
        </div>
        <div className="studio-grid">
          <div className="tabs" role="tablist" aria-label="Sample businesses" onKeyDown={onKeyDown}>
            {scenarios.map((item, index) => {
              const selected = item.id === scenario.id
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    buttons.current[index] = node
                  }}
                  id={`tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => {
                    if (item.id !== scenario.id) setCurrent(item.id)
                  }}
                >
                  <span className="tab-kicker">{item.trade}</span>
                  <strong>{item.business}</strong>
                </button>
              )
            })}
          </div>
          <div role="tabpanel" id={`panel-${scenario.id}`} aria-labelledby={`tab-${scenario.id}`} className="studio-panel">
            <StudioPhone key={`${scenario.id}-${replay}`} scenario={scenario} token={`${scenario.id}-${replay}`} reduced={reduced} />
            <button type="button" className="replay" onClick={() => setReplay((value) => value + 1)}>
              Replay this call
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
