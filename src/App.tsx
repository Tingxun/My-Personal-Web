import { AnimatePresence } from 'framer-motion'
import { ChevronsLeft, ChevronsRight, Grid3X3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DistortionFooter } from './components/DistortionFooter'
import { GeometryField } from './components/GeometryField'
import { PageLoader } from './components/PageLoader'
import { pages } from './constants'
import { PersistentMusicDock } from './features/PersistentMusicDock'
import { usePersistentMusic } from './hooks/usePersistentMusic'
import { useSiteContent } from './hooks/useSiteContent'
import { GuestbookPage } from './pages/GuestbookPage'
import { HomePage } from './pages/HomePage'
import { LabPage } from './pages/LabPage'
import { MemoriesPage } from './pages/MemoriesPage'
import type { PageId } from './types'
import { getPageFromHash } from './utils/routes'

function App() {
  const [activePage, setActivePage] = useState<PageId>(() => getPageFromHash())
  const [loadingPage, setLoadingPage] = useState<PageId | null>(null)
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const { content } = useSiteContent()
  const musicCoverFallbacks = useMemo(
    () => content.photos.filter((photo) => photo.category.startsWith('WLOP')).map((photo) => photo.thumb),
    [content.photos],
  )
  const music = usePersistentMusic(content.localTracks, musicCoverFallbacks)

  const goToPage = (page: PageId) => {
    if (page === activePage) return
    setLoadingPage(page)
    window.location.hash = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => {
      setActivePage(page)
      setLoadingPage(null)
    }, 520)
  }

  useEffect(() => {
    const syncFromHash = () => {
      const page = getPageFromHash()
      if (page !== activePage) {
        setLoadingPage(page)
        window.setTimeout(() => {
          setActivePage(page)
          setLoadingPage(null)
        }, 420)
      }
    }
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [activePage])

  useEffect(() => {
    const syncPointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', syncPointer)
    return () => window.removeEventListener('pointermove', syncPointer)
  }, [])

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 680px)')
    const syncNavForViewport = () => setIsNavCollapsed(mobileQuery.matches)

    syncNavForViewport()
    mobileQuery.addEventListener('change', syncNavForViewport)
    return () => mobileQuery.removeEventListener('change', syncNavForViewport)
  }, [])

  const activeLabel = pages.find((page) => page.id === loadingPage)?.label || ''

  return (
    <div className="app-shell">
      <GeometryField />
      {music.audioElement}
      <AnimatePresence>{loadingPage ? <PageLoader pageLabel={activeLabel} /> : null}</AnimatePresence>
      <header className={`topbar${isNavCollapsed ? ' nav-collapsed' : ''}`}>
        <button className="brand" type="button" onClick={() => goToPage('home')} aria-label="回到总览">
          <Grid3X3 size={20} />
          个人几何档案
        </button>
        <nav aria-label="主导航" aria-hidden={isNavCollapsed}>
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              className={activePage === page.id ? 'active' : ''}
              onClick={() => goToPage(page.id)}
              style={
                {
                  '--nav-index': index,
                  '--nav-count': pages.length,
                } as React.CSSProperties
              }
            >
              {page.label}
            </button>
          ))}
        </nav>
        <button
          className="nav-toggle"
          type="button"
          aria-label={isNavCollapsed ? '展开导航标签' : '收起导航标签'}
          aria-expanded={!isNavCollapsed}
          onClick={() => setIsNavCollapsed((collapsed) => !collapsed)}
        >
          {isNavCollapsed ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
        </button>
      </header>

      <main id="top">
        <AnimatePresence mode="wait">
          {activePage === 'home' ? <HomePage goToPage={goToPage} /> : null}
          {activePage === 'memories' ? <MemoriesPage music={music} photos={content.photos} games={content.games} /> : null}
          {activePage === 'lab' ? <LabPage projects={content.projects} skills={content.skills} /> : null}
          {activePage === 'guestbook' ? <GuestbookPage /> : null}
        </AnimatePresence>

        <DistortionFooter />
      </main>
      <PersistentMusicDock music={music} goToPage={goToPage} />
    </div>
  )
}

export default App
