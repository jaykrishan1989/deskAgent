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
    const target = Math.max(-1, Math.min(1, (mid < 0 ? -peak : peak) * 2.6))
    into[i] += (target - into[i]) * 0.45
  }
}

function fadingRing(ctx, cx, cy, radius, alpha, time, rgb) {
  const steps = 90
  ctx.lineWidth = 1
  for (let i = 0; i < steps; i += 1) {
    const start = (i / steps) * Math.PI * 2
    const end = ((i + 1) / steps) * Math.PI * 2
    const fade = Math.max(0, Math.sin(start * 3 + time * 0.7))
    ctx.beginPath()
    ctx.arc(cx, cy, radius, start, end)
    ctx.strokeStyle = `rgba(${rgb}, ${alpha * fade})`
    ctx.stroke()
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

function paintSpeech(ctx, cx, cy, reach, shape, level, seconds, rgb) {
  const count = shape.length
  const energy = Math.min(1, level)
  const spin = seconds * (0.28 + energy * 1.15)

  for (let pulse = 0; pulse < 4; pulse += 1) {
    const progress = (seconds * (0.22 + energy * 0.85) + pulse / 4) % 1
    const radius = reach * (0.5 + progress * 0.48)
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${rgb}, ${(1 - progress) * (0.05 + energy * 0.42)})`
    ctx.lineWidth = 1 + (1 - progress) * energy * 2.2
    ctx.stroke()
  }

  const bands = [
    { radius: 0.5, amp: 16, turn: 0.22, width: 2.4, alpha: 0.72, wobble: 5 },
    { radius: 0.58, amp: 22, turn: -0.46, width: 1.5, alpha: 0.38, wobble: 3 },
    { radius: 0.68, amp: 12, turn: 0.7, width: 1.15, alpha: 0.28, wobble: 2 },
  ]
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  bands.forEach((band, index) => {
    const points = ringPoints(
      cx,
      cy,
      shape,
      reach * band.radius,
      band.amp * (0.25 + energy),
      spin * band.turn,
      band.wobble * (0.4 + energy),
    )
    ctx.strokeStyle = index === 0
      ? `rgba(${rgb}, ${band.alpha * (0.35 + energy)})`
      : `rgba(214, 236, 222, ${band.alpha * (0.3 + energy)})`
    ctx.lineWidth = band.width
    strokeLoop(ctx, points)
  })

  const tips = []
  for (let i = 0; i < count; i += 1) {
    const magnitude = Math.min(1, Math.abs(shape[i]) * 1.35)
    const angle = (i / count) * Math.PI * 2 + spin
    const inner = reach * 0.6
    const length = (4 + energy * 10) + magnitude * (18 + energy * 78)
    const x2 = cx + Math.cos(angle) * (inner + length)
    const y2 = cy + Math.sin(angle) * (inner + length)
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = `rgba(${rgb}, ${(0.08 + magnitude * 0.82) * (0.35 + energy)})`
    ctx.lineWidth = magnitude > 0.55 ? 2.4 : 1.15
    ctx.stroke()
    tips.push({ x: x2, y: y2, magnitude, angle })

    const ghost = angle - 0.08
    const ghostLength = length * 0.62
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(ghost) * (inner + 6), cy + Math.sin(ghost) * (inner + 6))
    ctx.lineTo(cx + Math.cos(ghost) * (inner + ghostLength), cy + Math.sin(ghost) * (inner + ghostLength))
    ctx.strokeStyle = `rgba(226, 244, 232, ${magnitude * energy * 0.45})`
    ctx.lineWidth = 1
    ctx.stroke()

    const dots = 4
    for (let dot = 0; dot < dots; dot += 1) {
      const along = inner + length * ((dot + 1) / (dots + 0.4))
      const drift = Math.sin(seconds * 4.2 + i * 0.7 + dot) * (1 + energy * 3.5)
      const x = cx + Math.cos(angle) * along + Math.cos(angle + Math.PI / 2) * drift
      const y = cy + Math.sin(angle) * along + Math.sin(angle + Math.PI / 2) * drift
      ctx.beginPath()
      ctx.arc(x, y, 0.6 + magnitude * (1.1 + dot * 0.25), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${dot % 2 ? '232, 246, 236' : rgb}, ${(0.12 + magnitude * 0.8) * (0.4 + energy)})`
      ctx.fill()
    }
  }

  ctx.beginPath()
  let mesh = false
  for (let i = 0; i < tips.length; i += 1) {
    const current = tips[i]
    const next = tips[(i + 3) % tips.length]
    if (current.magnitude < 0.28 || next.magnitude < 0.28) continue
    ctx.moveTo(current.x, current.y)
    ctx.lineTo(next.x, next.y)
    mesh = true
  }
  if (mesh) {
    ctx.strokeStyle = `rgba(${rgb}, ${0.08 + energy * 0.22})`
    ctx.lineWidth = 0.8
    ctx.stroke()
  }

  tips.forEach((tip) => {
    if (tip.magnitude < 0.42) return
    ctx.beginPath()
    ctx.arc(tip.x, tip.y, 1.4 + tip.magnitude * (2 + energy * 3), 0, Math.PI * 2)
    ctx.fillStyle = `rgba(236, 248, 240, ${0.25 + tip.magnitude * energy * 0.7})`
    ctx.fill()
  })

  const sweep = spin * 2.2
  ctx.beginPath()
  ctx.arc(cx, cy, reach * 0.9, sweep, sweep + 0.55 + energy * 0.7)
  ctx.strokeStyle = `rgba(244, 252, 246, ${0.35 + energy * 0.6})`
  ctx.lineWidth = 2.4
  ctx.stroke()
  ctx.shadowBlur = 0
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
  const lift = live ? 0.12 : 0

  if (live) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, reach * 0.92, 0, Math.PI * 2)
    ctx.clip()
  }

  fadingRing(ctx, cx, cy, reach * 0.46 + breath, 0.22 + lift, seconds, rgb)
  fadingRing(ctx, cx, cy, reach * 0.64 + breath * 0.55, 0.14 + lift * 0.6, seconds + 1.4, rgb)
  fadingRing(ctx, cx, cy, reach * 0.84 + breath * 0.25, 0.08 + lift * 0.35, seconds + 2.2, rgb)

  if (live && level > 0.04) {
    const pulse = ctx.createRadialGradient(cx, cy, reach * 0.02, cx, cy, reach * 0.38)
    pulse.addColorStop(0, `rgba(${rgb}, ${level * 0.18})`)
    pulse.addColorStop(1, `rgba(${rgb}, 0)`)
    ctx.fillStyle = pulse
    ctx.beginPath()
    ctx.arc(cx, cy, reach * 0.38, 0, Math.PI * 2)
    ctx.fill()
  }

  if (live) {
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
  ctx.strokeStyle = `rgba(${rgb}, ${0.08 + lift + level * 0.72})`
  ctx.lineWidth = 1.6
  ctx.lineJoin = 'round'
  ctx.shadowColor = `rgba(${rgb}, ${0.14 + lift + level * 0.45})`
  ctx.shadowBlur = 14 + level * 24
  strokeLoop(ctx, points)
  ctx.shadowBlur = 0
}

