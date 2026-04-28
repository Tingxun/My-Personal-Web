import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

const footerWord = 'MYWEB'
const sliceCount = 14
const fragmentCount = 10
const sliceHeight = 100 / sliceCount
const fragmentWidth = 100 / fragmentCount
const idleStrength = 0.36

type DistortionState = {
  x: number
  y: number
  xPx: number
  yPx: number
  strength: number
  velocityX: number
  velocityY: number
}

export function DistortionFooter() {
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0 })
  const wordRef = useRef<HTMLDivElement | null>(null)
  const [distortion, setDistortion] = useState<DistortionState>({
    x: 50,
    y: 50,
    xPx: 0,
    yPx: 0,
    strength: 0,
    velocityX: 0,
    velocityY: 0,
  })

  const getWordPointerPosition = (event: PointerEvent<HTMLDivElement>) => {
    const rect = wordRef.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect()
    const xPx = Math.min(rect.width, Math.max(0, event.clientX - rect.left))
    const yPx = Math.min(rect.height, Math.max(0, event.clientY - rect.top))

    return {
      x: (xPx / rect.width) * 100,
      y: (yPx / rect.height) * 100,
      xPx,
      yPx,
    }
  }

  const primePointer = (event: PointerEvent<HTMLDivElement>) => {
    const { x, y, xPx, yPx } = getWordPointerPosition(event)

    lastPointerRef.current = { x: event.clientX, y: event.clientY, time: performance.now() }
    setDistortion((current) => ({
      ...current,
      x,
      y,
      xPx,
      yPx,
      strength: idleStrength,
      velocityX: 0,
      velocityY: 0,
    }))
  }

  const updateDistortion = (event: PointerEvent<HTMLDivElement>) => {
    const { x, y, xPx, yPx } = getWordPointerPosition(event)
    const lastPointer = lastPointerRef.current
    const now = performance.now()
    const elapsed = Math.max(16, now - lastPointer.time)
    const dx = event.clientX - lastPointer.x
    const dy = event.clientY - lastPointer.y
    const speed = lastPointer.time ? Math.min(1.65, Math.hypot(dx, dy) / elapsed) : 0
    const velocityX = Math.max(-1.7, Math.min(1.7, dx / elapsed))
    const velocityY = Math.max(-1.7, Math.min(1.7, dy / elapsed))
    const strength = Math.max(idleStrength, Math.min(1, speed * 1.38))

    lastPointerRef.current = { x: event.clientX, y: event.clientY, time: now }
    setDistortion((current) => ({
      x: lerp(current.x, x, 0.34),
      y: lerp(current.y, y, 0.34),
      xPx: lerp(current.xPx, xPx, 0.34),
      yPx: lerp(current.yPx, yPx, 0.34),
      strength: lerp(current.strength, strength, 0.42),
      velocityX: lerp(current.velocityX, velocityX, 0.4),
      velocityY: lerp(current.velocityY, velocityY, 0.4),
    }))
  }

  return (
    <footer className="site-footer">
      <div
        className={distortion.strength > 0 ? 'distortion-footer distorting' : 'distortion-footer'}
        onPointerEnter={primePointer}
        onPointerMove={updateDistortion}
        onPointerLeave={() => setDistortion((current) => ({ ...current, strength: 0, velocityX: 0, velocityY: 0 }))}
        style={
          {
            '--distort-x': `${distortion.x}%`,
            '--distort-y': `${distortion.y}%`,
            '--distort-x-px': `${distortion.xPx}px`,
            '--distort-y-px': `${distortion.yPx}px`,
            '--distort-strength': distortion.strength,
            '--distort-opacity': distortion.strength > 0 ? 1 : 0,
          } as CSSProperties
        }
      >
        <span className="distortion-label">PERSONAL GEOMETRIC SPACE</span>
        <div ref={wordRef} className="distortion-word" aria-label={footerWord}>
          <strong>{footerWord}</strong>
          {Array.from({ length: sliceCount * fragmentCount }, (_, fragmentIndex) => {
            const sliceIndex = Math.floor(fragmentIndex / fragmentCount)
            const columnIndex = fragmentIndex % fragmentCount
            const falloff = getFragmentFalloff(sliceIndex, columnIndex, distortion)

            return (
              <i
                key={fragmentIndex}
                aria-hidden="true"
                data-text={footerWord}
                style={
                  {
                    '--slice-index': sliceIndex,
                    '--fragment-index': columnIndex,
                    '--slice-top': `${sliceIndex * sliceHeight}%`,
                    '--slice-bottom': `${100 - (sliceIndex + 1) * sliceHeight}%`,
                    '--fragment-left': `${columnIndex * fragmentWidth}%`,
                    '--fragment-right': `${100 - (columnIndex + 1) * fragmentWidth}%`,
                    '--fragment-opacity': falloff > 0.04 ? 1 : 0,
                    '--slice-shift': `${getSliceShift(sliceIndex, columnIndex, distortion, falloff)}px`,
                    '--slice-lift': `${getSliceLift(sliceIndex, columnIndex, distortion, falloff)}px`,
                    '--slice-skew': `${getSliceSkew(sliceIndex, columnIndex, distortion, falloff)}deg`,
                  } as CSSProperties
                }
              />
            )
          })}
        </div>
      </div>
      <p>Built from local memories, games, music, and code. Ready for the next layer.</p>
    </footer>
  )
}

function getFragmentFalloff(sliceIndex: number, columnIndex: number, distortion: DistortionState) {
  const centerX = (columnIndex + 0.5) * fragmentWidth
  const centerY = (sliceIndex + 0.5) * sliceHeight
  const normalizedX = Math.abs(centerX - distortion.x) / 25
  const normalizedY = Math.abs(centerY - distortion.y) / 34
  const distance = Math.hypot(normalizedX, normalizedY)

  return Math.pow(Math.max(0, 1 - distance), 1.35)
}

function getSliceShift(sliceIndex: number, columnIndex: number, distortion: DistortionState, falloff: number) {
  const alternating = (sliceIndex + columnIndex) % 2 === 0 ? 1 : -1
  const wave = Math.sin(sliceIndex * 1.7 + columnIndex * 0.9 + distortion.x * 0.13) * 20
  const velocityPush = distortion.velocityX * 118

  return (velocityPush + wave * alternating) * falloff * distortion.strength
}

function getSliceLift(sliceIndex: number, columnIndex: number, distortion: DistortionState, falloff: number) {
  const alternating = (sliceIndex + columnIndex) % 3 === 0 ? -1 : 1

  return (distortion.velocityY * 44 + alternating * 9) * falloff * distortion.strength
}

function getSliceSkew(sliceIndex: number, columnIndex: number, distortion: DistortionState, falloff: number) {
  const alternating = (sliceIndex + columnIndex) % 2 === 0 ? -1 : 1

  return alternating * falloff * distortion.strength * 7
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}
