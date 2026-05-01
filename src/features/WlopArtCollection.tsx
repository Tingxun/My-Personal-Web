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
const PIECE_CAPTION_HEIGHT = 42
const SEGMENT_WIDTH = COLUMN_COUNT * PIECE_WIDTH + (COLUMN_COUNT - 1) * PIECE_GAP
const SEGMENT_PITCH_X = SEGMENT_WIDTH + PIECE_GAP
const DEFAULT_SEGMENT_HEIGHT = 3000

type PhotoSize = {
  width: number
  height: number
}

type PositionedTile = {
  tile: PhotoItem
  x: number
  y: number
  size: PhotoSize
}

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

const preloadPhoto = (src: string) =>
  new Promise<PhotoSize | null>((resolve) => {
    const image = new Image()
    image.onload = () => {
      resolve(image.naturalWidth && image.naturalHeight ? { width: image.naturalWidth, height: image.naturalHeight } : null)
    }
    image.onerror = () => resolve(null)
    image.src = src
  })

const preloadTiles = async (tiles: PhotoItem[]) => {
  const entries = await Promise.all(
    tiles.map(async (tile) => {
      const size = await preloadPhoto(tile.src)
      return [tile.id, size] as const
    }),
  )

  return entries.reduce<Record<string, PhotoSize>>((sizes, [id, size]) => {
    if (size) sizes[id] = size
    return sizes
  }, {})
}

const waitForImage = (image: HTMLImageElement) => {
  if (image.complete) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const finish = () => resolve()
    image.addEventListener('load', finish, { once: true })
    image.addEventListener('error', finish, { once: true })
  })
}

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration))
const waitForFrame = () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))

