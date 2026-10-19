import { day, industryCards } from '../content.js'

export default function Product() {
  return (
    <section className="section band" id="product" aria-labelledby="product-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">Example day · HVAC</p>
          <h2 id="product-title">A Tuesday on a two-truck shop.</h2>
          <p className="lede">
            Both technicians are out. The phone still books the work. This is a demonstration of one covered day.
          </p>
        </div>
        <div className="timeline">
          {day.map((item) => (
            <article key={item.time}>
              <p className="when">{item.time}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <h3 className="subhead">What it books, by trade</h3>
        <div className="industries">
          {industryCards.map((item) => (
            <article key={item.name}>
              <h3>{item.name}</h3>
              <p>{item.books}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
