import { motion } from 'framer-motion'
import { Code2 } from 'lucide-react'
import { CodeSection } from '../features/CodeSection'
import { pageMotion } from '../constants'

export function LabPage() {
  return (
    <motion.div key="lab" {...pageMotion}>
      <section className="page-hero section">
        <span className="eyebrow">
          <Code2 size={16} />
          Project Lab
        </span>
        <h1>创作工坊</h1>
        <p>把本地项目、技能栈和未来作品集入口拆成独立页面，后续可以继续接 GitHub 或项目详情页。</p>
      </section>
      <CodeSection />
    </motion.div>
  )
}
