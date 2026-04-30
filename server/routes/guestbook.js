import { Router } from 'express'
import { query } from '../db.js'
import { asyncHandler } from '../utils.js'

export const guestbookRouter = Router()

const allowedTones = new Set(['idea', 'like', 'bug'])

const mapEntry = (row) => ({
  id: String(row.id),
  name: row.name,
  message: row.message,
  tone: row.tone,
  createdAt: row.created_at,
})

guestbookRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await query(
      `SELECT id, name, message, tone, DATE_FORMAT(created_at, '%b %d, %H:%i') AS created_at
       FROM guestbook_entries
       WHERE status = 'approved'
       ORDER BY created_at DESC, id DESC
       LIMIT 50`,
    )

    res.json(rows.map(mapEntry))
  }),
)

guestbookRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || 'Anonymous').trim().slice(0, 50) || 'Anonymous'
    const message = String(req.body?.message || '').trim().slice(0, 500)
    const tone = allowedTones.has(req.body?.tone) ? req.body.tone : 'idea'

    if (message.length < 1) {
      res.status(400).json({ error: 'Message is required.' })
      return
    }

    const result = await query(
      `INSERT INTO guestbook_entries (name, message, tone, status)
       VALUES (?, ?, ?, 'approved')`,
      [name, message, tone],
    )

    const rows = await query(
      `SELECT id, name, message, tone, DATE_FORMAT(created_at, '%b %d, %H:%i') AS created_at
       FROM guestbook_entries
       WHERE id = ?`,
      [result.insertId],
    )

    res.status(201).json(mapEntry(rows[0]))
  }),
)
