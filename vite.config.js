import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { voiceTrial } from './server/voiceTrial.js'

function clientIp(req) {
  const value = req.socket?.remoteAddress || ''
  return String(value).replace(/^::ffff:/, '')
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function voiceTrialPlugin() {
  return {
    name: 'voice-trial',
    configureServer(server) {
      server.middlewares.use('/api/voice-trial', async (req, res) => {
        try {
          const body = req.method === 'DELETE' ? await readBody(req) : {}
          const result = await voiceTrial({ method: req.method, ip: clientIp(req), callId: body.callId })
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result.body))
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'The conversation could not be started. Please try again.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), voiceTrialPlugin()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
