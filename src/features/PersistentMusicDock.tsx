import { motion } from 'framer-motion'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import type { MusicController, PageId } from '../types'

export function PersistentMusicDock({ music, goToPage }: { music: MusicController; goToPage: (page: PageId) => void }) {
  const { activeTrack, isPlaying, volume, progress, setVolume, togglePlayback } = music

  return (
    <motion.aside
      className={isPlaying ? 'music-dock playing' : 'music-dock'}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
      aria-label="全站音乐播放控制"
    >
      <button className="dock-cover" type="button" onClick={() => goToPage('memories')} aria-label="打开记忆馆播放器">
        <img src={activeTrack.cover} alt="" />
        <span style={{ transform: `scaleX(${Math.max(progress, 0.02)})` }} />
      </button>
      <div className="dock-meta">
        <small>{isPlaying ? 'Now playing' : 'Audio ready'}</small>
        <strong>{activeTrack.title}</strong>
      </div>
      <button className="dock-play" type="button" onClick={togglePlayback} disabled={!activeTrack.audioUrl} aria-label="播放或暂停">
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <div className="dock-volume">
        {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="全站音量"
        />
      </div>
    </motion.aside>
  )
}
