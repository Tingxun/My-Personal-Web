import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GalleryHorizontal, Images, Maximize2, X } from 'lucide-react'
import type { PhotoItem } from '../data'
import { PageLoader } from '../components/PageLoader'
import { SectionHeading } from '../components/SectionHeading'

const SAMPLE_SIZE = 50
const COLUMN_COUNT = 4
const PIECE_WIDTH = 300
const PIECE_GAP = 60
const SEGMENT_WIDTH = COLUMN_COUNT * PIECE_WIDTH + (COLUMN_COUNT - 1) * PIECE_GAP
const SEGMENT_PITCH_X = SEGMENT_WIDTH + PIECE_GAP
const DEFAULT_SEGMENT_HEIGHT = 3000

const hashText = (value: string) => {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

const samplePhotos = (photos: PhotoItem[], seed: number) =>
  [...photos].sort((left, right) => hashText(`${seed}:${left.id}`) - hashText(`${seed}:${right.id}`)).slice(0, SAMPLE_SIZE)

export function WlopArtCollection({ photos }: { photos: PhotoItem[] }) {
  const [isPreparing, setIsPreparing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const years = useMemo(() => [...new Set(photos.map((photo) => photo.date))].sort(), [photos])
  const [activeYear, setActiveYear] = useState(() => years[0] || '2022')
  const [sampleSeed, setSampleSeed] = useState(() => Date.now())
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [segmentHeight, setSegmentHeight] = useState(DEFAULT_SEGMENT_HEIGHT)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const centerSegmentRef = useRef<HTMLDivElement | null>(null)
  const dragState = useRef<{
    x: number
    y: number
    left: number
    top: number
    moved: boolean
    startedAt: number
    photo: PhotoItem | null
  } | null>(null)
  const openTimer = useRef<number | null>(null)
  const activePhotos = useMemo(() => photos.filter((photo) => photo.date === activeYear), [activeYear, photos])
  const tiles = useMemo(() => samplePhotos(activePhotos, sampleSeed), [activePhotos, sampleSeed])
  const segmentPitchY = segmentHeight + PIECE_GAP
  const segments = useMemo(
    () =>
      [-1, 0, 1].flatMap((row) =>
        [-1, 0, 1].map((column) => ({
          column,
          row,
          key: `${column}:${row}`,
          x: (column + 1) * SEGMENT_PITCH_X,
          y: (row + 1) * segmentPitchY,
        })),
      ),
    [segmentPitchY],
  )

  useEffect(() => {
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!years.length || years.includes(activeYear)) return
    setActiveYear(years[0])
  }, [activeYear, years])

  useEffect(() => {
    setSelectedPhoto(null)
    setSampleSeed(Date.now())
    setSegmentHeight(DEFAULT_SEGMENT_HEIGHT)
    requestAnimationFrame(() => {
      const stage = stageRef.current
      if (!stage) return
      stage.scrollLeft = SEGMENT_PITCH_X
      stage.scrollTop = DEFAULT_SEGMENT_HEIGHT + PIECE_GAP
    })
  }, [activeYear])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      const stage = stageRef.current
      if (!stage) return
      stage.scrollLeft = SEGMENT_PITCH_X
      stage.scrollTop = segmentPitchY
    })

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedPhoto) setSelectedPhoto(null)
        else setIsOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, segmentPitchY, selectedPhoto])

  useEffect(() => {
    if (!isOpen || !centerSegmentRef.current) return

    const observer = new ResizeObserver(() => measureSegment())
    observer.observe(centerSegmentRef.current)
    measureSegment()

    return () => observer.disconnect()
  }, [isOpen])

  const measureSegment = () => {
    const segment = centerSegmentRef.current
    if (!segment) return
    const nextHeight = Math.max(1200, Math.ceil(segment.getBoundingClientRect().height))
    if (Math.abs(nextHeight - segmentHeight) > 24) setSegmentHeight(nextHeight)
  }

  const wrapScroll = () => {
    const stage = stageRef.current
    if (!stage) return

    if (stage.scrollLeft < SEGMENT_PITCH_X * 0.42) stage.scrollLeft += SEGMENT_PITCH_X
    if (stage.scrollLeft > SEGMENT_PITCH_X * 1.58) stage.scrollLeft -= SEGMENT_PITCH_X
    if (stage.scrollTop < segmentPitchY * 0.42) stage.scrollTop += segmentPitchY
    if (stage.scrollTop > segmentPitchY * 1.58) stage.scrollTop -= segmentPitchY
  }

  const openCollection = () => {
    setSelectedPhoto(null)
    setSampleSeed(Date.now())
    setIsPreparing(true)
    openTimer.current = window.setTimeout(() => {
      setIsOpen(true)
      setIsPreparing(false)
    }, 520)
  }

  return (
    <motion.section id="wlop-art" className="section wlop-entry-section">
      <SectionHeading
        eyebrow="WLOP Art Collection"
        title="WLOP艺术集"
        text="从 WLOP 收藏中随机抽取 50 张作品，进入后以可拖动的循环画展浏览。"
        icon={<Images size={16} />}
      />
      <button className="wlop-entry-card" type="button" onClick={openCollection}>
        <span>
          <strong>进入 WLOP艺术集</strong>
          <small>{photos.length} 张作品 / 按年份入库 / 每年随机加载 50 张</small>
        </span>
        <GalleryHorizontal size={28} />
      </button>
      {createPortal(
        <AnimatePresence>
          {isPreparing ? <PageLoader pageLabel="WLOP Art Collection" /> : null}
          {isOpen ? (
            <motion.div
              className="wlop-art-overlay"
              initial={{ opacity: 0, scale: 1.02, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="wlop-art-toolbar">
                <div>
                  <strong>WLOP艺术集</strong>
                  <span>{activeYear} / {Math.min(SAMPLE_SIZE, activePhotos.length)} 张作品循环出现</span>
                </div>
                <div className="wlop-year-tabs" aria-label="WLOP 年份筛选">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={year === activeYear ? 'active' : ''}
                      onClick={() => setActiveYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                <button className="wlop-art-close" type="button" onClick={() => setIsOpen(false)} aria-label="关闭 WLOP 艺术集">
                  <X size={22} />
                </button>
              </div>
              <div
                ref={stageRef}
                className="wlop-art-stage"
                onScroll={wrapScroll}
                onPointerDown={(event) => {
                  const stage = event.currentTarget
                  const piece = (event.target as HTMLElement).closest<HTMLElement>('.wlop-art-piece')
                  const photo = piece?.dataset.photoId ? tiles.find((tile) => tile.id === piece.dataset.photoId) || null : null
                  dragState.current = {
                    x: event.clientX,
                    y: event.clientY,
                    left: stage.scrollLeft,
                    top: stage.scrollTop,
                    moved: false,
                    startedAt: window.performance.now(),
                    photo,
                  }
                  stage.setPointerCapture(event.pointerId)
                  stage.classList.add('dragging')
                }}
                onPointerMove={(event) => {
                  const drag = dragState.current
                  if (!drag) return
                  const stage = event.currentTarget
                  const deltaX = event.clientX - drag.x
                  const deltaY = event.clientY - drag.y
                  if (Math.hypot(deltaX, deltaY) > 8) drag.moved = true
                  stage.scrollLeft = drag.left - deltaX
                  stage.scrollTop = drag.top - deltaY
                }}
                onPointerUp={(event) => {
                  const drag = dragState.current
                  const pressDuration = drag ? window.performance.now() - drag.startedAt : 0
                  if (drag?.photo && !drag.moved && pressDuration < 280) {
                    setSelectedPhoto(drag.photo)
                  }
                  dragState.current = null
                  event.currentTarget.classList.remove('dragging')
                }}
                onPointerCancel={(event) => {
                  dragState.current = null
                  event.currentTarget.classList.remove('dragging')
                }}
              >
                <div
                  className="wlop-art-plane"
                  style={{
                    width: SEGMENT_PITCH_X * 3 + PIECE_WIDTH,
                    height: segmentPitchY * 3 + 640,
                  }}
                >
                  {segments.map((segment) => (
                    <div
                      key={segment.key}
                      ref={segment.column === 0 && segment.row === 0 ? centerSegmentRef : undefined}
                      className="wlop-art-segment"
                      style={{
                        left: segment.x,
                        top: segment.y,
                        width: SEGMENT_WIDTH,
                        '--wlop-column-count': COLUMN_COUNT,
                        '--wlop-piece-gap': `${PIECE_GAP}px`,
                      } as React.CSSProperties}
                    >
                      {tiles.map((tile) => (
                        <motion.button
                          key={`${segment.key}:${tile.id}`}
                          type="button"
                          className="wlop-art-piece"
                          data-photo-id={tile.id}
                          onClick={(event) => event.preventDefault()}
                          whileHover={{ scale: 1.025, zIndex: 4 }}
                        >
                          <img src={tile.src} alt={tile.title} loading="lazy" draggable={false} onLoad={measureSegment} />
                          <span>
                            <Maximize2 size={14} />
                            {tile.title}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <AnimatePresence>
                {selectedPhoto ? (
                  <motion.div
                    className="wlop-art-preview"
                    role="dialog"
                    aria-modal="true"
                    aria-label={selectedPhoto.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedPhoto(null)}
                  >
                    <button type="button" onClick={() => setSelectedPhoto(null)} aria-label="关闭预览">
                      <X size={22} />
                    </button>
                    <img src={selectedPhoto.src} alt={selectedPhoto.title} onClick={(event) => event.stopPropagation()} />
                    <div onClick={(event) => event.stopPropagation()}>
                      <strong>{selectedPhoto.title}</strong>
                      <span>{selectedPhoto.location}</span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </motion.section>
  )
}