export default function ProspectCall() {
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
  const logRef = useRef(null)
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
        for (let i = 0; i < shape.length; i += 1) shape[i] *= 0.9
        levelRef.current *= 0.9
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
    ringRef.current?.pause()
    callRef.current?.stopCall()
    callRef.current = null
  }, [])

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
      let trialEnded = false
      call.on('audio', (samples) => {
        let energy = 0
        for (let i = 0; i < samples.length; i += 1) energy += samples[i] * samples[i]
        const rms = Math.sqrt(energy / samples.length)
        levelRef.current = Math.max(levelRef.current * 0.72, Math.min(1, rms * 5))
        shapeFromSamples(samples, shapeRef.current)
        freshRef.current = true
      })
      call.on('update', (update) => {
        const transcript = update?.transcript
        if (!Array.isArray(transcript)) return
        const spoken = transcript.filter((item) => item?.content && (item.role === 'agent' || item.role === 'user'))
        setTurns(spoken.map((item, index) => ({
          id: `${item.role}-${index}`,
          role: item.role,
          content: item.content,
        })))
      })
      call.on('call_started', () => setPhase('live'))
      call.on('call_ended', () => {
        window.clearTimeout(trialTimerRef.current)
        callRef.current = null
        if (trialEnded) {
          limitedRef.current = true
          setFault(TRIAL_MESSAGE)
        }
        if (statusRef.current !== 'error') setPhase('ended')
      })
      call.on('error', (error) => {
        window.clearTimeout(trialTimerRef.current)
        setFault(explain(error))
        setPhase('error')
      })
      callRef.current = call
      endsAtRef.current = Date.now() + data.remainingMs
      trialTimerRef.current = window.setTimeout(() => {
        trialEnded = true
        finishTrial()
        limitedRef.current = true
        setFault(TRIAL_MESSAGE)
        setPhase('ended')
      }, data.remainingMs)
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
      const left = Math.max(0, endsAtRef.current - Date.now())
      const total = Math.ceil(left / 1000)
      const minutes = Math.floor(total / 60)
      const seconds = String(total % 60).padStart(2, '0')
      setClock(`${minutes}:${seconds}`)
    }
    tick()
    const timer = window.setInterval(tick, 250)
    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => {
    const node = logRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [turns])

  const prompt = status === 'live'
    ? 'Sophie can hear you. Ask how DeskAgent would take your customers’ calls.'
    : status === 'ringing'
      ? 'Ringing.'
      : status === 'connecting'
        ? 'Connecting.'
        : status === 'ended'
          ? 'The conversation has ended.'
          : ''

  const action = status === 'ringing' ? 'Ringing' : status === 'connecting' ? 'Connecting' : status === 'live' ? 'End' : 'Speak'
  const talking = status === 'connecting' || status === 'live' || (status === 'ended' && turns.length > 0)

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
      {talking ? (
        <div className={`voice-dialog${status === 'live' ? ' is-live' : ''}`}>
          <div className="voice-dialog-bar">
            <span>Transcript</span>
            <span>{status === 'live' ? 'Receiving' : 'Opening'}</span>
          </div>
          <ol ref={logRef} aria-live="polite" aria-relevant="additions">
            {turns.length ? turns.map((turn) => (
              <li key={turn.id} className={turn.role === 'user' ? 'voice-line is-user' : 'voice-line'}>
                <span>{turn.role === 'agent' ? 'Sophie' : 'You'}</span>
                <p>{turn.content}</p>
              </li>
            )) : (
              <li className="voice-wait">Waiting for the first words.</li>
            )}
          </ol>
        </div>
      ) : null}
      {fault || prompt ? (
        <p className="agent-status" aria-live="polite">
          {fault || prompt}
        </p>
      ) : null}
    </section>
  )
}
