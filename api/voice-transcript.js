import { attachTranscriptStream } from '../server/voiceTrial.js'

function clientIp(req) {
  const real = req.headers['x-real-ip']
  const forwarded = req.headers['x-forwarded-for']
  const value = real || forwarded || req.socket?.remoteAddress || ''
  return String(value).split(',')[0].trim()
}

export default async function handler(req, res) {
  const callId = new URL(req.url, 'http://localhost').searchParams.get('callId')
  await attachTranscriptStream(req, res, { ip: clientIp(req), callId })
}
