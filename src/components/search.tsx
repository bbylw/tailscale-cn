import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { searchIndex } from '@/content/docs'

type SearchResult = {
  slug: string
  title: string
  description: string
  group: string
  matchedHeading?: { id: string; text: string }
}

export function Search() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const results = useMemo<SearchResult[]>(() => {
    const value = query.trim().toLowerCase()
    if (!value) {
      return searchIndex.slice(0, 6).map((item) => ({
        slug: item.slug,
        title: item.title,
        description: item.description,
        group: item.group,
      }))
    }

    return searchIndex
      .map((item) => {
        const title = item.title.toLowerCase()
        let score = 0
        if (title === value) score = 100
        else if (title.startsWith(value)) score = 85
        else if (title.includes(value)) score = 70

        const matchedHeading = item.headings.find((h) => h.text.toLowerCase().includes(value))
        if (matchedHeading && score < 65) score = 60

        if (score === 0 && item.description.toLowerCase().includes(value)) score = 45
        if (score === 0 && item.keywords.toLowerCase().includes(value)) score = 25

        return {
          score,
          result: {
            slug: item.slug,
            title: item.title,
            description: item.description,
            group: item.group,
            matchedHeading,
          },
        }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((entry) => entry.result)
  }, [query])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true

      if ((event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
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

  useEffect(() => {
    if (!open || !listRef.current) return
    const activeEl = listRef.current.querySelector<HTMLElement>('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [cursor, open])

  const go = (item: SearchResult | undefined) => {
    if (!item) return
    setOpen(false)
    navigate({
      to: '/docs/$slug',
      params: { slug: item.slug },
      hash: item.matchedHeading?.id,
    })
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
              placeholder="搜索文档、命令或概念，例如 子网、DERP、ACL、netcheck"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setCursor(0)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setCursor((value) => Math.min(value + 1, Math.max(0, results.length - 1)))
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setCursor((value) => Math.max(value - 1, 0))
                }
                if (event.key === 'Enter') {
                  event.preventDefault()
                  go(results[cursor])
                }
              }}
              aria-label="搜索关键词"
            />
            <div className="search-results" ref={listRef}>
              {results.length === 0 ? (
                <p className="search-empty">没有匹配的页面。试试「子网」「退出节点」「MagicDNS」或「ACL」。</p>
              ) : (
                results.map((item, index) => (
                  <button
                    key={item.slug}
                    type="button"
                    className="search-result"
                    data-active={index === cursor}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => go(item)}
                    style={{ display: 'block', width: '100%', textAlign: 'left' }}
                  >
                    <div className="search-result__head">
                      <span className="search-result__title">
                        {item.title}
                        {item.matchedHeading ? (
                          <span className="search-result__section"> · {item.matchedHeading.text}</span>
                        ) : null}
                      </span>
                      <span className="search-result__group">{item.group}</span>
                    </div>
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
