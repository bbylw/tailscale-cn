export function HubDiagram() {
  return (
    <svg viewBox="0 0 300 170" role="img" aria-label="中心网关结构：所有设备连到同一个网关">
      <g stroke="var(--color-line)" strokeWidth="1.1">
        <line x1="150" y1="85" x2="54" y2="34" />
        <line x1="150" y1="85" x2="54" y2="136" />
        <line x1="150" y1="85" x2="246" y2="34" />
        <line x1="150" y1="85" x2="246" y2="136" />
      </g>
      <g>
        <circle cx="54" cy="34" r="7" fill="var(--color-panel)" stroke="var(--color-ink-3)" strokeWidth="1.3" />
        <circle cx="54" cy="136" r="7" fill="var(--color-panel)" stroke="var(--color-ink-3)" strokeWidth="1.3" />
        <circle cx="246" cy="34" r="7" fill="var(--color-panel)" stroke="var(--color-ink-3)" strokeWidth="1.3" />
        <circle cx="246" cy="136" r="7" fill="var(--color-panel)" stroke="var(--color-ink-3)" strokeWidth="1.3" />
      </g>
      <rect x="132" y="67" width="36" height="36" rx="3" fill="var(--color-ink)" />
      <path d="M141 85h18M150 76v18" stroke="var(--color-paper)" strokeWidth="1.2" />
      <g fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-3)">
        <text x="150" y="120" textAnchor="middle">网关</text>
      </g>
    </svg>
  )
}

export function MeshDiagram() {
  const points = [
    [150, 26],
    [54, 62],
    [246, 62],
    [88, 140],
    [212, 140],
  ] as const
  const links: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 3],
    [2, 4],
    [3, 4],
  ]
  return (
    <svg viewBox="0 0 300 170" role="img" aria-label="点对点网状结构：设备之间直接相连">
      <g stroke="var(--color-signal)" strokeWidth="1" opacity="0.55">
        {links.map(([a, b], index) => {
          const from = points[a]
          const to = points[b]
          if (!from || !to) return null
          return <line key={index} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} />
        })}
      </g>
      {points.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r="7"
          fill="var(--color-panel)"
          stroke="var(--color-signal)"
          strokeWidth="1.4"
        />
      ))}
    </svg>
  )
}
