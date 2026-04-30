import { motion } from 'framer-motion'
import { MessageSquareText, Send, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { pageMotion } from '../constants'

type GuestbookTone = 'idea' | 'like' | 'bug'

type GuestbookEntry = {
  id: string
  name: string
  message: string
  tone: GuestbookTone
  createdAt: string
}

const storageKey = 'myweb-guestbook-entries'

const toneOptions: Array<{ id: GuestbookTone; label: string; accent: string }> = [
  { id: 'idea', label: 'Idea', accent: 'cyan' },
  { id: 'like', label: 'Like', accent: 'green' },
  { id: 'bug', label: 'Bug', accent: 'pink' },
]

const seedEntries: GuestbookEntry[] = [
  {
    id: 'seed-1',
    name: 'Visitor',
    message: 'The geometry motion gives the archive a real sense of presence.',
    tone: 'like',
    createdAt: 'Now',
  },
  {
    id: 'seed-2',
    name: 'Builder',
    message: 'A project detail layer would make the lab even stronger.',
    tone: 'idea',
    createdAt: 'Next',
  },
]

export function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>(seedEntries)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState<GuestbookTone>('idea')
  const [activeEntry, setActiveEntry] = useState(seedEntries[0].id)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) setEntries(JSON.parse(stored) as GuestbookEntry[])
    } catch {
      setEntries(seedEntries)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(entries))
  }, [entries])

  const activeTone = useMemo(() => toneOptions.find((item) => item.id === tone) || toneOptions[0], [tone])
  const messageLength = message.trim().length
  const canSubmit = messageLength >= 6

  const submitEntry = () => {
    if (!canSubmit) return

    const nextEntry: GuestbookEntry = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Anonymous',
      message: message.trim(),
      tone,
      createdAt: new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(
        new Date(),
      ),
    }

    setEntries((current) => [nextEntry, ...current].slice(0, 12))
    setActiveEntry(nextEntry.id)
    setName('')
    setMessage('')
    setTone('idea')
  }

  return (
    <motion.div key="guestbook" {...pageMotion}>
      <section className="page-hero section guestbook-hero">
        <span className="eyebrow">
          <MessageSquareText size={16} />
          Guestbook
        </span>
        <h1>留言信号墙</h1>
        <p>把访客的反馈收进同一块动态表面：建议、喜欢、问题都会成为一枚可以被点亮的几何信号。</p>
      </section>

      <section className="section guestbook-section">
        <div className="guestbook-layout">
          <motion.form
            className="guestbook-panel shard-panel"
            onSubmit={(event) => {
              event.preventDefault()
              submitEntry()
            }}
            whileHover={{ rotate: -0.35 }}
          >
            <div className="guestbook-panel-head">
              <span>
                <Sparkles size={16} />
                New Signal
              </span>
              <strong>{messageLength}/240</strong>
            </div>

            <label className="guestbook-field">
              <span>Name</span>
              <div>
                <UserRound size={18} />
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} placeholder="Anonymous" />
              </div>
            </label>

            <div className="guestbook-tone-grid" aria-label="Feedback type">
              {toneOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tone === item.id ? `active ${item.accent}` : item.accent}
                  onClick={() => setTone(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="guestbook-field message">
              <span>Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 240))}
                placeholder="Leave a thought, signal, or bug report."
              />
            </label>

            <div className={`guestbook-preview ${activeTone.accent}`}>
              <span>{activeTone.label}</span>
              <p>{message.trim() || 'Your feedback will pulse here before it enters the wall.'}</p>
            </div>

            <button className="guestbook-submit" type="submit" disabled={!canSubmit}>
              Send signal
              <Send size={18} />
            </button>
          </motion.form>

          <div className="guestbook-wall" aria-label="Guestbook messages">
            <div className="guestbook-orbital" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            {entries.map((entry, index) => {
              const toneMeta = toneOptions.find((item) => item.id === entry.tone) || toneOptions[0]

              return (
                <motion.article
                  key={entry.id}
                  className={activeEntry === entry.id ? `guestbook-entry active ${toneMeta.accent}` : `guestbook-entry ${toneMeta.accent}`}
                  onMouseEnter={() => setActiveEntry(entry.id)}
                  onFocus={() => setActiveEntry(entry.id)}
                  tabIndex={0}
                  initial={{ opacity: 0, y: 22, rotate: index % 2 ? 1 : -1 }}
                  animate={{ opacity: 1, y: 0, rotate: activeEntry === entry.id ? 0 : index % 2 ? 0.6 : -0.6 }}
                  whileHover={{ y: -10, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <span>{toneMeta.label}</span>
                  <p>{entry.message}</p>
                  <div>
                    <strong>{entry.name}</strong>
                    <small>{entry.createdAt}</small>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>
    </motion.div>
  )
}
