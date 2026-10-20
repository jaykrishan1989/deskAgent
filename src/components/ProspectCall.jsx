import { useEffect, useRef, useState } from 'react'
import { RetellWebClient } from 'retell-client-js-sdk'
const TRIAL_MESSAGE = 'Thank you for trying it out. The trial limit was 2 minutes.'
const BARS = 72

function explain(error) {
  const message = typeof error === 'string' ? error : String(error?.message || '')
  if (/permission|notallowed|denied/i.test(message)) {
    return 'The microphone needs to be allowed for Sophie to hear you.'
  }
  if (/domain|origin|forbidden|401|403/i.test(message)) {
    return 'This page is not yet permitted to open the conversation.'
  }
  return 'The conversation could not be started. Please try again.'
}

function shapeFromSamples(samples, into) {
  const chunk = Math.max(1, Math.floor(samples.length / into.length))
  for (let i = 0; i < into.length; i += 1) {
    let peak = 0
    const start = i * chunk
    for (let j = 0; j < chunk; j += 1) {
      const value = Math.abs(samples[start + j] || 0)
      if (value > peak) peak = value
    }
    const mid = samples[start + (chunk >> 1)] || 0
    const target = Math.max(-1, Math.min(1, (mid < 0 ? -peak : peak) * 1.4))
    into[i] += (target - into[i]) * 0.16
  }
}

function ringPoints(cx, cy, shape, radius, amplitude, rotation, wobble) {
  const points = []
  for (let i = 0; i < shape.length; i += 1) {
    const angle = (i / shape.length) * Math.PI * 2 + rotation
    const radiusAt = radius + Math.sin(angle * 4 + rotation * 3) * wobble + shape[i] * amplitude
    points.push({
      x: cx + Math.cos(angle) * radiusAt,
      y: cy + Math.sin(angle) * radiusAt,
    })
  }
  return points
}

function strokeLoop(ctx, points) {
  ctx.beginPath()
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i]
    const next = points[(i + 1) % points.length]
    const midX = (current.x + next.x) / 2
    const midY = (current.y + next.y) / 2
    if (i === 0) ctx.moveTo(midX, midY)
    ctx.quadraticCurveTo(current.x, current.y, midX, midY)
  }
  ctx.closePath()
  ctx.stroke()
}

const easedShape = new Float32Array(BARS)
let easedLevel = 0

function paintSpeech(ctx, cx, cy, reach, shape, level, seconds, rgb) {
  easedLevel += (Math.min(1, level) - easedLevel) * 0.045
  for (let i = 0; i < shape.length; i += 1) {
    easedShape[i] += (shape[i] - easedShape[i]) * 0.05
  }
  const energy = easedLevel
  const breath = Math.sin(seconds * 0.65) * reach * 0.008

  const glow = ctx.createRadialGradient(cx, cy, reach * 0.04, cx, cy, reach * 0.5)
  glow.addColorStop(0, `rgba(${rgb}, ${0.035 + energy * 0.07})`)
  glow.addColorStop(1, `rgba(${rgb}, 0)`)
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, cy, reach * 0.5, 0, Math.PI * 2)
  ctx.fill()

  const bands = [
    { radius: 0.4, amp: 10, turn: 0.05, width: 1.5, alpha: 0.22 },
    { radius: 0.54, amp: 7, turn: -0.035, width: 1.1, alpha: 0.14 },
    { radius: 0.68, amp: 4.5, turn: 0.02, width: 1, alpha: 0.08 },
  ]
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  bands.forEach((band) => {
    const points = ringPoints(
      cx,
      cy,
      easedShape,
      reach * band.radius + breath,
      band.amp * (0.3 + energy * 0.7),
      seconds * band.turn,
      0.8 + energy * 0.6,
    )
    ctx.strokeStyle = `rgba(${rgb}, ${band.alpha + energy * 0.08})`
    ctx.lineWidth = band.width
    strokeLoop(ctx, points)
  })
}

function paint(canvas, shape, level, time, tone) {
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (width < 2 || height < 2) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const bitmapWidth = Math.floor(width * dpr)
  const bitmapHeight = Math.floor(height * dpr)
  if (canvas.width !== bitmapWidth || canvas.height !== bitmapHeight) {
    canvas.width = bitmapWidth
    canvas.height = bitmapHeight
  }

  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const reach = Math.min(width, height) * 0.48
  const seconds = time * 0.001
  const breath = Math.sin(seconds * 1.15) * 7
  const live = tone === 'live'
  const rgb = live ? '28, 138, 86' : '30, 42, 58'

  if (live) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, reach * 0.92, 0, Math.PI * 2)
    ctx.clip()
    paintSpeech(ctx, cx, cy, reach, shape, level, seconds, rgb)
    ctx.restore()
    return
  }

  const points = ringPoints(
    cx,
    cy,
    shape,
    reach * 0.46 + breath * 0.35,
    12 + level * 34,
    seconds * 0.18,
    2.5 + level * 5,
  )
  ctx.strokeStyle = `rgba(${rgb}, ${0.08 + level * 0.72})`
  ctx.lineWidth = 1.6
  ctx.lineJoin = 'round'
  ctx.shadowColor = `rgba(${rgb}, ${0.14 + level * 0.45})`
  ctx.shadowBlur = 14 + level * 24
  strokeLoop(ctx, points)
  ctx.shadowBlur = 0
}

