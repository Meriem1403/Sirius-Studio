import { useEffect, useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface WorkspaceShellProps {
  variant: 'client' | 'admin'
  zoneLabel: string
  sidebar: ReactNode
  children: ReactNode
}

export default function WorkspaceShell({ variant, zoneLabel, sidebar, children }: WorkspaceShellProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [isMobileNav, setIsMobileNav] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  )
  const location = useLocation()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const sync = () => setIsMobileNav(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <div className={`workspace-shell workspace-shell--${variant} pt-24 sm:pt-28 pb-12 px-4 sm:px-6`}>
      <div className="workspace-shell-inner section-inner">
        <aside
          id="workspace-sidebar"
          className={`workspace-sidebar-aside ${navOpen ? 'workspace-sidebar-aside--open' : ''}`}
          aria-hidden={isMobileNav && !navOpen ? true : undefined}
        >
          <button
            type="button"
            className="workspace-sidebar-backdrop"
            aria-label="Fermer le menu"
            tabIndex={navOpen ? 0 : -1}
            onClick={() => setNavOpen(false)}
          />
          <div className="workspace-sidebar-slot">{sidebar}</div>
        </aside>

        <div className={`workspace-main workspace-main--${variant}`}>
          <div className="workspace-mobile-bar">
            <button
              type="button"
              className="workspace-mobile-menu-btn"
              aria-expanded={navOpen}
              aria-controls="workspace-sidebar"
              onClick={() => setNavOpen((open) => !open)}
            >
              {navOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
              <span>Menu</span>
            </button>
            <span className="workspace-mobile-zone">{zoneLabel}</span>
          </div>
          <div className="workspace-main-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
