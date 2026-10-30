import { useMemo, useState } from 'react'

type Node = {
  id: string
  label: string
  ip: string
  x: number
  y: number
  color: string
}

const NODES: Node[] = [
  { id: 'laptop', label: '笔记本', ip: '100.101.102.4', x: 116, y: 92, color: 'var(--color-steel)' },
  { id: 'phone', label: '手机', ip: '100.101.102.7', x: 78, y: 292, color: 'var(--color-clay)' },
  { id: 'server', label: '家里的服务器', ip: '100.101.102.12', x: 268, y: 356, color: 'var(--color-moss)' },
  { id: 'cloud', label: '云主机', ip: '100.101.102.21', x: 526, y: 104, color: 'var(--color-amber)' },
  { id: 'nas', label: '办公室 NAS', ip: '100.101.102.30', x: 556, y: 306, color: 'var(--color-signal)' },
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

const DERP = { x: 316, y: 208 }

export function Topology() {
  const [mode, setMode] = useState<'direct' | 'relay'>('direct')
  const [hovered, setHovered] = useState<string | null>(null)

  const nodes = useMemo(() => new Map(NODES.map((node) => [node.id, node])), [])

  const connected = useMemo(() => {
    if (!hovered) return new Set<string>()
    const ids = new Set<string>([hovered])
    for (const [a, b] of EDGES) {
      if (a === hovered) ids.add(b)
      if (b === hovered) ids.add(a)
    }
    return ids
  }, [hovered])

  const active = hovered ? nodes.get(hovered) : null

  return (
    <div className="topo">
      <div className="topo__head">
        <div className="topo__title">
          <span className="dot" />
          示例 tailnet
        </div>
        <div className="topo__stats">
          <span>
            <b>5</b> 台设备
          </span>
          <span>
            <b>7</b> 条链路
          </span>
        </div>
      </div>

      <svg
        className="topo__canvas"
        viewBox="0 0 640 404"
        role="img"
        aria-label="五台设备组成的网状网络示意图，可切换直连与经 DERP 中继两种连接方式"
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
            const isActive = hovered !== null && (a === hovered || b === hovered)
            const state = hovered ? (isActive ? 'active' : 'muted') : 'idle'
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
          {NODES.map((node, index) => (
            <line
              key={`relay-${node.id}`}
              className="edge edge--relay"
              x1={node.x}
              y1={node.y}
              x2={DERP.x}
              y2={DERP.y}
              data-state={hovered === node.id ? 'active' : 'idle'}
              style={{ transitionDelay: `${index * 30}ms` }}
            />
          ))}
        </g>

        <g style={{ opacity: mode === 'relay' ? 1 : 0, transition: 'opacity 220ms ease' }}>
          <circle cx={DERP.x} cy={DERP.y} r={17} fill="var(--color-panel)" stroke="var(--color-amber)" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx={DERP.x} cy={DERP.y} r={3.5} fill="var(--color-amber)" />
          <text x={DERP.x} y={DERP.y + 34} textAnchor="middle" fontSize="9" fill="var(--color-ink-3)" fontFamily="var(--font-mono)">
            DERP 中继
          </text>
        </g>

        {NODES.map((node, index) => {
          const dim = hovered !== null && !connected.has(node.id)
          return (
            <g
              key={node.id}
              className="topo__node node-enter"
              style={{ animationDelay: `${index * 60}ms` }}
              transform={`translate(${node.x} ${node.y})`}
              data-active={hovered === node.id}
              data-dim={dim}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle className="hit" r={24} />
              <circle className="node-ring" r={12} />
              <circle className="node-core" r={5} fill={node.color} />
              <text x={0} y={31} textAnchor="middle">
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="topo__foot">
        <span className="topo__status" aria-live="polite">
          {active ? `${active.label} · ${active.ip}` : mode === 'direct' ? '直连优先，流量不经过中继' : '打洞失败，经 DERP 转发密文'}
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
