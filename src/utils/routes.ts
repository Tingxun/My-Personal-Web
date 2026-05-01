import type { PageId } from '../types'

export function getPageFromHash(): PageId {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'music') return 'music'
  if (hash === 'photos' || hash === 'games' || hash === 'memories') return 'memories'
  if (hash === 'code' || hash === 'lab') return 'lab'
  if (hash === 'guestbook' || hash === 'message' || hash === 'feedback') return 'guestbook'
  if (hash === 'music' || hash === 'memories' || hash === 'lab' || hash === 'guestbook') return hash
  return 'home'
}
