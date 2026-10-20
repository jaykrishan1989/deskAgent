import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRICE } from '../content.js'
import { money } from '../format.js'
import { useTitle } from '../components/Layout.jsx'
import ProspectCall from '../components/ProspectCall.jsx'

const points = [
  {
    title: 'The call is answered',
    body: 'When you are with a client, on a job, or closed for the day, DeskAgent takes the conversation.',
  },
  {
    title: 'The appointment is made',
    body: 'It offers a time inside the windows you have set, and books the one the caller accepts.',
  },
  {
    title: 'You receive the brief',
    body: 'Who called, what they needed, and the time now on your book.',
  },
]

function Spoken({ text, active }) {
  return (
    <p>
      {text}
      {active ? <i className="live-caret" aria-hidden="true" /> : null}
    </p>
  )
}

function transcriptFile(turns) {
  const stamp = new Date()
  const when = stamp.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })
  const lines = [
    'DeskAgent',
    'Transcript',
    when,
    '',
    ...turns.flatMap((turn) => [turn.role === 'agent' ? 'Sophie' : 'You', turn.content, '']),
  ]
  const day = stamp.toISOString().slice(0, 10)
  return { name: `deskagent-transcript-${day}.txt`, text: lines.join('\n') }
}

function LiveTranscript({ status, turns }) {
  const logRef = useRef(null)
  const [saved, setSaved] = useState(false)
  const signature = turns.map((turn) => `${turn.id}:${turn.content}`).join('\n')

  useEffect(() => {
    const node = logRef.current
    if (!node) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.scrollTo({ top: node.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
  }, [signature])

  useEffect(() => {
    if (status !== 'ended') setSaved(false)
  }, [status])

  function saveTranscript() {
    const file = transcriptFile(turns)
    const url = URL.createObjectURL(new Blob([file.text], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    URL.revokeObjectURL(url)
    setSaved(true)
  }

  const label = status === 'live' ? 'Live transcript' : status === 'ended' ? 'Transcript' : 'The call'
  const waiting = status === 'live'
    ? 'The words will appear as they are spoken.'
    : 'Sophie is answering.'

  return (
    <div className={`live-script${status === 'live' ? ' is-live' : ''}`}>
      <div className="live-head">
        <p className="kicker">
          {status === 'live' ? <i className="live-dot" aria-hidden="true" /> : null}
          {label}
        </p>
        <span className="live-signal" aria-hidden="true" />
      </div>
      <ol ref={logRef} aria-live="polite" aria-relevant="additions text">
        {turns.length ? turns.map((turn, index) => {
          const current = status === 'live' && index === turns.length - 1
          const role = turn.role === 'user' ? ' is-user' : ''
          return (
            <li key={turn.id} className={`live-line${role}${current ? ' is-current' : ''}`}>
              <span>{turn.role === 'agent' ? 'Sophie' : 'You'}</span>
              <Spoken text={turn.content} active={current} />
            </li>
          )
        }) : (
          <li className="live-wait">{waiting}</li>
        )}
      </ol>
      {status === 'ended' && turns.length ? (
        <button className="btn btn-quiet live-save" type="button" onClick={saveTranscript}>
          {saved ? 'Saved' : 'Save transcript'}
        </button>
      ) : null}
    </div>
  )
}

export default function Home() {
  useTitle('DeskAgent')
  const [conversation, setConversation] = useState({ status: 'idle', turns: [] })
  const onConversation = useCallback((next) => {
    setConversation(next)
  }, [])
  const showing = conversation.status === 'ringing'
    || conversation.status === 'connecting'
    || conversation.status === 'live'
    || (conversation.status === 'ended' && conversation.turns.length > 0)

  return (
    <article className="page page-home">
      <header className="home-hero">
        <div className="home-copy">
          {showing ? (
            <LiveTranscript status={conversation.status} turns={conversation.turns} />
          ) : (
            <>
              <p className="kicker">Telephone answering for service businesses</p>
              <h1>
                The telephone is answered.
                <br />
                The issues are understood.
                <br />
                The appointment is made.
              </h1>
              <p className="lede">
                DeskAgent speaks with the customer, understands the request, and books the visit. It is there while you are
                occupied, and after you have locked up. The charge is {money(PRICE)} a month.
              </p>
              <div className="actions">
                <Link className="btn" to="/service">
                  The service
                </Link>
                <p className="price-note">
                  <strong>{money(PRICE)}</strong>
                  <span>a month</span>
                </p>
              </div>
            </>
          )}
        </div>
        <ProspectCall onConversation={onConversation} />
      </header>

      <section className="rule-block" aria-labelledby="home-points">
        <h2 id="home-points" className="sr-only">
          What DeskAgent does
        </h2>
        <div className="thirds points">
          {points.map((point) => (
            <article key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </section>
    </article>
  )
}
