import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

export function GeometryField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const pointer = { x: 0, y: 0, active: false }
    const points = Array.from({ length: reduceMotion ? 30 : 76 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0011,
      vy: (Math.random() - 0.5) * 0.0011,
      r: Math.random() * 2.6 + 1,
      pulse: Math.random() * Math.PI * 2,
    }))
    let width = 0
    let height = 0
    let frame = 0
    let canvasLeft = 0
    let canvasTop = 0
    let tick = 0

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvasLeft = rect.left
      canvasTop = rect.top
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const drawPolygon = (x: number, y: number, radius: number, sides: number, rotation: number, color: string) => {
      context.beginPath()
      for (let side = 0; side < sides; side += 1) {
        const angle = rotation + (Math.PI * 2 * side) / sides
        const px = x + Math.cos(angle) * radius
        const py = y + Math.sin(angle) * radius
        if (side === 0) context.moveTo(px, py)
        else context.lineTo(px, py)
      }
      context.closePath()
      context.fillStyle = color
      context.fill()
    }

    const draw = () => {
      tick += 0.012
      context.clearRect(0, 0, width, height)
      const gradient = context.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, 'rgba(109, 232, 255, 0.2)')
      gradient.addColorStop(0.5, 'rgba(255, 91, 180, 0.13)')
      gradient.addColorStop(1, 'rgba(157, 255, 119, 0.16)')
      context.strokeStyle = gradient
      context.lineWidth = 1

      points.forEach((point, index) => {
        point.x += point.vx
        point.y += point.vy
        if (point.x < -0.02 || point.x > 1.02) point.vx *= -1
        if (point.y < -0.02 || point.y > 1.02) point.vy *= -1

        const x = point.x * width
        const y = point.y * height
        const color = index % 3 === 0 ? '#6de8ff' : index % 3 === 1 ? '#ff5bb4' : '#9dff77'
        drawPolygon(x, y, point.r + Math.sin(tick + point.pulse) * 1.1, 3 + (index % 3), tick + index, color)

        for (let next = index + 1; next < points.length; next += 1) {
          const other = points[next]
          const dx = x - other.x * width
          const dy = y - other.y * height
          const distance = Math.hypot(dx, dy)
          if (distance < 132) {
            context.globalAlpha = (1 - distance / 132) * 0.82
            context.beginPath()
            context.moveTo(x, y)
            context.lineTo(other.x * width, other.y * height)
            context.stroke()
          }
        }

        if (pointer.active) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance < 260) {
            context.globalAlpha = 0.52
            context.beginPath()
            context.moveTo(x, y)
            context.lineTo(pointer.x, pointer.y)
            context.stroke()
          }
        }
        context.globalAlpha = 1
      })

      if (!reduceMotion) frame = requestAnimationFrame(draw)
    }

    const updatePointer = (event: PointerEvent) => {
      pointer.x = event.clientX - canvasLeft
      pointer.y = event.clientY - canvasTop
      pointer.active = true
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', updatePointer, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', updatePointer)
    }
  }, [reduceMotion])

  return <canvas ref={canvasRef} className="geometry-field" aria-hidden="true" />
}
