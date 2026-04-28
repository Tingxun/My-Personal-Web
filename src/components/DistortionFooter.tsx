import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

const footerWord = 'MYWEB'
const sliceCount = 22
const sliceHeight = 100 / sliceCount

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
    setDistortion({ x, y, xPx, yPx, strength: 0.72, velocityX: 0, velocityY: 0 })
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
    const strength = Math.max(0.72, Math.min(1.85, speed * 1.38))

    lastPointerRef.current = { x: event.clientX, y: event.clientY, time: now }
    setDistortion({ x, y, xPx, yPx, strength, velocityX, velocityY })
  }

  return (
    <footer className="site-footer">
      <div
        className="distortion-footer"
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
          {Array.from({ length: sliceCount }, (_, index) => (
            <i
              key={index}
              aria-hidden="true"
              data-text={footerWord}
              style={
                {
                  '--slice-index': index,
                  '--slice-top': `${index * sliceHeight}%`,
                  '--slice-bottom': `${100 - (index + 1) * sliceHeight}%`,
                  '--slice-shift': `${getSliceShift(index, distortion)}px`,
                  '--slice-lift': `${getSliceLift(index, distortion)}px`,
                  '--slice-skew': `${getSliceSkew(index, distortion)}deg`,
                } as CSSProperties
              }
            />
          ))}
          <em aria-hidden="true" />
        </div>
      </div>
      <p>Built from local memories, games, music, and code. Ready for the next layer.</p>
    </footer>
  )
}

function getSliceShift(index: number, distortion: DistortionState) {
  const centerY = (index + 0.5) * sliceHeight
  const yFalloff = Math.max(0, 1 - Math.abs(centerY - distortion.y) / 28)
  const alternating = index % 2 === 0 ? 1 : -1
  const wave = Math.sin(index * 1.7 + distortion.x * 0.13) * 20
  const velocityPush = distortion.velocityX * 118

  return (velocityPush + wave * alternating) * yFalloff * distortion.strength
}

function getSliceLift(index: number, distortion: DistortionState) {
  const centerY = (index + 0.5) * sliceHeight
  const yFalloff = Math.max(0, 1 - Math.abs(centerY - distortion.y) / 28)
  const alternating = index % 3 === 0 ? -1 : 1

  return (distortion.velocityY * 44 + alternating * 9) * yFalloff * distortion.strength
}

function getSliceSkew(index: number, distortion: DistortionState) {
  const centerY = (index + 0.5) * sliceHeight
  const yFalloff = Math.max(0, 1 - Math.abs(centerY - distortion.y) / 34)
  const alternating = index % 2 === 0 ? -1 : 1

  return alternating * yFalloff * distortion.strength * 7
}
