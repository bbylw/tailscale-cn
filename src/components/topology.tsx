import { useMemo, useState } from 'react'

type Node = {
  id: string
  label: string
  ip: string
  x: number
  y: number
  color: string
  labelPos: 'above' | 'below'
  directPing: string
  relayPing: string
}

const NODES: Node[] = [
  {
    id: 'laptop',
    label: '笔记本',
    ip: '100.101.102.4',
    x: 120,
    y: 108,
    color: 'var(--color-steel)',
    labelPos: 'above',
    directPing: '3 ms',
    relayPing: '34 ms',
  },
  {
    id: 'phone',
    label: '手机',
    ip: '100.101.102.7',
    x: 88,
    y: 282,
    color: 'var(--color-clay)',
    labelPos: 'below',
    directPing: '6 ms',
    relayPing: '38 ms',
  },
  {
    id: 'server',
    label: '家里的服务器',
    ip: '100.101.102.12',
    x: 280,
    y: 332,
    color: 'var(--color-moss)',
    labelPos: 'below',
    directPing: '3 ms',
    relayPing: '31 ms',
  },
  {
    id: 'cloud',
    label: '云主机',
    ip: '100.101.102.21',
    x: 520,
    y: 112,
    color: 'var(--color-amber)',
    labelPos: 'above',
    directPing: '4 ms',
    relayPing: '28 ms',
  },
  {
    id: 'nas',
    label: '办公室 NAS',
    ip: '100.101.102.30',
    x: 548,
    y: 290,
    color: 'var(--color-signal)',
    labelPos: 'below',
    directPing: '5 ms',
    relayPing: '35 ms',
  },
]

const EDGES: [string, string][] = [
  ['laptop', 'phone'],
  ['laptop', 'server'],
  ['laptop', 'cloud'],
  ['phone', 'server'],
  ['server', 'cloud'],
  ['server', 'nas'],
  ['cloud', 'nas'],
]

const DERP = { x: 320, y: 202 }

