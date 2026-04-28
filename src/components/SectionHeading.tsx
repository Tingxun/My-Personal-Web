import type { ReactNode } from 'react'

export function SectionHeading({
  eyebrow,
  title,
  text,
  icon,
}: {
  eyebrow: string
  title: string
  text: string
  icon: ReactNode
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">
        {icon}
        {eyebrow}
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}
