import { motion } from 'framer-motion'
import { Pause, Play, Radio, SkipBack, SkipForward, Volume2, VolumeX, Waves } from 'lucide-react'
import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { pageMotion } from '../constants'
import type { MusicController } from '../types'

const orbitSlots = [
  { x: '8%', y: '68%', size: '118px' },
  { x: '23%', y: '30%', size: '92px' },
  { x: '41%', y: '76%', size: '106px' },
  { x: '62%', y: '22%', size: '120px' },
  { x: '78%', y: '64%', size: '94px' },
  { x: '91%', y: '28%', size: '112px' },
]

export function MusicPage({ music }: { music: MusicController }) {
  const { tracks, sourceNote, activeTrack, isPlaying, volume, progress, setVolume, setActiveTrack, previousTrack, nextTrack, togglePlayback, audioGraphRef } =
    music
  const spectrumRef = useRef<HTMLCanvasElement | null>(null)
  const activeIndex = Math.max(
    0,
    tracks.findIndex((track) => track.id === activeTrack.id),
  )
  const canSkip = tracks.some((track) => track.audioUrl)
  const playableCount = tracks.filter((track) => track.audioUrl).length
  const orbitTracks = useMemo(() => tracks.slice(0, orbitSlots.length), [tracks])

  useEffect(() => {
    const canvas = spectrumRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    let frame = 0

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * ratio
      canvas.height = canvas.clientHeight * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const render = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const graph = audioGraphRef.current
      context.clearRect(0, 0, width, height)
      context.fillStyle = 'rgba(109, 232, 255, 0.12)'
      context.fillRect(0, height - 1, width, 1)

      if (graph) {
        graph.analyser.getByteFrequencyData(graph.data)
      }

      const bars = graph?.data.length || 64
      const gap = 3
      const barWidth = Math.max(3, (width - gap * (bars - 1)) / bars)

      for (let index = 0; index < bars; index += 1) {
        const frequency = graph ? graph.data[index] / 255 : (Math.sin(Date.now() / 420 + index * 0.42) + 1) / 2
        const lift = isPlaying ? frequency : frequency * 0.38
        const barHeight = Math.max(6, lift * (height - 18))
        const x = index * (barWidth + gap)
        const y = height - barHeight
        const cyan = 180 + lift * 70
        const pink = 90 + lift * 120
        context.fillStyle = index % 5 === 0 ? `rgba(255, ${pink}, 180, ${0.28 + lift * 0.5})` : `rgba(109, ${cyan}, 255, ${0.3 + lift * 0.55})`
        context.beginPath()
        context.moveTo(x + barWidth * 0.5, y)
        context.lineTo(x + barWidth, height)
        context.lineTo(x, height)
        context.closePath()
        context.fill()
      }

      frame = requestAnimationFrame(render)
    }

    resize()
    render()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [audioGraphRef, isPlaying])

  return (
    <motion.div key="music" className="music-page" {...pageMotion}>
      <section className="music-stage section">
        <div className="music-stage-copy">
          <span>
            <Radio size={16} />
            SIGNAL {String(activeIndex + 1).padStart(2, '0')} / {String(Math.max(tracks.length, 1)).padStart(2, '0')}
          </span>
          <h1>MUSIC</h1>
          <p>{activeTrack.title}</p>
        </div>

        <div className="music-orbit-field">
          {orbitTracks.map((track, index) => {
            const slot = orbitSlots[index]
            return (
              <button
                key={track.id}
                className={track.id === activeTrack.id ? 'music-orbit-node active' : 'music-orbit-node'}
                type="button"
                style={{ '--node-x': slot.x, '--node-y': slot.y, '--node-size': slot.size } as CSSProperties}
                onClick={() => setActiveTrack(track)}
                aria-label={track.title}
              >
                <img src={track.cover} alt="" />
              </button>
            )
          })}
        </div>

        <div className="music-console">
          <div className="music-console-info">
            <span>MODE</span>
            <strong>{isPlaying ? 'LIVE' : 'READY'}</strong>
            <small>{sourceNote}</small>
          </div>

          <div className={isPlaying ? 'music-turntable spinning' : 'music-turntable'}>
            <div className="music-record-rings" aria-hidden="true" />
            <svg className="music-progress-ring" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6de8ff" />
                  <stop offset="50%" stopColor="#ff5bb4" />
                  <stop offset="100%" stopColor="#9dff77" />
                </linearGradient>
                <filter id="progressGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle className="music-progress-ring-bg" cx="50" cy="50" r="46" />
              <circle
                className="music-progress-ring-fill"
                cx="50"
                cy="50"
                r="46"
                style={{ '--progress': progress } as CSSProperties}
              />
            </svg>
            <img src={activeTrack.cover} alt="" />
          </div>

          <div className="music-armature" aria-hidden="true">
            <i />
            <b />
          </div>

          <div className="music-track-meta">
            <span>{activeTrack.source.toUpperCase()}</span>
            <h2>{activeTrack.title}</h2>
            <p>{activeTrack.artist}</p>
          </div>

          <div className="music-console-actions">
            <button type="button" onClick={previousTrack} disabled={!canSkip} aria-label="Previous track">
              <SkipBack size={18} />
            </button>
            <button className="music-main-action" type="button" onClick={togglePlayback} disabled={!activeTrack.audioUrl} aria-label="Play or pause">
              {isPlaying ? <Pause size={26} /> : <Play size={26} />}
            </button>
            <button type="button" onClick={nextTrack} disabled={!canSkip} aria-label="Next track">
              <SkipForward size={18} />
            </button>
          </div>

          <div className="music-volume-module">
            {volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Music volume"
            />
            <strong>{Math.round(volume * 100)}%</strong>
          </div>

          <div className="music-spectrum-shell">
            <div>
              <Waves size={18} />
              <span>{playableCount} LOCAL CHANNELS</span>
            </div>
            <canvas ref={spectrumRef} className="music-spectrum-canvas" aria-label="Music spectrum" />
          </div>
        </div>

        <div className="music-track-rail">
          {tracks.map((track, index) => (
            <motion.button
              key={track.id}
              type="button"
              className={track.id === activeTrack.id ? 'music-track-chip active' : 'music-track-chip'}
              onClick={() => setActiveTrack(track)}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <img src={track.cover} alt="" />
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
            </motion.button>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
