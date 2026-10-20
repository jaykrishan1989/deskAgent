import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { nav, PRICE } from '../content.js'
import { money } from '../format.js'

export function useTitle(title) {
  useEffect(() => {
    document.title = title
  }, [title])
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function PageHeader({ kicker, title, lede }) {
  return (
    <header className="page-head">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}
    </header>
  )
}

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <>
      <ScrollToTop />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="mast">
        <div className={`wrap mast-inner${pathname === '/' ? ' mast-home' : ''}`}>
          <NavLink className="brand" to="/">
            <span className="brand-name">DeskAgent</span>
            <span className="brand-line">Commercial Agentic Phone Service Platform</span>
          </NavLink>
          <nav className="mast-nav" aria-label="Primary">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
            <NavLink className="enquire" to="/enquire">
              Enquire
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="colophon">
        <div className={`wrap colophon-grid${pathname === '/' ? ' mast-home' : ''}`}>
          <div>
            <p className="brand brand-plain">DeskAgent</p>
            <p className="colophon-kicker">Commercial Agentic Phone Service Platform</p>
            <p>The telephone is answered, the request is understood, and the appointment is made.</p>
          </div>
          <nav aria-label="Footer">
            <p className="colophon-label">Pages</p>
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/enquire">Enquire</NavLink>
          </nav>
          <div>
            <p className="colophon-label">The charge</p>
            <p className="colophon-price">{money(PRICE)}</p>
            <p>a month, for the line to be answered and the visit booked.</p>
          </div>
        </div>
        <p className={`wrap legal${pathname === '/' ? ' mast-home' : ''}`}>© {new Date().getFullYear()} DeskAgent.</p>
      </footer>
    </>
  )
}
