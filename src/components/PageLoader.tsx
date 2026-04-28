import { motion } from 'framer-motion'

export function PageLoader({ pageLabel }: { pageLabel: string }) {
  return (
    <motion.div
      className="page-loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="loader-mark">
        <i />
        <i />
        <i />
      </div>
      <span>Loading {pageLabel}</span>
    </motion.div>
  )
}
