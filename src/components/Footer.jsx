import { nav, PRICE } from '../content.js'
import { money } from '../format.js'
import { Brand } from './Nav.jsx'

const more = [
  ...nav,
  { href: '#numbers', label: 'Your numbers' },
  { href: '#faq', label: 'FAQ' },
  { href: '#start', label: 'Start' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Brand />
            <p className="footer-tag">Answers calls. Makes appointments. {money(PRICE)} a month.</p>
          </div>
          <nav aria-label="Footer">
            {more.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="legal">
          Sample calls and the example day are demonstrations, so you can see the shape of the conversation. ©{' '}
          {new Date().getFullYear()} DeskAgent.
        </p>
      </div>
    </footer>
  )
}
