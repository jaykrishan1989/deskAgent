import { capabilities, day, industryCards, steps } from '../content.js'
import { PageHeader, useTitle } from '../components/Layout.jsx'

export default function Service() {
  useTitle('The service — DeskAgent')

  return (
    <article className="page">
      <PageHeader
        kicker="The service"
        title="How a call is handled."
        lede="Customers keep the number they already use. You say which calls DeskAgent should take, and the rules by which it may book."
      />

      <ol className="steps">
        {steps.map((step) => (
          <li key={step.n}>
            <span>{step.n}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="rule-block" aria-labelledby="duties-title">
        <h2 id="duties-title">What it is responsible for</h2>
        <dl className="duties">
          {capabilities.map((item) => (
            <div key={item.id}>
              <dt>{item.title}</dt>
              <dd>{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rule-block" aria-labelledby="day-title">
        <h2 id="day-title">An example day</h2>
        <p className="lede">A Tuesday at a two-van heating and cooling firm. Both engineers are out. The telephone still books the work. This is an illustration.</p>
        <ol className="day">
          {day.map((item) => (
            <li key={item.time}>
              <time>{item.time}</time>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rule-block" aria-labelledby="trades-title">
        <h2 id="trades-title">The appointment, by trade</h2>
        <ul className="trades">
          {industryCards.map((item) => (
            <li key={item.name}>
              <h3>{item.name}</h3>
              <p>{item.books}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
