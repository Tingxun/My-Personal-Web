import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function InteractiveCard({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      type="button"
      className={`interactive-card ${className}`}
      onClick={onClick}
      whileHover={{ y: -8, rotate: -1.2, scale: 1.035 }}
      whileTap={{ scale: 0.96, rotate: 1.5 }}
      transition={{ type: 'spring', stiffness: 330, damping: 22 }}
    >
      {children}
    </motion.button>
  )
}
