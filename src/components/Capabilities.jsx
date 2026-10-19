import { capabilities } from '../content.js'

function Visual({ type }) {
  if (type === 'wave') {
    return (
      <div className="wave" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.07}s` }} />
        ))}
      </div>
    )
  }
  if (type === 'slip') {
    return (
      <div className="mini-slip" aria-hidden="true">
        <span>Thu · 9:10 AM</span>
        <strong>New-patient cleaning</strong>
      </div>
    )
  }
  if (type === 'chips') {
    return (
      <div className="chips" aria-hidden="true">
        {['Leak call', 'Estimate', 'Maintenance', 'New patient'].map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>
    )
  }
  if (type === 'always') {
    return (
      <p className="always" aria-hidden="true">
        After close
        <strong>still answering</strong>
      </p>
    )
  }
  if (type === 'brief') {
    return (
      <div className="brief" aria-hidden="true">
        <span>Call brief</span>
        <strong>Water heater leak</strong>
        <span>Today · 2:30 PM · 14 Birch</span>
      </div>
    )
  }
  return (
    <div className="brief brief--alert" aria-hidden="true">
      <span>Needs you</span>
      <strong>Question about a permit</strong>
      <span>Caller’s number attached</span>
    </div>
  )
}

export default function Capabilities() {
  return (
    <section className="section band" id="capabilities" aria-labelledby="cap-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">What you get</p>
          <h2 id="cap-title">A front desk that knows the difference between a booking and a question for you.</h2>
        </div>
        <div className="caps">
          {capabilities.map((item) => (
            <article key={item.id}>
              <Visual type={item.visual} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
