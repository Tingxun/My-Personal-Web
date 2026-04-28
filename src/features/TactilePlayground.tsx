import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { sectionMotion } from '../constants'

const tactileTags = ['Music', 'Steam', 'WLOP', 'HUST', 'React', 'Motion']

export function TactilePlayground() {
  const deckRef = useRef<HTMLDivElement | null>(null)

  return (
    <motion.section className="section tactile-playground" {...sectionMotion}>
      <div className="tactile-copy">
        <span className="eyebrow">
          <Sparkles size={16} />
          Tactile Layer
        </span>
        <h2>触感实验台</h2>
        <p>把首页里偏概念的几何感变成可以直接拨动的界面物件，让个人页面多一点“正在运行”的现场感。</p>
      </div>
      <div className="tactile-grid">
        <div ref={deckRef} className="drag-deck shard-panel" aria-label="可拖拽标签组">
          {tactileTags.map((tag, index) => (
            <motion.button
              key={tag}
              type="button"
              className="drag-token"
              drag
              dragConstraints={deckRef}
              dragElastic={0}
              dragMomentum={false}
              whileDrag={{ zIndex: 5 }}
              whileHover={{ y: -4 }}
              style={{
                left: `${10 + (index % 3) * 27}%`,
                top: `${18 + Math.floor(index / 3) * 34}%`,
              }}
            >
              {tag}
            </motion.button>
          ))}
          <div className="deck-axis" aria-hidden="true" />
        </div>
        <div className="metaball-stage shard-panel" aria-label="融球动态场">
          <div className="metaball-filter">
            <motion.i className="blob cyan" animate={{ x: [0, 78, -22, 0], y: [0, -28, 62, 0] }} transition={{ duration: 7, repeat: Infinity }} />
            <motion.i className="blob pink" animate={{ x: [0, -72, 36, 0], y: [0, 56, -26, 0] }} transition={{ duration: 6.4, repeat: Infinity }} />
            <motion.i className="blob green" animate={{ x: [0, 42, -68, 0], y: [0, 70, -34, 0] }} transition={{ duration: 8, repeat: Infinity }} />
            <motion.i className="blob amber" animate={{ x: [0, -34, 74, 0], y: [0, -62, 30, 0] }} transition={{ duration: 7.3, repeat: Infinity }} />
          </div>
          <div className="metaball-readout">
            <strong>Live Surface</strong>
            <span>Geometry / Archive / Code</span>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
