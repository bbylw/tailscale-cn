import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Search } from '@/components/search'

type NavItem = { label: string; to: '/' | '/docs'; hash?: string }

const LINKS: NavItem[] = [
  { label: '概览', to: '/' },
  { label: '文档', to: '/docs' },
  { label: '工作原理', to: '/', hash: 'how' },
  { label: '开源', to: '/', hash: 'open-source' },
]

export function Wordmark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 4.2L4.4 16.2M11 4.2L17.6 16.2M4.4 16.2H17.6" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="11" cy="4.2" r="2.6" fill="var(--color-panel)" stroke="var(--color-ink)" strokeWidth="1.3" />
      <circle cx="4.4" cy="16.2" r="2.6" fill="var(--color-panel)" stroke="var(--color-ink)" strokeWidth="1.3" />
      <circle cx="17.6" cy="16.2" r="2.6" fill="var(--color-signal)" stroke="var(--color-signal)" strokeWidth="1.3" />
    </svg>
  )
}

export function SiteHeader() {
  const { pathname, hash } = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      hash: state.location.hash.replace(/^#/, ''),
    }),
  })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname, hash])

  const isItemActive = (item: NavItem) => {
    if (item.to === '/docs') {
      return pathname.startsWith('/docs')
    }
    if (pathname !== '/') return false
    if (item.hash) {
      return hash === item.hash
    }
    return !hash || (hash !== 'how' && hash !== 'open-source')
  }

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link to="/" className="brand" aria-label="Tailscale 首页">
          <Wordmark />
          <span className="brand__name">Tailscale</span>
        </Link>

        <nav className="nav" aria-label="主导航">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              hash={item.hash}
              activeOptions={{ exact: true, includeHash: true }}
              data-active={isItemActive(item) ? 'true' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Search />
          <Link
            to="/docs/$slug"
            params={{ slug: 'install' }}
            className="btn btn--primary btn--sm hide-sm"
          >
            开始使用
          </Link>
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              ) : (
                <path d="M2.5 5H13.5M2.5 10.5H13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              hash={item.hash}
              activeOptions={{ exact: true, includeHash: true }}
              data-active={isItemActive(item) ? 'true' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/docs/$slug"
            params={{ slug: 'install' }}
            onClick={() => setMenuOpen(false)}
          >
            开始使用
          </Link>
        </div>
      )}
    </header>
  )
}
