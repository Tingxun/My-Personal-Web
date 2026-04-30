import { motion } from 'framer-motion'
import { Code2 } from 'lucide-react'
import type { ProjectItem, SkillItem } from '../data'
import { sectionMotion } from '../constants'
import { SectionHeading } from '../components/SectionHeading'

export function CodeSection({ projects, skills }: { projects: ProjectItem[]; skills: SkillItem[] }) {
  return (
    <motion.section id="code" className="section" {...sectionMotion}>
      <SectionHeading
        eyebrow="Build Matrix"
        title="编程技能坐标"
        text="将散落在 Coding 与项目文件夹中的作品整理成技能矩阵、精选项目和可继续补充的项目档案。"
        icon={<Code2 size={16} />}
      />
      <div className="code-layout">
        <motion.div className="skill-panel shard-panel" whileHover={{ rotate: -0.5, scale: 1.01 }}>
          {skills.map((skill) => (
            <div key={skill.label} className="skill-row">
              <div>
                <strong>{skill.label}</strong>
                <span>{skill.detail}</span>
              </div>
              <div className="skill-meter">
                <motion.i initial={{ width: 0 }} whileInView={{ width: `${skill.value}%` }} viewport={{ once: true }} />
              </div>
            </div>
          ))}
        </motion.div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <motion.article
              key={project.id}
              className={project.featured ? 'project-card featured' : 'project-card'}
              whileHover={{ y: -9, rotate: index % 2 ? 1.1 : -1.1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            >
              <span>{project.type}</span>
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
              <div className="chips">
                {project.techStack.map((item) => (
                  <small key={item}>{item}</small>
                ))}
              </div>
              <code>{project.path}</code>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
