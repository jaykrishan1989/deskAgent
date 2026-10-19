import { useState } from 'react'
import { faqs } from '../content.js'

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-wrap">
        <div className="section-head">
          <p className="kicker">FAQ</p>
          <h2 id="faq-title">Before you point the line over.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item, index) => {
            const expanded = open === index
            return (
              <div className="faq-item" key={item.q}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? -1 : index)}
                >
                  {item.q}
                  <span className={expanded ? 'plus plus--open' : 'plus'} aria-hidden="true" />
                </button>
                {expanded && <p>{item.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
