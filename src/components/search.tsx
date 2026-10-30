import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { searchIndex } from '@/content/docs'

export function Search() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return searchIndex.slice(0, 6)

    const score = (item: (typeof searchIndex)[number]) => {
      const title = item.title.toLowerCase()
      if (title === value) return 100
      if (title.startsWith(value)) return 80
      if (title.includes(value)) return 60
      if (item.description.toLowerCase().includes(value)) return 40
      if (item.keywords.toLowerCase().includes(value)) return 20
      return 0
    }

    return searchIndex
      .map((item) => ({ item, value: score(item) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((entry) => entry.item)
  }, [query])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true

      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setCursor(0)
    const raf = window.requestAnimationFrame(() => inputRef.current?.focus())
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.cancelAnimationFrame(raf)
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (slug: string | undefined) => {
    if (!slug) return
    setOpen(false)
    navigate({ to: '/docs/$slug', params: { slug } })
  }

  return (
    <>
      <button type="button" className="search-trigger" onClick={() => setOpen(true)} aria-label="搜索文档">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span>搜索</span>
        <kbd>/</kbd>
      </button>

      {open && (
        <div className="search-overlay" onClick={() => setOpen(false)}>
          <div
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="搜索文档"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              ref={inputRef}
              className="search-input"
              placeholder="搜索文档，例如 子网、DERP、ACL"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setCursor(0)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setCursor((value) => Math.min(value + 1, results.length - 1))
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setCursor((value) => Math.max(value - 1, 0))
                }
                if (event.key === 'Enter') {
                  event.preventDefault()
                  go(results[cursor]?.slug)
                }
              }}
              aria-label="搜索关键词"
            />
            <div className="search-results">
              {results.length === 0 ? (
                <p className="search-empty">没有匹配的页面。试试「子网」「退出节点」或「MagicDNS」。</p>
              ) : (
                results.map((item, index) => (
                  <button
                    key={item.slug}
                    type="button"
                    className="search-result"
                    data-active={index === cursor}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => go(item.slug)}
                    style={{ display: 'block', width: '100%', textAlign: 'left' }}
                  >
                    <div className="search-result__title">{item.title}</div>
                    <div className="search-result__desc">{item.description}</div>
                  </button>
                ))
              )}
            </div>
            <div className="search-foot">
              <span>↑↓ 选择</span>
              <span>Enter 打开</span>
              <span>Esc 关闭</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
