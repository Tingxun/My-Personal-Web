import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { sectionMotion } from '../constants'
import { SectionHeading } from '../components/SectionHeading'
import type { MusicController } from '../types'

export function MusicPanel({ music }: { music: MusicController }) {
  const { tracks, sourceNote, activeTrack, isPlaying, volume, setVolume, setActiveTrack, togglePlayback, audioGraphRef } =
    music
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
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
      const graph = audioGraphRef.current
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      context.clearRect(0, 0, width, height)

      if (graph) {
        graph.analyser.getByteFrequencyData(graph.data)
        const barWidth = width / graph.data.length
        graph.data.forEach((value, index) => {
          const percent = value / 255
          const barHeight = Math.max(8, percent * height)
          const x = index * barWidth
          context.fillStyle = `rgba(${110 + percent * 90}, ${232 - percent * 80}, 255, ${0.34 + percent * 0.52})`
          context.beginPath()
          context.moveTo(x + barWidth * 0.5, height - barHeight)
          context.lineTo(x + barWidth, height)
          context.lineTo(x, height)
          context.closePath()
          context.fill()
        })
      } else {
        for (let index = 0; index < 42; index += 1) {
          const phase = Math.sin(Date.now() / 650 + index * 0.7)
          const barHeight = 18 + (phase + 1) * 18
          context.fillStyle = index % 2 ? 'rgba(255,91,180,.3)' : 'rgba(109,232,255,.36)'
          context.beginPath()
          const x = index * (width / 42)
          context.moveTo(x + 5, height - barHeight)
          context.lineTo(x + 10, height)
          context.lineTo(x, height)
          context.closePath()
          context.fill()
        }
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
  }, [audioGraphRef])

  return (
    <motion.section id="music" className="section music-section" {...sectionMotion}>
      <SectionHeading
        eyebrow="Audio Layer"
        title="音乐频谱舱"
        text="先尝试从可配置音乐接口导入曲目；没有接口时，自动使用本地音频并保留实时频谱。"
        icon={<Music2 size={16} />}
      />
      <motion.div className="music-grid shard-panel" whileHover={{ rotateX: 1.2, rotateY: -1.2 }}>
        <div className="now-playing">
          <img src={activeTrack.cover} alt="" />
          <div>
            <span>{activeTrack.source.toUpperCase()}</span>
            <h3>{activeTrack.title}</h3>
            <p>{activeTrack.artist}</p>
          </div>
          <motion.button
            className="icon-action play-action"
            type="button"
            onClick={togglePlayback}
            disabled={!activeTrack.audioUrl}
            whileHover={{ scale: 1.12, rotate: 8 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </motion.button>
        </div>
        <canvas ref={canvasRef} className="visualizer" aria-label="音乐频谱可视化" />
        <div className="volume-control">
          <button type="button" onClick={() => setVolume(volume > 0 ? 0 : 0.72)} aria-label="切换静音">
            {volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="音量调节"
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>
        <div className="track-list">
          {tracks.map((track) => (
            <motion.button
              key={track.id}
              type="button"
              className={track.id === activeTrack.id ? 'track active' : 'track'}
              onClick={() => setActiveTrack(track)}
              whileHover={{ x: 8, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src={track.cover} alt="" />
              <span>
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </span>
              {track.externalUrl ? <ExternalLink size={16} /> : <Music2 size={16} />}
            </motion.button>
          ))}
        </div>
        <p className="module-note">{sourceNote}</p>
      </motion.div>
    </motion.section>
  )
}
