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
            DeskAgent
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
        <div className="wrap colophon-inner">
          <div>
            <p className="brand brand-plain">DeskAgent</p>
            <p>Answers the telephone. Makes the appointment. {money(PRICE)} a month.</p>
          </div>
          <nav aria-label="Footer">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/enquire">Enquire</NavLink>
          </nav>
        </div>
        <p className="wrap legal">© {new Date().getFullYear()} DeskAgent.</p>
      </footer>
    </>
  )
}
