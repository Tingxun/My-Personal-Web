import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { pool } from './db.js'
import { contentRouter } from './routes/content.js'
import { guestbookRouter } from './routes/guestbook.js'

const app = express()

app.use(
  cors({
    origin: config.corsOrigin,
  }),
)
app.use(express.json({ limit: '64kb' }))

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.use('/api/content', contentRouter)
app.use('/api/guestbook', guestbookRouter)

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`API server listening on http://localhost:${config.port}`)
})