export default function ProspectCall({ onConversation }) {
  const canvasRef = useRef(null)
  const callRef = useRef(null)
  const shapeRef = useRef(new Float32Array(BARS))
  const levelRef = useRef(0)
  const freshRef = useRef(false)
  const statusRef = useRef('idle')
  const limitedRef = useRef(false)
  const trialTimerRef = useRef(0)
  const ringRef = useRef(null)
  const hoverRef = useRef(false)
  const endsAtRef = useRef(0)
  const startedAtRef = useRef(0)
  const transcriptRef = useRef(null)
  const linesRef = useRef(new Map())
  const [status, setStatus] = useState('idle')
  const [turns, setTurns] = useState([])
  const [clock, setClock] = useState('')
  const [fault, setFault] = useState('')
  const [hover, setHover] = useState(false)

  function setPhase(next) {
    statusRef.current = next
    setStatus(next)
  }

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0

    const draw = () => {
      const shape = shapeRef.current
      if (!freshRef.current) {
        const settle = statusRef.current === 'live' ? 0.985 : 0.9
        for (let i = 0; i < shape.length; i += 1) shape[i] *= settle
        levelRef.current *= settle
      }
      freshRef.current = false
      const tone = statusRef.current === 'live' ? 'live' : hoverRef.current ? 'hover' : 'rest'
      if (canvasRef.current) paint(canvasRef.current, shape, levelRef.current, performance.now(), tone)
      if (!reduce) frame = window.requestAnimationFrame(draw)
    }

    frame = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    let ignore = false
    fetch('/api/voice-trial')
      .then((response) => response.json())
      .then((data) => {
        if (ignore || !data?.exhausted) return
        limitedRef.current = true
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => () => {
    window.clearTimeout(trialTimerRef.current)
    transcriptRef.current?.close()
    ringRef.current?.pause()
    callRef.current?.stopCall()
    callRef.current = null
  }, [])

  function closeTranscript() {
    transcriptRef.current?.close()
    transcriptRef.current = null
  }

  function showLines() {
    const lines = [...linesRef.current.values()].sort((a, b) => a.time_sec - b.time_sec)
    setTurns(lines.map(({ id, role, content }) => ({ id, role, content })))
  }

  function applyTranscript(message) {
    const incoming = Array.isArray(message?.transcripts) ? message.transcripts : []
    if (!incoming.length) return
    const fromBook = message?.source === 'book'
    const hasLive = [...linesRef.current.keys()].some((id) => !String(id).startsWith('book-'))
    if (fromBook && hasLive) return
    if (fromBook || message?.type === 'transcript_snapshot') linesRef.current.clear()
    else {
      for (const id of [...linesRef.current.keys()]) {
        if (String(id).startsWith('book-')) linesRef.current.delete(id)
      }
    }
    incoming.forEach((item) => {
      const id = fromBook ? `book-${item.id}` : item.id
      linesRef.current.set(id, { ...item, id })
    })
    showLines()
  }

  function openTranscript(callId) {
    closeTranscript()
    linesRef.current.clear()
    const source = new EventSource(`/api/voice-transcript?callId=${encodeURIComponent(callId)}`)
    transcriptRef.current = source
    source.onmessage = (event) => {
      try {
        applyTranscript(JSON.parse(event.data))
      } catch {
        // A partial frame can wait for the next one.
      }
    }
  }

  function playRing() {
    const audio = new Audio('/phone-ring.mp3')
    ringRef.current = audio
    return new Promise((resolve) => {
      const finish = () => {
        if (ringRef.current === audio) ringRef.current = null
        resolve()
      }
      audio.addEventListener('ended', finish, { once: true })
      audio.addEventListener('error', finish, { once: true })
      audio.play().catch(finish)
    })
  }

  function finishTrial() {
    window.clearTimeout(trialTimerRef.current)
    closeTranscript()
    const call = callRef.current
    callRef.current = null
    if (call?.callId) {
      fetch('/api/voice-trial', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: call.callId }),
      }).catch(() => {})
    }
    call?.stopCall()
  }

  async function toggle() {
    if (callRef.current && statusRef.current !== 'ended' && statusRef.current !== 'error') {
      finishTrial()
      setPhase('ended')
      return
    }
    if (limitedRef.current) {
      setFault(TRIAL_MESSAGE)
      return
    }

    setFault('')
    linesRef.current.clear()
    setTurns([])
    setPhase('ringing')

    try {
      await playRing()
      if (statusRef.current !== 'ringing') return
      setPhase('connecting')

      const response = await fetch('/api/voice-trial', { method: 'POST' })
      const data = await response.json()
      if (data.exhausted || response.status === 403) {
        limitedRef.current = true
        setFault(data.message || TRIAL_MESSAGE)
        setPhase('ended')
        return
      }
      if (!response.ok || !data.accessToken) {
        setFault(data.error || 'The conversation could not be started. Please try again.')
        setPhase('error')
        return
      }

      const call = new RetellWebClient()
      call.callId = data.callId
      openTranscript(data.callId)
      let trialEnded = false
      call.on('audio', (samples) => {
        let energy = 0
        for (let i = 0; i < samples.length; i += 1) energy += samples[i] * samples[i]
        const rms = Math.sqrt(energy / samples.length)
        const next = Math.min(1, rms * 3.2)
        levelRef.current += (next - levelRef.current) * 0.2
        shapeFromSamples(samples, shapeRef.current)
        freshRef.current = true
      })
      call.on('update', (update) => {
        const transcript = update?.transcript
        if (!Array.isArray(transcript)) return
        applyTranscript({
          type: 'transcript_updated',
          transcripts: transcript.map((item, index) => ({
            id: `${item.role}-${index}`,
            role: item.role,
            content: item.content,
            time_sec: index,
          })),
        })
      })
      call.on('call_started', () => setPhase('live'))
      call.on('call_ended', () => {
        window.clearTimeout(trialTimerRef.current)
        closeTranscript()
        callRef.current = null
        if (trialEnded) {
          limitedRef.current = true
          setFault(TRIAL_MESSAGE)
        }
        if (statusRef.current !== 'error') setPhase('ended')
      })
      call.on('error', (error) => {
        window.clearTimeout(trialTimerRef.current)
        closeTranscript()
        setFault(explain(error))
        setPhase('error')
      })
      callRef.current = call
      startedAtRef.current = Date.now()
      const capped = Number.isFinite(data.remainingMs) && data.remainingMs > 0
      endsAtRef.current = capped ? startedAtRef.current + data.remainingMs : 0
      if (capped) {
        trialTimerRef.current = window.setTimeout(() => {
          trialEnded = true
          finishTrial()
          limitedRef.current = true
          setFault(TRIAL_MESSAGE)
          setPhase('ended')
        }, data.remainingMs)
      }
      await call.startCall({
        accessToken: data.accessToken,
        callId: data.callId,
        transport: data.transport,
        url: data.url,
        iceServers: data.iceServers,
        emitRawAudioSamples: true,
      })
      try {
        await call.startAudioPlayback()
      } catch {
        // The click already counts as a gesture if playback starts with the call.
      }
    } catch (error) {
      finishTrial()
      setFault(explain(error))
      setPhase('error')
    }
  }

  useEffect(() => {
    if (status !== 'live') return undefined
    const tick = () => {
      const total = endsAtRef.current
        ? Math.ceil(Math.max(0, endsAtRef.current - Date.now()) / 1000)
        : Math.floor(Math.max(0, Date.now() - startedAtRef.current) / 1000)
      const minutes = Math.floor(total / 60)
      const seconds = String(total % 60).padStart(2, '0')
      setClock(`${minutes}:${seconds}`)
    }
    tick()
    const timer = window.setInterval(tick, 250)
    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => {
    onConversation?.({ status, turns })
  }, [onConversation, status, turns])

  const action = status === 'ringing' ? 'Ringing' : status === 'connecting' ? 'Connecting' : status === 'live' ? 'End' : 'Speak'

  return (
    <section className="agent-float" aria-labelledby="sophie-title">
      <div className={`orb${status === 'live' ? ' is-live' : ''}${hover && status !== 'live' ? ' is-hot' : ''}`}>
        <img className="orb-figure" src="/receptionist.png" alt="" />
        <canvas ref={canvasRef} className="orb-canvas" aria-hidden="true" />
        <div className="orb-mark">
          <p className={status === 'live' ? 'kicker' : 'kicker orb-kicker'}>{status === 'live' ? 'Live' : 'Start conversation'}</p>
          <h2 id="sophie-title" className={status === 'live' ? 'orb-title is-still' : 'orb-title'}>
            {'Ask Sophie'.split('').map((letter, index) => (
              <span key={`${letter}-${index}`} style={{ animationDelay: `${index * 0.14}s` }}>
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </h2>
          <p className="orb-brand">Our DeskAgent</p>
          {status === 'live' ? <p className="orb-time">{clock}</p> : null}
          <button
            className={`orb-speak${action === 'Speak' ? ' is-inviting' : ''}`}
            type="button"
            onClick={toggle}
            disabled={status === 'connecting' || status === 'ringing'}
            onMouseEnter={() => {
              hoverRef.current = true
              setHover(true)
            }}
            onMouseLeave={() => {
              hoverRef.current = false
              setHover(false)
            }}
          >
            {action}
          </button>
        </div>
      </div>
      {fault ? (
        <p className="agent-status" aria-live="polite">
          {fault}
        </p>
      ) : null}
    </section>
  )
}
