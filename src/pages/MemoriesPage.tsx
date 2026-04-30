import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { GamesSection } from '../features/GamesSection'
import { MusicPanel } from '../features/MusicPanel'
import { PhotoGallery } from '../features/PhotoGallery'
import { WlopArtCollection } from '../features/WlopArtCollection'
import { pageMotion } from '../constants'
import type { MusicController } from '../types'
import type { GameItem, PhotoItem } from '../data'

export function MemoriesPage({ music, photos, games }: { music: MusicController; photos: PhotoItem[]; games: GameItem[] }) {
  const wlopPhotos = photos.filter((photo) => photo.category.startsWith('WLOP'))
  const galleryPhotos = photos.filter((photo) => !photo.category.startsWith('WLOP'))

  return (
    <motion.div key="memories" {...pageMotion}>
      <section className="page-hero section">
        <span className="eyebrow">
          <Camera size={16} />
          Memories Page
        </span>
        <h1>记忆馆</h1>
        <p>音乐、照片和游戏被收纳在同一层空间里，但模块之间保持清晰边界。</p>
      </section>
      <MusicPanel music={music} />
      <WlopArtCollection photos={wlopPhotos} />
      <PhotoGallery photos={galleryPhotos} />
      <GamesSection games={games} />
    </motion.div>
  )
}