export function Topology() {
  const [mode, setMode] = useState<'direct' | 'relay'>('direct')
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)

  const focusId = hovered ?? pinned
  const nodes = useMemo(() => new Map(NODES.map((node) => [node.id, node])), [])

  const connected = useMemo(() => {
    if (!focusId) return new Set<string>()
    if (mode === 'relay') {
      return new Set<string>(NODES.map((n) => n.id))
    }
    const ids = new Set<string>([focusId])
    for (const [a, b] of EDGES) {
      if (a === focusId) ids.add(b)
      if (b === focusId) ids.add(a)
    }
    return ids
  }, [focusId, mode])

  const active = focusId ? nodes.get(focusId) : null

  return (
    <div className="topo">
      <div className="topo__head">
        <div className="topo__title">
          <span className="dot" style={{ background: mode === 'relay' ? 'var(--color-amber)' : undefined }} />
          tailnet · 100.64.0.0/10
        </div>
        <div className="topo__stats">
          <span>
            <b>5</b> 台设备
          </span>
          <span>
            <b>{mode === 'direct' ? 7 : 5}</b> {mode === 'direct' ? '条直连' : '条中继'}
          </span>
        </div>
      </div>

      <svg
        className="topo__canvas"
        viewBox="0 0 640 404"
        role="img"
        aria-label="五台设备组成的网状网络示意图，可切换直连与经 DERP 中继两种连接方式"
        onClick={() => setPinned(null)}
      >
        <g aria-hidden="true" stroke="var(--color-line)" strokeWidth="1">
          <path d="M12 26 V12 H26" fill="none" />
          <path d="M614 12 H628 V26" fill="none" />
          <path d="M12 378 V392 H26" fill="none" />
          <path d="M614 392 H628 V378" fill="none" />
        </g>

        <g aria-hidden="true">
          {EDGES.map(([a, b], index) => {
            const from = nodes.get(a)
            const to = nodes.get(b)
            if (!from || !to) return null
            const isActive = focusId !== null && (a === focusId || b === focusId)
            const state = focusId ? (isActive ? 'active' : 'muted') : 'idle'
            return (
              <line
                key={`${a}-${b}`}
                className="edge edge-enter"
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                data-state={state}
                pathLength={1}
                style={{
                  animationDelay: `${120 + index * 70}ms`,
                  opacity: mode === 'relay' ? 0 : undefined,
                }}
              />
            )
          })}
        </g>

        <g aria-hidden="true" style={{ opacity: mode === 'relay' ? 1 : 0, transition: 'opacity 220ms ease' }}>
          {NODES.map((node, index) => {
            const isActive = focusId !== null && focusId === node.id
            const state = focusId ? (isActive ? 'active' : 'muted') : 'idle'
            return (
              <line
                key={`relay-${node.id}`}
                className="edge edge--relay edge--derp"
                x1={node.x}
                y1={node.y}
                x2={DERP.x}
                y2={DERP.y}
                data-state={state}
                style={{ transitionDelay: `${index * 30}ms` }}
              />
            )
          })}
        </g>

        <g style={{ opacity: mode === 'relay' ? 1 : 0, transition: 'opacity 220ms ease', pointerEvents: 'none' }}>
          <circle
            cx={DERP.x}
            cy={DERP.y}
            r={18}
            fill="var(--color-panel)"
            stroke="var(--color-amber)"
            strokeWidth="1.3"
            strokeDasharray="3 3"
          />
          <circle cx={DERP.x} cy={DERP.y} r={4} fill="var(--color-amber)" />
          <text
            x={DERP.x}
            y={DERP.y - 26}
            textAnchor="middle"
            fontSize="10.5"
            fill="var(--color-ink-2)"
            fontFamily="var(--font-mono)"
            paintOrder="stroke"
            stroke="var(--color-panel)"
            strokeWidth="5"
            strokeLinejoin="round"
          >
            DERP 中继 · hkg
          </text>
        </g>

        {NODES.map((node, index) => {
          const isFocused = focusId === node.id
          const dim =
            focusId !== null &&
            (mode === 'direct' ? !connected.has(node.id) : !isFocused)
          const labelY = node.labelPos === 'above' ? -32 : 28
          const ipY = node.labelPos === 'above' ? -18 : 42

          return (
            <g
              key={node.id}
              className="topo__node node-enter"
              style={{ animationDelay: `${index * 60}ms` }}
              transform={`translate(${node.x} ${node.y})`}
              data-active={isFocused}
              data-dim={dim}
              tabIndex={0}
              role="button"
              aria-label={`${node.label} (${node.ip})`}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.id)}
              onBlur={() => setHovered(null)}
              onClick={(event) => {
                event.stopPropagation()
                setPinned((current) => (current === node.id ? null : node.id))
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setPinned((current) => (current === node.id ? null : node.id))
                }
              }}
            >
              <circle className="hit" r={26} />
              <circle className="node-ring" r={12} />
              <circle className="node-core" r={5} fill={node.color} />
              <text
                className="node-label"
                x={0}
                y={labelY}
                textAnchor="middle"
                paintOrder="stroke"
                stroke="var(--color-panel)"
                strokeWidth="4"
                strokeLinejoin="round"
              >
                {node.label}
              </text>
              <text
                className="node-ip"
                x={0}
                y={ipY}
                textAnchor="middle"
                paintOrder="stroke"
                stroke="var(--color-panel)"
                strokeWidth="4"
                strokeLinejoin="round"
              >
                {node.ip}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="topo__foot">
        <span className="topo__status" aria-live="polite">
          {active
            ? mode === 'direct'
              ? `${active.label} · ${active.ip} · WireGuard 直连 (${active.directPing})`
              : `${active.label} · ${active.ip} · 经 DERP(hkg) 转发密文 (${active.relayPing})`
            : mode === 'direct'
              ? '直连优先，流量不经过中继 · 悬停或点击节点查看路径'
              : '打洞受阻时自动改走 DERP 中继，仅转发端到端密文'}
        </span>
        <div className="segmented" role="group" aria-label="连接方式">
          <button type="button" aria-pressed={mode === 'direct'} onClick={() => setMode('direct')}>
            直连
          </button>
          <button type="button" aria-pressed={mode === 'relay'} onClick={() => setMode('relay')}>
            经中继
          </button>
        </div>
      </div>
    </div>
  )
}
