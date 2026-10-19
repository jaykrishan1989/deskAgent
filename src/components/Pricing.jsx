import { included, paths, PRICE } from '../content.js'
import { money } from '../format.js'

function Check() {
  return (
    <svg className="check" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#dff56a" />
      <path d="M5.5 10.2 8.4 13l6.1-6.2" fill="none" stroke="#121916" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Pricing() {
  return (
    <section className="section" id="pricing" aria-labelledby="pricing-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">Pricing</p>
          <h2 id="pricing-title">One monthly price. The phone is covered.</h2>
          <p className="lede">
            DeskAgent is {money(PRICE)} a month. That is the cost of a voice on the line that answers customers and
            books the work.
          </p>
        </div>
        <div className="paths">
          {paths.map((path) => (
            <article key={path.id} className={path.featured ? 'paths-on' : undefined}>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
            </article>
          ))}
        </div>
        <div className="price-card">
          <div>
            <p className="amount">
              <span className="sr-only">Price </span>
              {money(PRICE)}
            </p>
            <p className="per">per month</p>
          </div>
          <div>
            <ul className="checks">
              {included.map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <a className="btn btn-primary" href="#start">
              Adopt DeskAgent
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
