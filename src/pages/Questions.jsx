import { useState } from 'react'
import { faqs, objections } from '../content.js'
import { PageHeader, useTitle } from '../components/Layout.jsx'

export default function Questions() {
  useTitle('Questions — DeskAgent')
  const [open, setOpen] = useState(0)

  return (
    <article className="page">
      <PageHeader
        kicker="Questions"
        title="Before the line is pointed over."
        lede="The reservations most firms already have, answered in plain language."
      />

      <section aria-labelledby="reserve-title">
        <h2 id="reserve-title" className="sr-only">
          Reservations
        </h2>
        <dl className="reserves">
          {objections.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rule-block" aria-labelledby="faq-title">
        <h2 id="faq-title">Further questions</h2>
        <div className="faq">
          {faqs.map((item, index) => {
            const expanded = open === index
            return (
              <div key={item.q}>
                <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)}>
                  {item.q}
                </button>
                {expanded ? <p>{item.a}</p> : null}
              </div>
            )
          })}
        </div>
      </section>
    </article>
  )
}
