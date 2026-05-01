import type { MutableRefObject, ReactNode } from 'react'
import type { MusicTrack } from './data'

export type PageId = 'home' | 'music' | 'memories' | 'lab' | 'guestbook'

export type AudioGraph = {
  context: AudioContext
  analyser: AnalyserNode
  data: Uint8Array<ArrayBuffer>
}

export type MusicController = {
  tracks: MusicTrack[]
  sourceNote: string
  activeTrack: MusicTrack
  isPlaying: boolean
  volume: number
  progress: number
  setVolume: (volume: number) => void
  setActiveTrack: (track: MusicTrack) => void
  previousTrack: () => void
  nextTrack: () => void
  togglePlayback: () => Promise<void>
  audioGraphRef: MutableRefObject<AudioGraph | null>
  audioElement: ReactNode
}
