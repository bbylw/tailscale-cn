import { useCallback, useEffect, useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    const fallback = () => {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.top = '-1000px'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      setCopied(ok)
    }

    if (!navigator.clipboard) {
      fallback()
      return
    }
    navigator.clipboard.writeText(text).then(() => setCopied(true), fallback)
  }, [text])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <button type="button" className="code__copy" onClick={copy} aria-live="polite">
      {copied ? '已复制' : '复制'}
    </button>
  )
}

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="code">
      <div className="code__head">
        <span className="code__label">{label ?? 'shell'}</span>
        <CopyButton text={code} />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}
