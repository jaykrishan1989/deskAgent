import { steps } from '../content.js'

export default function How() {
  return (
    <section className="section" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">How it works</p>
          <h2 id="how-title">Three steps onto the line you already have.</h2>
          <p className="lede">
            DeskAgent learns the way your shop books, then answers with those rules. You stay with the work in front of
            you.
          </p>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <article key={step.n}>
              <p className="step-no">{step.n}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
