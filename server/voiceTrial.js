import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

export const TRIAL_MS = 120_000
export const MIN_CALL_MS = 60_000
export const TRIAL_MESSAGE = 'Thank you for trying it out. The trial limit was 2 minutes.'
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

  const calls = await callsFor(trialId)
  const { remainingMs, exhausted } = allowance(usedBy(calls))
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
      agent_override: { agent: { max_call_duration_ms: remainingMs } },
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
