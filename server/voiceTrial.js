import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

export const TRIAL_MS = 120_000
export const MIN_CALL_MS = 60_000
export const TRIAL_MESSAGE = 'Thank you for trying it out. The trial limit was 2 minutes.'
// Off while the live agent is still being tested. Set back to true to restore the cap.
const TRIAL_LIMIT = false
const AGENT_ID = 'agent_92bd0eb18227be0abe20dc7e44'

export function allowance(used) {
  const remainingMs = Math.max(0, TRIAL_MS - used)
  return { remainingMs, exhausted: remainingMs < MIN_CALL_MS }
}

export function trialIdForIp(ip) {
  const value = String(ip || 'unknown').replace(/^::ffff:/, '')
  const normalized = value === '::1' || value === '127.0.0.1' ? 'local' : value
  return createHash('sha256').update(`deskagent-trial:${normalized}`).digest('hex').slice(0, 24)
}

function apiKey() {
  if (process.env.RETELL_API_KEY) return process.env.RETELL_API_KEY
  try {
    const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    const line = text.split(/\r?\n/).find((entry) => entry.startsWith('RETELL_API_KEY='))
    return line ? line.slice('RETELL_API_KEY='.length).trim() : ''
  } catch {
    return ''
  }
}

async function retell(path, options = {}) {
  const key = apiKey()
  if (!key) {
    const error = new Error('missing key')
    error.status = 503
    throw error
  }
  const response = await fetch(`https://api.retellai.com${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text.slice(0, 180) }
    }
  }
  if (!response.ok) {
    const error = new Error(data?.error_message || data?.message || `Retell request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return data
}

async function callsFor(trialId) {
  const calls = await retell('/v2/list-calls', {
    method: 'POST',
    body: {
      filter_criteria: { agent_id: [AGENT_ID] },
      limit: 100,
      sort_order: 'descending',
    },
  })
  return (Array.isArray(calls) ? calls : []).filter((call) => call.metadata?.trial_id === trialId)
}

function usedBy(calls) {
  const now = Date.now()
  return calls.reduce((total, call) => {
    if (call.call_status === 'ongoing' && call.start_timestamp) {
      return total + Math.max(0, now - Number(call.start_timestamp))
    }
    return total + Math.max(0, Number(call.duration_ms) || 0)
  }, 0)
}

export async function voiceTrial({ method, ip, callId }) {
  const trialId = trialIdForIp(ip)
  if (method === 'DELETE') {
    if (!callId) return { status: 400, body: { error: 'Missing call.' } }
    const call = await retell(`/v2/get-call/${encodeURIComponent(callId)}`)
    if (call.metadata?.trial_id !== trialId) return { status: 403, body: { error: 'Not this computer.' } }
    try {
      await retell(`/v2/stop-call/${encodeURIComponent(callId)}`, { method: 'POST' })
    } catch (error) {
      if (!/ongoing/i.test(String(error.message))) throw error
    }
    return { status: 200, body: { ok: true } }
  }

  const calls = TRIAL_LIMIT || method !== 'GET' ? await callsFor(trialId) : []
  const { remainingMs, exhausted } = TRIAL_LIMIT
    ? allowance(usedBy(calls))
    : { remainingMs: null, exhausted: false }
  if (method === 'GET') return { status: 200, body: { remainingMs, exhausted } }
  if (method !== 'POST') return { status: 405, body: { error: 'Method not allowed.' } }
  if (calls.some((call) => call.call_status === 'ongoing')) {
    return { status: 409, body: { error: 'A conversation from this computer is already open.' } }
  }
  if (exhausted) return { status: 403, body: { exhausted: true, message: TRIAL_MESSAGE } }

  const call = await retell('/v3/create-web-call', {
    method: 'POST',
    body: {
      agent_id: AGENT_ID,
      metadata: { trial_id: trialId },
      ...(TRIAL_LIMIT ? { agent_override: { agent: { max_call_duration_ms: remainingMs } } } : {}),
    },
  })
  return {
    status: 200,
    body: {
      accessToken: call.access_token,
      callId: call.call_id,
      transport: call.transport,
      iceServers: call.ice_servers,
      url: call.url,
      remainingMs,
    },
  }
}

function spokenText(item) {
  if (typeof item?.content === 'string' && item.content.trim()) return item.content
  if (!Array.isArray(item?.words)) return ''
  return item.words
    .map((word) => (typeof word === 'string' ? word : word?.word))
    .filter(Boolean)
    .join(' ')
}

function spokenLines(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: String(item?.id || `${item?.role || 'line'}-${index}`),
      role: item?.role,
      content: spokenText(item),
      time_sec: Number(item?.time_sec) || index,
    }))
    .filter((item) => item.content && (item.role === 'agent' || item.role === 'user'))
}

export function attachTranscriptStream(req, res, { ip, callId }) {
  if (!/^call_[A-Za-z0-9]+$/.test(String(callId || ''))) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Missing call.' }))
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      resolve()
    }

    authorizeWatch(ip, callId)
      .then((allowed) => {
        if (finished) return
        if (!allowed) {
          res.statusCode = 403
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Not this conversation.' }))
          finish()
          return
        }
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        })
        const send = (payload) => {
          if (finished) return
          res.write(`data: ${JSON.stringify(payload)}\n\n`)
        }
        const stop = followTranscript(callId, send)
        const ping = setInterval(() => {
          if (!finished) res.write(':\n\n')
        }, 15000)
        const done = () => {
          clearInterval(ping)
          stop()
          finish()
        }
        req.on('close', done)
        res.on('error', done)
      })
      .catch(() => {
        if (finished) return
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'The transcript could not be opened.' }))
        finish()
      })
  })
}

async function authorizeWatch(ip, callId) {
  const call = await retell(`/v2/get-call/${encodeURIComponent(callId)}`)
  return call.metadata?.trial_id === trialIdForIp(ip)
}

function followTranscript(callId, send) {
  const key = apiKey()
  let stopped = false
  let socket
  let attempt = 0
  let timer
  let poll
  let heard = false

  const stop = () => {
    stopped = true
    clearTimeout(timer)
    clearInterval(poll)
    socket?.close()
  }

  const open = () => {
    if (stopped || !key) return
    socket = new WebSocket(
      `wss://api.retellai.com/v2/monitor-call/${encodeURIComponent(callId)}`,
      ['bearer', key],
    )
    socket.addEventListener('message', (event) => {
      attempt = 0
      let message
      try {
        message = JSON.parse(String(event.data))
      } catch {
        return
      }
      if (message?.type !== 'transcript_snapshot' && message?.type !== 'transcript_updated') return
      heard = true
      clearInterval(poll)
      send({
        type: message.type,
        transcripts: spokenLines(message.transcripts),
      })
    })
    socket.addEventListener('close', (event) => {
      if (stopped || event.code === 1000) return
      if (attempt >= 6) return
      const wait = Math.min(8000, 400 * 2 ** attempt)
      attempt += 1
      timer = setTimeout(open, wait)
    })
    socket.addEventListener('error', () => {})
  }

  const readBook = async () => {
    if (stopped || heard) return
    try {
      const call = await retell(`/v2/get-call/${encodeURIComponent(callId)}`)
      const lines = spokenLines(call.transcript_object)
      if (lines.length) send({ type: 'transcript_snapshot', source: 'book', transcripts: lines })
    } catch {
      // The monitor stream is the live source. A missed read can wait for the next one.
    }
  }

  open()
  poll = setInterval(readBook, 900)
  readBook()
  return stop
}
