import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, X } from 'lucide-react'
import { photos, type PhotoItem } from '../data'
import { PHOTO_INITIAL_COUNT, PHOTO_LOAD_STEP, sectionMotion } from '../constants'
import { SectionHeading } from '../components/SectionHeading'

export function PhotoGallery() {
  const categories = useMemo(() => ['全部', ...Array.from(new Set(photos.map((item) => item.category)))], [])
  const [category, setCategory] = useState('全部')
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [loadedCount, setLoadedCount] = useState(PHOTO_INITIAL_COUNT)
  const [isPending, startTransition] = useTransition()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const visiblePhotos = useMemo(
    () => (category === '全部' ? photos : photos.filter((item) => item.category === category)),
    [category],
  )
  const loadedPhotos = visiblePhotos.slice(0, loadedCount)
  const hasMorePhotos = loadedCount < visiblePhotos.length
  const loadPercent = visiblePhotos.length ? Math.min(1, loadedCount / visiblePhotos.length) : 1

  const loadToCount = useCallback(
    (count: number) => {
      const nextCount = Math.min(visiblePhotos.length, Math.max(PHOTO_INITIAL_COUNT, count))
      startTransition(() => setLoadedCount(nextCount))
    },
    [visiblePhotos.length],
  )

  const loadNextBatch = useCallback(() => {
    loadToCount(loadedCount + PHOTO_LOAD_STEP)
  }, [loadToCount, loadedCount])

  const loadFromRail = (clientX: number, clientY: number, rail: HTMLElement) => {
    const rect = rail.getBoundingClientRect()
    const rawPercent = rect.width > rect.height * 2 ? (clientX - rect.left) / rect.width : (clientY - rect.top) / rect.height
    const percent = Math.min(1, Math.max(0, rawPercent))
    loadToCount(Math.ceil(visiblePhotos.length * percent))
  }

  useEffect(() => {
    setLoadedCount(Math.min(PHOTO_INITIAL_COUNT, visiblePhotos.length))
  }, [visiblePhotos.length])

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasMorePhotos) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadNextBatch()
      },
      { rootMargin: '420px 0px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMorePhotos, loadNextBatch])

  return (
    <motion.section id="photos" className="section" {...sectionMotion}>
      <SectionHeading
        eyebrow="Visual Archive"
        title="照片几何墙"
        text="把杂乱照片先按地点与主题精选入库，首版用轻量缩略图铺开，点击进入沉浸预览。"
        icon={<Camera size={16} />}
      />
      <div className="filter-bar">
        {categories.map((item) => (
          <motion.button
            key={item}
            type="button"
            className={category === item ? 'active' : ''}
            onClick={() => setCategory(item)}
            whileHover={{ y: -3, skewX: -6 }}
            whileTap={{ scale: 0.94 }}
          >
            {item}
          </motion.button>
        ))}
      </div>
      <div className="photo-progress">
        <span>
          已加载 {Math.min(loadedCount, visiblePhotos.length)} / {visiblePhotos.length}
        </span>
        <i style={{ transform: `scaleX(${loadPercent})` }} />
      </div>
      <div className="photo-loader-layout">
        <div className="photo-grid">
          <AnimatePresence mode="popLayout">
            {loadedPhotos.map((item, index) => (
              <motion.button
                layout
                key={item.id}
                type="button"
                className="photo-tile"
                onClick={() => setSelectedPhoto(item)}
                initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.94, rotate: 1 }}
                whileHover={{ y: -8, rotate: index % 2 ? 1.2 : -1.2 }}
                transition={{ duration: 0.28, delay: Math.min(index, PHOTO_LOAD_STEP) * 0.02 }}
              >
                <img
                  src={item.thumb}
                  alt={item.title}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index < 4 ? 'high' : 'auto'}
                />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.location}</small>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        <div
          className="photo-load-rail"
          role="slider"
          aria-label="图片加载进度"
          aria-valuemin={Math.min(PHOTO_INITIAL_COUNT, visiblePhotos.length)}
          aria-valuemax={visiblePhotos.length}
          aria-valuenow={Math.min(loadedCount, visiblePhotos.length)}
          tabIndex={0}
          style={{ '--loaded-progress': loadPercent } as React.CSSProperties}
          onPointerDown={(event) => {
            const rail = event.currentTarget
            rail.setPointerCapture(event.pointerId)
            loadFromRail(event.clientX, event.clientY, rail)
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return
            loadFromRail(event.clientX, event.clientY, event.currentTarget)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'PageDown') loadNextBatch()
            if (event.key === 'ArrowUp' || event.key === 'PageUp') loadToCount(loadedCount - PHOTO_LOAD_STEP)
            if (event.key === 'End') loadToCount(visiblePhotos.length)
            if (event.key === 'Home') loadToCount(PHOTO_INITIAL_COUNT)
          }}
        >
          <span>DRAG</span>
          <i />
          <b />
        </div>
      </div>
      <div ref={loadMoreRef} className="photo-sentinel">
        {hasMorePhotos ? (
          <button type="button" onClick={loadNextBatch} disabled={isPending}>
            {isPending ? 'Loading...' : `Load ${Math.min(PHOTO_LOAD_STEP, visiblePhotos.length - loadedCount)} more`}
          </button>
        ) : (
          <span>Archive loaded</span>
        )}
      </div>
      <AnimatePresence>
        {selectedPhoto ? (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="lightbox-close" type="button" onClick={() => setSelectedPhoto(null)}>
              <X size={24} />
            </button>
            <motion.img
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              initial={{ scale: 0.92, y: 20, rotate: -1 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.92, y: 20, rotate: 1 }}
            />
            <div>
              <strong>{selectedPhoto.title}</strong>
              <span>
                {selectedPhoto.category} / {selectedPhoto.date} / {selectedPhoto.location}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}
