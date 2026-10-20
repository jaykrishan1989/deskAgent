import { voiceTrial } from '../server/voiceTrial.js'

function clientIp(req) {
  const real = req.headers['x-real-ip']
  const forwarded = req.headers['x-forwarded-for']
  const value = real || forwarded || req.socket?.remoteAddress || ''
  return String(value).split(',')[0].trim()
}

export default async function handler(req, res) {
  try {
    let callId = ''
    if (req.method === 'DELETE') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const raw = Buffer.concat(chunks).toString('utf8')
      callId = raw ? JSON.parse(raw).callId : ''
    }
    const result = await voiceTrial({ method: req.method, ip: clientIp(req), callId })
    res.status(result.status).json(result.body)
  } catch {
    res.status(502).json({ error: 'The conversation could not be started. Please try again.' })
  }
}
