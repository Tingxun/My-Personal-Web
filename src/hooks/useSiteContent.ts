import { useEffect, useState } from 'react'
import { fallbackContent, type SiteContent } from '../data'
import { apiGet } from '../services/api'

type ContentSource = 'loading' | 'api' | 'fallback'

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(fallbackContent)
  const [source, setSource] = useState<ContentSource>('loading')

  useEffect(() => {
    const controller = new AbortController()

    apiGet<SiteContent>('/api/content', controller.signal)
      .then((payload) => {
        setContent({
          photos: fallbackContent.photos,
          games: payload.games?.length ? payload.games : fallbackContent.games,
          projects: payload.projects?.length ? payload.projects : fallbackContent.projects,
          localTracks: payload.localTracks?.length ? payload.localTracks : fallbackContent.localTracks,
          skills: payload.skills?.length ? payload.skills : fallbackContent.skills,
        })
        setSource('api')
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setContent(fallbackContent)
        setSource('fallback')
      })

    return () => controller.abort()
  }, [])

  return { content, source }
}
