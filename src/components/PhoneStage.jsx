import { useEffect, useRef } from 'react'

export default function PhoneStage({ business, phase, lines, booking, timer, announce = false }) {
  const scroller = useRef(null)
  const shown = lines.slice(0, Math.min(phase, lines.length))
  const status = phase === 0 ? 'ringing' : phase > lines.length ? 'booked' : 'live'

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown.length, status])

  const statusLabel =
    status === 'ringing' ? 'Incoming sample call' : status === 'booked' ? 'Appointment made' : 'DeskAgent answering'

  return (
    <div className={`phone phone--${status}`}>
      <div className="phone-top">
        <span className="brand-dot" aria-hidden="true" />
        <span>{statusLabel}</span>
        <span className="phone-timer">{timer}</span>
      </div>
      <p className="phone-biz">{business}</p>
      {status === 'ringing' ? (
        <div className="ring-state">
          <div className="ring-orb" aria-hidden="true">
            <span />
          </div>
          <p>A customer is calling.</p>
        </div>
      ) : (
        <div className="phone-body" aria-live={announce ? 'polite' : undefined}>
          <div className="phone-lines" ref={scroller}>
            {shown.map((line, index) => (
              <p key={index} className={`bubble bubble--${line.from}`}>
                <span className="who">{line.from === 'agent' ? 'DeskAgent' : 'Customer'}</span>
                {line.text}
              </p>
            ))}
          </div>
          {status === 'booked' && booking && (
            <div className="slip">
              <span className="slip-kicker">Appointment made</span>
              <strong>{booking.service}</strong>
              <span>{booking.when}</span>
              <span>{booking.detail}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
