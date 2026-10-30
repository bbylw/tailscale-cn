import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { docGroups, docs } from '@/content/docs'

export function DocsSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const current = docs.find((doc) => pathname === `/docs/${doc.slug}`)

  return (
    <div className="docs-side-wrap">
      <button
        type="button"
        className="docs-mobile-trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>文档目录</span>
        <span className="mono" style={{ color: 'var(--color-ink-3)' }}>
          {open ? '收起' : (current?.navTitle ?? '展开')}
        </span>
      </button>

      <aside className="docs-side" data-open={open} aria-label="文档导航">
        <nav>
          {docGroups.map((group) => (
            <div className="docs-side__group" key={group}>
              <div className="docs-side__label">{group}</div>
              {docs
                .filter((doc) => doc.group === group)
                .map((doc) => (
                  <Link
                    key={doc.slug}
                    to="/docs/$slug"
                    params={{ slug: doc.slug }}
                    className="docs-side__link"
                    data-status={pathname === `/docs/${doc.slug}` ? 'active' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {doc.navTitle}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--color-line-soft)' }}>
          <a
            className="docs-side__link"
            href="https://tailscale.com/docs"
            target="_blank"
            rel="noreferrer noopener"
          >
            官方英文文档
          </a>
        </div>
      </aside>
    </div>
  )
}
