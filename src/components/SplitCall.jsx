import { useState } from 'react'
import { SPLIT_DELAYS, SPLIT_PHASES } from '../content.js'
import { usePrefersReducedMotion, useSequence } from '../hooks.js'

function Outcome({ tone, phase }) {
  const missed = tone === 'miss'
  let stamp = 'Ringing'
  if (phase === 1) stamp = missed ? 'Still ringing' : 'Answered'
  if (phase >= 2) stamp = missed ? 'Missed' : 'Booked'

  return (
    <article className={missed ? 'outcome outcome--miss' : 'outcome outcome--book'}>
      <p className={missed ? 'stamp stamp--miss' : 'stamp stamp--book'}>{stamp}</p>
      <p className="outcome-kicker">{missed ? 'The usual line' : 'With DeskAgent'}</p>
      {phase === 0 && <p className="outcome-body">The line is ringing.</p>}
      {phase === 1 && missed && <p className="outcome-body">You are under a sink. The call keeps ringing.</p>}
      {phase === 1 && !missed && (
        <p className="bubble bubble--agent outcome-bubble">
          <span className="who">DeskAgent</span>
          I can book a leak visit today at 2:30.
        </p>
      )}
      {phase >= 2 && missed && (
        <div className="outcome-end">
          <strong>No answer.</strong>
          <p>The appointment never reaches your book.</p>
        </div>
      )}
      {phase >= 2 && !missed && (
        <div className="slip">
          <span className="slip-kicker">Appointment made</span>
          <strong>Water heater leak</strong>
          <span>Today · 2:30 PM</span>
          <span>On your book before you call back</span>
        </div>
      )}
    </article>
  )
}

export default function SplitCall() {
  const reduced = usePrefersReducedMotion()
  const [replay, setReplay] = useState(0)
  const phase = useSequence(SPLIT_PHASES, SPLIT_DELAYS, { token: String(replay), reduced })

  return (
    <section className="section" id="why" aria-labelledby="why-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">Why it pays</p>
          <h2 id="why-title">The call you miss is a job you never see.</h2>
          <p className="lede">
            Service work happens away from the phone. DeskAgent stays with the phone and turns the call into an
            appointment.
          </p>
        </div>
        <blockquote className="callout">
          <p>Can someone come look at a leaking water heater today?</p>
          <footer>The same call, two endings.</footer>
        </blockquote>
        <div className="compare">
          <Outcome tone="miss" phase={phase} />
          <Outcome tone="book" phase={phase} />
        </div>
        <button type="button" className="btn btn-dark replay-btn" onClick={() => setReplay((value) => value + 1)}>
          Replay both lines
        </button>
      </div>
    </section>
  )
}
