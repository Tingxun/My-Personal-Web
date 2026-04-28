import { motion } from 'framer-motion'
import { Code2, Gamepad2, Grid3X3, Music2, Sparkles } from 'lucide-react'
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { InteractiveCard } from '../components/InteractiveCard'
import { SectionHeading } from '../components/SectionHeading'
import { CreativeSignalSection } from '../features/CreativeSignalSection'
import { TactilePlayground } from '../features/TactilePlayground'
import { pageMotion } from '../constants'
import type { PageId } from '../types'

export function HomePage({ goToPage }: { goToPage: (page: PageId) => void }) {
  const orbitCoreRef = useRef<HTMLDivElement | null>(null)
  const [metaballOffset, setMetaballOffset] = useState({ x: 0, y: 0, angle: 0, strength: 0, active: false })

  const resetMetaball = () => {
    setMetaballOffset({ x: 0, y: 0, angle: 0, strength: 0, active: false })
  }

  const updateMetaball = (event: PointerEvent<HTMLDivElement>) => {
    const core = orbitCoreRef.current
    if (!core) return

    const rect = core.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = event.clientX - centerX
    const dy = event.clientY - centerY
    const distance = Math.hypot(dx, dy) || 1
    const radius = rect.width / 2
    const innerBoundary = radius * 1.02
    const outerBoundary = radius * 1.9
    const innerStrength = Math.min(1, Math.max(0, (distance - innerBoundary) / (radius * 0.28)))
    const outerStrength = Math.min(1, Math.max(0, (outerBoundary - distance) / (outerBoundary - radius * 1.18)))
    const strength = Math.min(innerStrength, outerStrength)
    const angle = Math.atan2(dy, dx)

    if (strength <= 0) {
      resetMetaball()
      return
    }

    const orbitDistance = radius * (1.02 + strength * 0.42)

    setMetaballOffset({
      x: Math.cos(angle) * orbitDistance,
      y: Math.sin(angle) * orbitDistance,
      angle,
      strength,
      active: true,
    })
  }

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
          onPointerLeave={resetMetaball}
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
                '--metaball-bridge-width': `${24 + metaballOffset.strength * 78}px`,
                '--metaball-bridge-height': `${24 + metaballOffset.strength * 24}px`,
                '--metaball-bridge-opacity': metaballOffset.strength * 0.96,
                '--metaball-bridge-x': `${86 + metaballOffset.strength * 18}px`,
                '--metaball-bridge-scale': 0.18 + metaballOffset.strength * 0.82,
                '--metaball-child-size': `${42 + metaballOffset.strength * 52}px`,
                '--metaball-child-mask-x': `${110 + metaballOffset.x}px`,
                '--metaball-child-mask-y': `${75 + metaballOffset.y}px`,
                '--metaball-child-mask-radius': `${32 + metaballOffset.strength * 38}px`,
                '--metaball-child-glow': 0.16 + metaballOffset.strength * 0.44,
                '--metaball-child-opacity': metaballOffset.strength * 0.96,
                '--metaball-child-scale': 0.24 + metaballOffset.strength * 0.98,
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
          <InteractiveCard className="orbit-card music" onClick={() => goToPage('memories')}>
            <Music2 size={20} />
            API + Local fallback
          </InteractiveCard>
          <InteractiveCard className="orbit-card games" onClick={() => goToPage('memories')}>
            <Gamepad2 size={20} />
            Steam library
          </InteractiveCard>
          <InteractiveCard className="orbit-card code" onClick={() => goToPage('lab')}>
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
