import { Router } from 'express'
import { query } from '../db.js'
import { asyncHandler, parseJsonValue } from '../utils.js'

export const contentRouter = Router()

const mapPhoto = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  src: row.src,
  thumb: row.thumb,
  date: row.display_date,
  location: row.location,
})

const mapGame = (row) => ({
  id: row.id,
  name: row.name,
  cover: row.cover,
  screenshots: parseJsonValue(row.screenshots, []),
  lastPlayedOrUpdated: row.last_played_or_updated,
  tags: parseJsonValue(row.tags, []),
})

const mapProject = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  techStack: parseJsonValue(row.tech_stack, []),
  summary: row.summary,
  path: row.path,
  featured: Boolean(row.featured),
})

const mapTrack = (row) => ({
  id: row.id,
  title: row.title,
  artist: row.artist,
  cover: row.cover,
  audioUrl: row.audio_url,
  source: row.source,
  externalUrl: row.external_url || undefined,
})

const mapSkill = (row) => ({
  label: row.label,
  value: row.value,
  detail: row.detail,
})

contentRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [photos, games, projects, musicTracks, skills] = await Promise.all([
      query('SELECT * FROM photos ORDER BY sort_order ASC, id ASC'),
      query('SELECT * FROM games ORDER BY sort_order ASC, id ASC'),
      query('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, id ASC'),
      query('SELECT * FROM music_tracks ORDER BY sort_order ASC, id ASC'),
      query('SELECT * FROM skills ORDER BY sort_order ASC, id ASC'),
    ])

    res.json({
      photos: photos.map(mapPhoto),
      games: games.map(mapGame),
      projects: projects.map(mapProject),
      localTracks: musicTracks.map(mapTrack),
      skills: skills.map(mapSkill),
    })
  }),
)

contentRouter.get('/photos', asyncHandler(async (_req, res) => res.json((await query('SELECT * FROM photos ORDER BY sort_order ASC, id ASC')).map(mapPhoto))))
contentRouter.get('/games', asyncHandler(async (_req, res) => res.json((await query('SELECT * FROM games ORDER BY sort_order ASC, id ASC')).map(mapGame))))
contentRouter.get('/projects', asyncHandler(async (_req, res) => res.json((await query('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, id ASC')).map(mapProject))))
contentRouter.get('/music-tracks', asyncHandler(async (_req, res) => res.json((await query('SELECT * FROM music_tracks ORDER BY sort_order ASC, id ASC')).map(mapTrack))))
contentRouter.get('/skills', asyncHandler(async (_req, res) => res.json((await query('SELECT * FROM skills ORDER BY sort_order ASC, id ASC')).map(mapSkill))))
