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

export default function Home() {
  useTitle('DeskAgent')

  return (
    <article className="page page-home">
      <header className="home-hero">
        <div className="home-copy">
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
        </div>
        <ProspectCall />
      </header>

      <section className="rule-block" aria-labelledby="home-points">
        <h2 id="home-points" className="sr-only">
          What DeskAgent does
        </h2>
        <div className="thirds">
          {points.map((point) => (
            <article key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rule-block endings" aria-labelledby="home-compare">
        <h2 id="home-compare">The same request, two endings</h2>
        <blockquote className="request">
          <p>Can someone come and look at a leaking water heater today?</p>
        </blockquote>
        <div className="endings-grid">
          <article className="ending ending-miss">
            <p className="ending-mark">Unanswered</p>
            <p className="ending-time">No time</p>
            <dl className="slip">
              <div>
                <dt>Work</dt>
                <dd>Not recorded</dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>Not recorded</dd>
              </div>
            </dl>
            <p className="ending-note">You hear of it later, if a message is left at all.</p>
          </article>
          <article className="ending ending-book">
            <p className="ending-mark">Booked</p>
            <p className="ending-time">2.30 p.m.</p>
            <dl className="slip">
              <div>
                <dt>Work</dt>
                <dd>Water heater leak</dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>14 Birch Avenue</dd>
              </div>
            </dl>
            <p className="ending-note">Today. The brief is with you before you call back.</p>
          </article>
        </div>
        <p className="onward">
          <Link to="/pricing">See the charge</Link>
        </p>
      </section>
    </article>
  )
}
