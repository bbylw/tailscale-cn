import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

function renderLink(label: string, href: string, key: number): ReactNode {
  if (href.startsWith('/')) {
    return (
      <Link key={key} to={href as never}>
        {label}
      </Link>
    )
  }
  return (
    <a key={key} href={href} target="_blank" rel="noreferrer noopener">
      {label}
    </a>
  )
}

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((part) => part !== '')
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index}>{part.slice(1, -1)}</code>
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
        if (link) {
          return renderLink(link[1] ?? '', link[2] ?? '', index)
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
