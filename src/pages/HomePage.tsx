import { motion } from 'framer-motion'
import { Code2, Gamepad2, Grid3X3, Music2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { InteractiveCard } from '../components/InteractiveCard'
import { SectionHeading } from '../components/SectionHeading'
import { CreativeSignalSection } from '../features/CreativeSignalSection'
import { TactilePlayground } from '../features/TactilePlayground'
import { pageMotion } from '../constants'
import type { PageId } from '../types'

const idleMetaballOffset = { x: 0, y: 0, angle: 0, strength: 0, active: false, returning: false }

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const smoothStep = (edgeStart: number, edgeEnd: number, value: number) => {
  const progress = clamp((value - edgeStart) / (edgeEnd - edgeStart))
  return progress * progress * (3 - 2 * progress)
}

export function HomePage({ goToPage }: { goToPage: (page: PageId) => void }) {
  const orbitCoreRef = useRef<HTMLDivElement | null>(null)
  const metaballFrameRef = useRef(0)
  const metaballPointerRef = useRef<{ x: number; y: number } | null>(null)
  const metaballReturnTimerRef = useRef(0)
  const [metaballOffset, setMetaballOffset] = useState(idleMetaballOffset)

  useEffect(() => {
    return () => {
      if (metaballFrameRef.current) window.cancelAnimationFrame(metaballFrameRef.current)
      if (metaballReturnTimerRef.current) window.clearTimeout(metaballReturnTimerRef.current)
    }
  }, [])

  const releaseMetaball = () => {
    metaballPointerRef.current = null
    if (metaballFrameRef.current) {
      window.cancelAnimationFrame(metaballFrameRef.current)
      metaballFrameRef.current = 0
    }
    if (metaballReturnTimerRef.current) window.clearTimeout(metaballReturnTimerRef.current)

    setMetaballOffset((current) =>
      current.active
        ? {
            ...current,
            x: 0,
            y: 0,
            strength: 0,
            active: true,
            returning: true,
          }
        : current,
    )

    metaballReturnTimerRef.current = window.setTimeout(() => {
      setMetaballOffset(idleMetaballOffset)
      metaballReturnTimerRef.current = 0
    }, 620)
  }

  const syncMetaball = () => {
    metaballFrameRef.current = 0
    const core = orbitCoreRef.current
    const pointer = metaballPointerRef.current
    if (!core || !pointer) return

    const rect = core.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = pointer.x - centerX
    const dy = pointer.y - centerY
    const distance = Math.hypot(dx, dy) || 1
    const radius = rect.width / 2
    const attractionRange = radius * 2.32
    const angle = Math.atan2(dy, dx)

    if (distance > attractionRange) {
      releaseMetaball()
      return
    }

    const distanceRatio = clamp(distance / attractionRange)
    const strength = Math.max(0.18, smoothStep(0.02, 0.82, distanceRatio))
    const visualMainRadius = radius * 1.35
    const pullProgress = smoothStep(0.02, 0.72, distanceRatio)
    const pullDistance = visualMainRadius * (0.8 + pullProgress * 0.2)

    setMetaballOffset({
      x: Math.cos(angle) * pullDistance,
      y: Math.sin(angle) * pullDistance,
      angle,
      strength,
      active: true,
      returning: false,
    })
  }

  const updateMetaball = (event: PointerEvent<HTMLDivElement>) => {
    if (metaballReturnTimerRef.current) {
      window.clearTimeout(metaballReturnTimerRef.current)
      metaballReturnTimerRef.current = 0
    }
    metaballPointerRef.current = { x: event.clientX, y: event.clientY }

    if (metaballFrameRef.current) return
    metaballFrameRef.current = window.requestAnimationFrame(syncMetaball)
  }

  const metaballDistance = Math.hypot(metaballOffset.x, metaballOffset.y)

  return (
    <motion.div key="home" {...pageMotion}>
      <section className="hero-section">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="eyebrow">
            <Sparkles size={16} />
            Geometry / Memory / Code
          </span>
          <h1>把生活折叠进一个会呼吸的空间</h1>
          <p>
            现在拆成了可切换页面：入口总览负责第一眼的几何叙事，记忆馆承载音乐、照片和游戏，创作工坊展示项目和技能。
          </p>
          <div className="hero-actions">
            <motion.button type="button" onClick={() => goToPage('memories')} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}>
              Enter Memories
            </motion.button>
            <motion.button type="button" onClick={() => goToPage('lab')} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}>
              <Code2 size={18} />
              Open Lab
            </motion.button>
          </div>
        </motion.div>
        <motion.div
          className="hero-orbit"
          onPointerMove={updateMetaball}
          onPointerLeave={releaseMetaball}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <motion.div
            ref={orbitCoreRef}
            className={metaballOffset.active ? 'orbit-core metaball-core active' : 'orbit-core metaball-core'}
            style={
              {
                '--metaball-x': `${metaballOffset.x}px`,
                '--metaball-y': `${metaballOffset.y}px`,
                '--metaball-angle': `${metaballOffset.angle}rad`,
                '--metaball-strength': metaballOffset.strength,
                '--metaball-glow': 0.16 + metaballOffset.strength * 0.26,
                '--metaball-halo': 0.46 + metaballOffset.strength * 0.28,
                '--metaball-core-scale': 0.99 + metaballOffset.strength * 0.018,
                '--metaball-bridge-width': `${24 + metaballDistance * 0.54}px`,
                '--metaball-bridge-height': `${24 + metaballOffset.strength * 24}px`,
                '--metaball-bridge-opacity': metaballOffset.strength * 0.96,
                '--metaball-bridge-x': `${Math.max(42, metaballDistance * 0.5)}px`,
                '--metaball-bridge-scale': 0.18 + metaballOffset.strength * 0.82,
                '--metaball-child-size': `${58 + metaballOffset.strength * 36}px`,
                '--metaball-child-mask-x': `${330 + metaballOffset.x}px`,
                '--metaball-child-mask-y': `${73 + metaballOffset.y}px`,
                '--metaball-child-mask-radius': `${72 + metaballOffset.strength * 72}px`,
                '--metaball-child-glow': 0.16 + metaballOffset.strength * 0.44,
                '--metaball-child-opacity': metaballOffset.active ? 0.26 + metaballOffset.strength * 0.7 : 0,
                '--metaball-child-scale': metaballOffset.active ? 0.84 + metaballOffset.strength * 0.28 : 0.24,
                '--metaball-ripple-opacity': metaballOffset.strength * 0.58,
                '--metaball-ripple-start': metaballOffset.strength * 0.54,
              } as CSSProperties
            }
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 240, damping: 14 }}
          >
            <svg className="metaball-filter-svg" aria-hidden="true" focusable="false">
              <filter id="orbit-goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </svg>
            <div className="metaball-liquid" aria-hidden="true">
              <i className="metaball-main" />
              <i className="metaball-bridge" />
              <i className="metaball-child" />
            </div>
            <i className="metaball-ripple one" aria-hidden="true" />
            <i className="metaball-ripple two" aria-hidden="true" />
            <div className="metaball-type" aria-label="Interaction Design">
              <small className="type-layer type-outside" aria-hidden="true">
                <b>INTERACTION</b>
                <b>DESIGN</b>
              </small>
              <small className="type-layer type-inside" aria-hidden="true">
                <b>INTERACTION</b>
                <b>DESIGN</b>
              </small>
            </div>
          </motion.div>
          <InteractiveCard className="orbit-card music static">
            <Music2 size={20} />
            API + Local fallback
          </InteractiveCard>
          <InteractiveCard className="orbit-card games">
            <Gamepad2 size={20} />
            Steam library
          </InteractiveCard>
          <InteractiveCard className="orbit-card code">
            <Code2 size={20} />
            Project matrix
          </InteractiveCard>
        </motion.div>
      </section>

      <CreativeSignalSection goToPage={goToPage} />
      <TactilePlayground />

      <section className="section portal-section">
        <SectionHeading
          eyebrow="Route Split"
          title="内容不再挤在一条长卷轴"
          text="三个入口像空间舱门一样切换，切换时会经过几何加载动画，让浏览路径更有仪式感。"
          icon={<Grid3X3 size={16} />}
        />
        <div className="portal-grid">
          <InteractiveCard className="portal-card memory" onClick={() => goToPage('memories')}>
            <Music2 size={28} />
            <strong>记忆馆</strong>
            <span>音乐播放器 / 照片分类 / 游戏截图</span>
          </InteractiveCard>
          <InteractiveCard className="portal-card lab" onClick={() => goToPage('lab')}>
            <Code2 size={28} />
            <strong>创作工坊</strong>
            <span>技能矩阵 / 重点项目 / 编程路径</span>
          </InteractiveCard>
        </div>
      </section>
    </motion.div>
  )
}
