import { objections } from '../content.js'

export default function Objections() {
  return (
    <section className="section band" id="objections" aria-labelledby="obj-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">The honest questions</p>
          <h2 id="obj-title">The reasons shops wait, answered plainly.</h2>
        </div>
        <dl className="objections">
          {objections.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
