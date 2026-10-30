import { useEffect, useState } from 'react'

type Item = { id: string; text: string; level: 2 | 3 }

export function DocsToc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const key = items.map((item) => item.id).join('|')

  useEffect(() => {
    const ids = key.split('|').filter(Boolean)
    const onScroll = () => {
      let current = ids[0] ?? ''
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= 140) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [key])

  if (items.length === 0) return null

  return (
    <nav className="docs-toc" aria-label="本页目录">
      <div className="docs-toc__title">本页内容</div>
      {items.map((item) => (
        <a key={item.id} href={`#${item.id}`} data-level={item.level} data-active={active === item.id}>
          {item.text}
        </a>
      ))}
    </nav>
  )
}
