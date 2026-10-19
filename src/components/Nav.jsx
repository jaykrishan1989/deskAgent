import { useEffect, useState } from 'react'
import { nav } from '../content.js'

export function Brand() {
  return (
    <a className="brand-lockup" href="#top">
      <span className="brand-dot" aria-hidden="true" />
      DeskAgent
    </a>
  )
}

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.toggle('menu-open', open)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('menu-open')
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const close = () => setOpen(false)

  return (
    <header className={solid || open ? 'nav nav--solid' : 'nav'}>
      <div className="nav-inner">
        <Brand />
        <nav className="nav-links" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="btn btn-primary nav-cta" href="#start">
          Start — $150/mo
        </a>
        <button
          type="button"
          className={open ? 'nav-toggle nav-toggle--open' : 'nav-toggle'}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>
      {open && (
        <div className="menu" id="site-menu">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={close}>
              {item.label}
            </a>
          ))}
          <a className="btn btn-primary" href="#start" onClick={close}>
            Start — $150/mo
          </a>
        </div>
      )}
    </header>
  )
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight
      setProgress(height > 0 ? window.scrollY / height : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
}

export function MobileBar() {
  const [hide, setHide] = useState(true)

  useEffect(() => {
    const nodes = {
      hero: document.getElementById('top'),
      pricing: document.getElementById('pricing'),
      start: document.getElementById('start'),
    }
    const visible = { hero: true, pricing: false, start: false }
    const update = () => {
      const menuOpen = document.body.classList.contains('menu-open')
      setHide(menuOpen || visible.hero || visible.pricing || visible.start)
    }
    const observers = Object.entries(nodes)
      .filter(([, node]) => node)
      .map(([key, node]) => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            visible[key] = entry.isIntersecting && entry.intersectionRatio >= 0.28
            update()
          },
          { threshold: [0, 0.28, 0.5, 0.75] },
        )
        observer.observe(node)
        return observer
      })
    const classWatcher = new MutationObserver(update)
    classWatcher.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => {
      observers.forEach((observer) => observer.disconnect())
      classWatcher.disconnect()
    }
  }, [])

  return (
    <div className={hide ? 'mobile-bar mobile-bar--hide' : 'mobile-bar'}>
      <p>
        <strong>$150</strong>
        <span> / month</span>
      </p>
      <a className="btn btn-primary" href="#start">
        Start
      </a>
    </div>
  )
}
