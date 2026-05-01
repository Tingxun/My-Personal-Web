import type { PageId } from './types'

export const pages: Array<{ id: PageId; label: string; hash: string }> = [
  { id: 'home', label: 'Overview', hash: '#home' },
  { id: 'memories', label: 'Memories', hash: '#memories' },
  { id: 'lab', label: 'Lab', hash: '#lab' },
  { id: 'guestbook', label: 'Guestbook', hash: '#guestbook' },
]

export const PHOTO_INITIAL_COUNT = 8
export const PHOTO_LOAD_STEP = 6
export const PHOTO_MAX_LOAD_COUNT = 24

export const sectionMotion = {
  initial: false,
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-120px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
} as const

export const pageMotion = {
  initial: { opacity: 0, y: 28, filter: 'blur(12px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)' },
  transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
} as const
