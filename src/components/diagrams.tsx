export function HubDiagram() {
  const nodes = [
    { x: 54, y: 36, label: '笔记本', align: 'above' as const },
    { x: 54, y: 138, label: '手机', align: 'below' as const },
    { x: 266, y: 36, label: '云主机', align: 'above' as const },
    { x: 266, y: 138, label: '办公室 NAS', align: 'below' as const },
  ]

  return (
    <svg viewBox="0 0 320 176" role="img" aria-label="中心网关结构：所有设备连到同一个网关">
      <g stroke="var(--color-line)" strokeWidth="1.2" strokeDasharray="3 3">
        {nodes.map((node, index) => (
          <line key={index} x1="160" y1="87" x2={node.x} y2={node.y} />
        ))}
      </g>
      {nodes.map((node, index) => (
        <g key={index}>
          <circle
            cx={node.x}
            cy={node.y}
            r="6.5"
            fill="var(--color-panel)"
            stroke="var(--color-ink-3)"
            strokeWidth="1.3"
          />
          <text
            x={node.x}
            y={node.align === 'above' ? node.y - 12 : node.y + 19}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9.5"
            fill="var(--color-ink-3)"
            paintOrder="stroke"
            stroke="var(--color-paper)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          >
            {node.label}
          </text>
        </g>
      ))}
      <rect x="142" y="69" width="36" height="36" rx="4" fill="var(--color-ink)" />
      <path d="M151 87h18M160 78v18" stroke="var(--color-paper)" strokeWidth="1.3" />
      <text
        x="160"
        y="122"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9.5"
        fill="var(--color-ink-2)"
        paintOrder="stroke"
        stroke="var(--color-paper)"
        strokeWidth="4"
        strokeLinejoin="round"
      >
        中心网关
      </text>
    </svg>
  )
}

export function MeshDiagram() {
  const points = [
    { x: 160, y: 28, label: '笔记本', dy: -11 },
    { x: 56, y: 68, label: '手机', dy: -11 },
    { x: 264, y: 68, label: '云主机', dy: -11 },
    { x: 94, y: 142, label: '服务器', dy: 19 },
    { x: 226, y: 142, label: '办公室 NAS', dy: 19 },
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
    <svg viewBox="0 0 320 176" role="img" aria-label="点对点网状结构：设备之间直接相连">
      <g stroke="var(--color-signal)" strokeWidth="1.1" opacity="0.5">
        {links.map(([a, b], index) => {
          const from = points[a]
          const to = points[b]
          if (!from || !to) return null
          return <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        })}
      </g>
      {points.map((pt, index) => (
        <g key={index}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r="6.5"
            fill="var(--color-panel)"
            stroke="var(--color-signal)"
            strokeWidth="1.4"
          />
          <circle cx={pt.x} cy={pt.y} r="2.2" fill="var(--color-signal)" />
          <text
            x={pt.x}
            y={pt.y + pt.dy}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9.5"
            fill="var(--color-ink-2)"
            paintOrder="stroke"
            stroke="var(--color-paper)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          >
            {pt.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
