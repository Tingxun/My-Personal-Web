import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gamepad2 } from 'lucide-react'
import type { GameItem } from '../data'
import { sectionMotion } from '../constants'
import { SectionHeading } from '../components/SectionHeading'

export function GamesSection({ games }: { games: GameItem[] }) {
  const [activeGame, setActiveGame] = useState(games[0])
  const [screenshotIndex, setScreenshotIndex] = useState(0)

  useEffect(() => {
    setActiveGame(games[0])
  }, [games])

  useEffect(() => setScreenshotIndex(0), [activeGame])

  if (!activeGame) return null

  return (
    <motion.section id="games" className="section" {...sectionMotion}>
      <SectionHeading
        eyebrow="Play Memory"
        title="游戏轨迹台"
        text="从 Steam common 目录识别游戏库，并优先展示带截图的游戏，形成可继续扩展的游玩档案。"
        icon={<Gamepad2 size={16} />}
      />
      <div className="game-layout">
        <motion.div className="game-stage shard-panel" whileHover={{ scale: 1.01 }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={activeGame.screenshots[screenshotIndex]}
              src={activeGame.screenshots[screenshotIndex]}
              alt={`${activeGame.name} screenshot`}
              loading="lazy"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            />
          </AnimatePresence>
          <div className="game-stage-info">
            <span>Updated {activeGame.lastPlayedOrUpdated}</span>
            <h3>{activeGame.name}</h3>
          </div>
          <div className="shot-strip">
            {activeGame.screenshots.map((shot, index) => (
              <motion.button
                key={shot}
                type="button"
                className={index === screenshotIndex ? 'active' : ''}
                onClick={() => setScreenshotIndex(index)}
                whileHover={{ y: -5, rotate: -2 }}
                whileTap={{ scale: 0.92 }}
              >
                <img src={shot.replace('.webp', '-thumb.webp')} alt="" loading="lazy" />
              </motion.button>
            ))}
          </div>
        </motion.div>
        <div className="game-cards">
          {games.map((game) => (
            <motion.button
              key={game.id}
              type="button"
              className={game.id === activeGame.id ? 'game-card active' : 'game-card'}
              onClick={() => setActiveGame(game)}
              whileHover={{ x: -8, rotate: -1.2 }}
              whileTap={{ scale: 0.96 }}
            >
              <img src={game.cover} alt="" loading="lazy" />
              <span>
                <strong>{game.name}</strong>
                <small>{game.tags.join(' / ')}</small>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
