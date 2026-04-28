import type { PageId } from '../types'

export function getPageFromHash(): PageId {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'music' || hash === 'photos' || hash === 'games' || hash === 'memories') return 'memories'
  if (hash === 'code' || hash === 'lab') return 'lab'
  if (hash === 'memories' || hash === 'lab') return hash
  return 'home'
}
