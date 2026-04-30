import { useEffect, useRef, useState } from 'react'
import { localTracks as fallbackTracks, type MusicTrack } from '../data'
import type { AudioGraph, MusicController } from '../types'

const legacyMissingCoverPattern = /^\/assets\/optimized\/photos\/wlop-\d+-thumb\.webp$/

const hashText = (value: string) => {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

const pickFallbackCover = (trackId: string, coverFallbacks: string[]) => {
  if (!coverFallbacks.length) return '/assets/optimized/wlop/2022/wlop-2022-1-dressingroom2-4k-91f9a3af-thumb.webp'
  return coverFallbacks[hashText(trackId) % coverFallbacks.length]
}

const needsFallbackCover = (cover: string) => !cover || legacyMissingCoverPattern.test(cover)

const withFallbackCovers = (tracks: MusicTrack[], coverFallbacks: string[]) =>
  tracks.map((track) => ({
    ...track,
    cover: needsFallbackCover(track.cover) ? pickFallbackCover(track.id, coverFallbacks) : track.cover,
  }))

function useMusicTracks(localTracks: MusicTrack[], coverFallbacks: string[]) {
  const [tracks, setTracks] = useState<MusicTrack[]>(withFallbackCovers(localTracks.length ? localTracks : fallbackTracks, coverFallbacks))
  const [sourceNote, setSourceNote] = useState('Local fallback ready')

  useEffect(() => {
    setTracks(withFallbackCovers(localTracks.length ? localTracks : fallbackTracks, coverFallbacks))
  }, [coverFallbacks, localTracks])

  useEffect(() => {
    const apiBase = import.meta.env.VITE_NETEASE_API_BASE as string | undefined
    const playlistId = import.meta.env.VITE_NETEASE_PLAYLIST_ID as string | undefined
    if (!apiBase || !playlistId) return

    const controller = new AbortController()
    const endpoint = `${apiBase.replace(/\/$/, '')}/playlist/detail?id=${playlistId}`

    fetch(endpoint, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Music API responded ${response.status}`)
        return response.json() as Promise<{
          playlist?: {
            tracks?: Array<{
              id: number
              name: string
              al?: { picUrl?: string }
              ar?: Array<{ name: string }>
            }>
          }
        }>
      })
      .then((payload) => {
        const imported = payload.playlist?.tracks?.slice(0, 6).map((track) => ({
          id: `netease-${track.id}`,
          title: track.name,
          artist: track.ar?.map((artist) => artist.name).join(' / ') || 'Unknown Artist',
          cover: track.al?.picUrl || pickFallbackCover(`netease-${track.id}`, coverFallbacks),
          audioUrl: '',
          source: 'netease' as const,
          externalUrl: `https://music.163.com/#/song?id=${track.id}`,
        }))

        if (imported?.length) {
          setTracks([...imported, ...withFallbackCovers(localTracks.length ? localTracks : fallbackTracks, coverFallbacks)])
          setSourceNote('Netease playlist loaded, playback depends on external availability')
        }
      })
      .catch(() => setSourceNote('Music API unavailable, using local fallback'))

    return () => controller.abort()
  }, [coverFallbacks, localTracks])

  return { tracks, sourceNote }
}

export function usePersistentMusic(localTracks: MusicTrack[], coverFallbacks: string[] = []): MusicController {
  const { tracks, sourceNote } = useMusicTracks(localTracks, coverFallbacks)
  const [activeTrack, setActiveTrack] = useState(tracks[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.72)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioGraphRef = useRef<AudioGraph | null>(null)
  const shouldResumeRef = useRef(false)

  const playableTracks = tracks.filter((track) => Boolean(track.audioUrl))

  const moveTrack = (direction: 1 | -1) => {
    if (!playableTracks.length) return

    shouldResumeRef.current = isPlaying
    setActiveTrack((current) => {
      const currentIndex = playableTracks.findIndex((track) => track.id === current.id)
      const safeIndex = currentIndex === -1 ? 0 : currentIndex
      const nextIndex = (safeIndex + direction + playableTracks.length) % playableTracks.length
      return playableTracks[nextIndex]
    })
  }

  useEffect(() => {
    setActiveTrack((current) => tracks.find((track) => track.id === current.id) || tracks[0])
  }, [tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!activeTrack.audioUrl) {
      audio.pause()
      setIsPlaying(false)
      setProgress(0)
      return
    }
    audio.load()
    audio.volume = volume
    setIsPlaying(false)
    setProgress(0)

    if (shouldResumeRef.current) {
      shouldResumeRef.current = false
      const resumePlayback = async () => {
        try {
          await audio.play()
          setIsPlaying(true)
        } catch {
          setIsPlaying(false)
        }
      }
      void resumePlayback()
    }
  }, [activeTrack, volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const syncProgress = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        setProgress(0)
        return
      }
      setProgress(audio.currentTime / audio.duration)
    }

    const syncEnd = () => {
      shouldResumeRef.current = true
      setProgress(0)
      moveTrack(1)
    }

    audio.addEventListener('timeupdate', syncProgress)
    audio.addEventListener('loadedmetadata', syncProgress)
    audio.addEventListener('ended', syncEnd)
    return () => {
      audio.removeEventListener('timeupdate', syncProgress)
      audio.removeEventListener('loadedmetadata', syncProgress)
      audio.removeEventListener('ended', syncEnd)
    }
  }, [moveTrack])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio || !activeTrack.audioUrl) return

    if (!audioGraphRef.current) {
      const windowWithWebkit = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }
      const AudioContextClass = window.AudioContext || windowWithWebkit.webkitAudioContext
      if (AudioContextClass) {
        const context = new AudioContextClass()
        const analyser = context.createAnalyser()
        const source = context.createMediaElementSource(audio)
        analyser.fftSize = 128
        source.connect(analyser)
        analyser.connect(context.destination)
        audioGraphRef.current = {
          context,
          analyser,
          data: new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>,
        }
      }
    }

    if (audioGraphRef.current?.context.state === 'suspended') {
      await audioGraphRef.current.context.resume()
    }

    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return {
    tracks,
    sourceNote,
    activeTrack,
    isPlaying,
    volume,
    progress,
    setVolume,
    setActiveTrack,
    previousTrack: () => moveTrack(-1),
    nextTrack: () => moveTrack(1),
    togglePlayback,
    audioGraphRef,
    audioElement: <audio ref={audioRef} src={activeTrack.audioUrl} />,
  }
}
