import { useEffect, useState } from 'react'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export function useSequence(count, delays, { loop = false, token = '0', reduced = false } = {}) {
  const delayKey = delays.join(',')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced) {
      setIndex(Math.max(0, count - 1))
      return undefined
    }

    const steps = delayKey.split(',').map(Number)
    setIndex(0)
    let current = 0
    let timer = 0
    let stopped = false

    const advance = () => {
      timer = window.setTimeout(() => {
        if (stopped) return
        if (current >= count - 1) {
          if (!loop) return
          current = 0
          setIndex(0)
          advance()
          return
        }
        current += 1
        setIndex(current)
        advance()
      }, steps[current] ?? 1500)
    }

    advance()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [count, delayKey, loop, reduced, token])

  return reduced ? Math.max(0, count - 1) : index
}

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), interval)
    return () => window.clearInterval(timer)
  }, [interval])

  return now
}