export function WlopArtCollection({ photos }: { photos: PhotoItem[] }) {
  const [isPreparing, setIsPreparing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const years = useMemo(() => [...new Set(photos.map((photo) => photo.date))].sort(), [photos])
  const [activeYear, setActiveYear] = useState(() => years[0] || '2022')
  const [pendingYear, setPendingYear] = useState<string | null>(null)
  const [isYearSwitching, setIsYearSwitching] = useState(false)
  const [sampleSeed, setSampleSeed] = useState(() => Date.now())
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [photoSizes, setPhotoSizes] = useState<Record<string, PhotoSize>>({})
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
  const openToken = useRef(0)
  const yearSwitchToken = useRef(0)
  const activePhotos = useMemo(() => photos.filter((photo) => photo.date === activeYear), [activeYear, photos])
  const tiles = useMemo(() => samplePhotos(activePhotos, sampleSeed), [activePhotos, sampleSeed])
  const { positionedTiles, segmentHeight } = useMemo(() => {
    const columnHeights = Array.from({ length: COLUMN_COUNT }, () => 0)
    const fallbackSize = { width: 16, height: 9 }

    const positionedTiles = tiles.map<PositionedTile>((tile) => {
      const size = photoSizes[tile.id] || fallbackSize
      const column = columnHeights.indexOf(Math.min(...columnHeights))
      const imageHeight = Math.round((PIECE_WIDTH * size.height) / size.width)
      const cardHeight = imageHeight + PIECE_CAPTION_HEIGHT
      const positionedTile = {
        tile,
        x: column * (PIECE_WIDTH + PIECE_GAP),
        y: columnHeights[column],
        size,
      }

      columnHeights[column] += cardHeight + PIECE_GAP
      return positionedTile
    })

    const nextHeight = Math.max(...columnHeights, DEFAULT_SEGMENT_HEIGHT) - PIECE_GAP
    return {
      positionedTiles,
      segmentHeight: Math.max(1200, Math.ceil(nextHeight)),
    }
  }, [photoSizes, tiles])
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
      openToken.current += 1
    }
  }, [])

  useEffect(() => {
    if (!years.length || years.includes(activeYear)) return
    setActiveYear(years[0])
  }, [activeYear, years])

  useEffect(() => {
    setSelectedPhoto(null)
    requestAnimationFrame(() => {
      const stage = stageRef.current
      if (!stage) return
      stage.scrollLeft = SEGMENT_PITCH_X
      stage.scrollTop = segmentPitchY
    })
  }, [activeYear, segmentPitchY])

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

  const rememberPhotoSize = (photoId: string, image: HTMLImageElement) => {
    if (!image.naturalWidth || !image.naturalHeight) return

    setPhotoSizes((current) => {
      const existing = current[photoId]
      if (existing?.width === image.naturalWidth && existing.height === image.naturalHeight) return current

      return {
        ...current,
        [photoId]: {
          width: image.naturalWidth,
          height: image.naturalHeight,
        },
      }
    })
  }

  const wrapScroll = () => {
    const stage = stageRef.current
    if (!stage) return

    if (stage.scrollLeft < SEGMENT_PITCH_X * 0.42) stage.scrollLeft += SEGMENT_PITCH_X
    if (stage.scrollLeft > SEGMENT_PITCH_X * 1.58) stage.scrollLeft -= SEGMENT_PITCH_X
    if (stage.scrollTop < segmentPitchY * 0.42) stage.scrollTop += segmentPitchY
    if (stage.scrollTop > segmentPitchY * 1.58) stage.scrollTop -= segmentPitchY
  }

  const openCollection = async () => {
    if (isPreparing) return

    const token = openToken.current + 1
    const nextSeed = Date.now()
    const nextTiles = samplePhotos(activePhotos, nextSeed)

    openToken.current = token
    setSelectedPhoto(null)
    setSampleSeed(nextSeed)
    setIsPreparing(true)

    const [nextSizes] = await Promise.all([preloadTiles(nextTiles), wait(520)])

    if (openToken.current !== token) return

    setPhotoSizes((current) => ({ ...current, ...nextSizes }))
    setIsOpen(true)
    setIsPreparing(false)
  }

  const waitForCenterSegmentImages = async (expectedTiles: PhotoItem[]) => {
    await waitForFrame()
    await waitForFrame()

    const segment = centerSegmentRef.current
    if (!segment) return

    const expectedIds = new Set(expectedTiles.map((tile) => tile.id))
    const images = Array.from(segment.querySelectorAll<HTMLImageElement>('.wlop-art-piece img')).filter((image) => {
      const piece = image.closest<HTMLElement>('.wlop-art-piece')
      return piece?.dataset.photoId ? expectedIds.has(piece.dataset.photoId) : false
    })

    await Promise.race([Promise.all(images.map(waitForImage)), wait(8000)])
  }

  const switchYear = async (year: string) => {
    if (year === activeYear || isYearSwitching) return

    const token = yearSwitchToken.current + 1
    const nextSeed = Date.now()
    const nextPhotos = photos.filter((photo) => photo.date === year)
    const nextTiles = samplePhotos(nextPhotos, nextSeed)

    yearSwitchToken.current = token
    setPendingYear(year)
    setIsYearSwitching(true)
    setSelectedPhoto(null)

    const [nextSizes] = await Promise.all([preloadTiles(nextTiles), wait(520)])

    if (yearSwitchToken.current !== token) return

    setPhotoSizes((current) => ({ ...current, ...nextSizes }))
    setActiveYear(year)
    setSampleSeed(nextSeed)

    requestAnimationFrame(() => {
      const stage = stageRef.current
      if (!stage) return
      stage.scrollLeft = SEGMENT_PITCH_X
      stage.scrollTop = segmentPitchY
    })

    await waitForCenterSegmentImages(nextTiles)
    await wait(180)

    if (yearSwitchToken.current !== token) return
    setIsYearSwitching(false)
    setPendingYear(null)
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
                      className={year === (pendingYear || activeYear) ? 'active' : ''}
                      disabled={isYearSwitching}
                      onClick={() => void switchYear(year)}
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
                      key={`${activeYear}:${sampleSeed}:${segment.key}`}
                      ref={segment.column === 0 && segment.row === 0 ? centerSegmentRef : undefined}
                      className="wlop-art-segment"
                      style={{
                        left: segment.x,
                        top: segment.y,
                        width: SEGMENT_WIDTH,
                        height: segmentHeight,
                      } as React.CSSProperties}
                    >
                      {positionedTiles.map(({ tile, x, y, size }) => {
                        return (
                          <motion.button
                            key={`${segment.key}:${tile.id}`}
                            type="button"
                            className="wlop-art-piece"
                            data-photo-id={tile.id}
                            onClick={(event) => event.preventDefault()}
                            style={{ left: x, top: y, width: PIECE_WIDTH }}
                            whileHover={{ scale: 1.025, zIndex: 4 }}
                          >
                            <img
                              src={tile.src}
                              alt={tile.title}
                              width={size.width}
                              height={size.height}
                              loading={isYearSwitching ? 'eager' : 'lazy'}
                              draggable={false}
                              style={{ aspectRatio: `${size.width} / ${size.height}` }}
                              onLoad={(event) => {
                                rememberPhotoSize(tile.id, event.currentTarget)
                              }}
                            />
                            <span>
                              <Maximize2 size={14} />
                              {tile.title}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <AnimatePresence>
                  {isYearSwitching ? (
                    <motion.div
                      className="wlop-year-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.98 }}
                        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <i />
                        <strong>{pendingYear}</strong>
                        <span>Loading WLOP collection</span>
                      </motion.div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
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
