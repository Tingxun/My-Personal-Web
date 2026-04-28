import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Disc3, Headphones, Layers3, Radio, Zap } from 'lucide-react'
import { sectionMotion } from '../constants'
import type { PageId } from '../types'

const signalCards = [
  { icon: <Headphones size={22} />, label: 'Audio', title: '不中断播放', text: '播放器脱离页面生命周期，音量和切页不再打断音乐。' },
  { icon: <Layers3 size={22} />, label: 'Archive', title: '照片与游戏分层', text: '图片墙、游戏舞台和项目矩阵保持清晰入口。' },
  { icon: <Zap size={22} />, label: 'Motion', title: '鼠标响应场', text: '背景、卡片和光标热点会跟随你的浏览节奏变化。' },
]

export function CreativeSignalSection({ goToPage }: { goToPage: (page: PageId) => void }) {
  const [activeSignal, setActiveSignal] = useState(0)

  return (
    <motion.section className="section creative-signal" {...sectionMotion}>
      <div className="kinetic-marquee" aria-hidden="true">
        <span>BE CURIOUS / KEEP BUILDING / STAY VISUAL / </span>
        <span>BE CURIOUS / KEEP BUILDING / STAY VISUAL / </span>
      </div>
      <div className="signal-layout">
        <div className="signal-copy">
          <span className="eyebrow">
            <Radio size={16} />
            Interaction Signal
          </span>
          <h2>
            把页面做得更像一块会回应你的
            <strong> 个人控制台</strong>
          </h2>
          <p>
            参考站点的大字冲击、荧光线条和滚动节奏被转成更适合这个项目的交互层：悬浮播放坞、响应式光标、动态模块预览。
          </p>
          <motion.button
            type="button"
            className="signal-action"
            onClick={() => goToPage(activeSignal === 1 ? 'memories' : 'lab')}
            whileHover={{ x: 8 }}
            whileTap={{ scale: 0.96 }}
          >
            Explore signal <ArrowRight size={18} />
          </motion.button>
        </div>
        <div className="signal-board shard-panel">
          <div className="signal-radar">
            <Disc3 size={40} />
            <i />
            <i />
            <i />
          </div>
          <div className="signal-card-stack">
            {signalCards.map((card, index) => (
              <motion.button
                key={card.label}
                type="button"
                className={activeSignal === index ? 'signal-card active' : 'signal-card'}
                onMouseEnter={() => setActiveSignal(index)}
                onFocus={() => setActiveSignal(index)}
                onClick={() => setActiveSignal(index)}
                animate={{
                  y: activeSignal === index ? -8 : 0,
                  opacity: activeSignal === index ? 1 : 0.72,
                }}
                whileHover={{ x: 8 }}
              >
                {card.icon}
                <span>{card.label}</span>
                <strong>{card.title}</strong>
                <small>{card.text}</small>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
