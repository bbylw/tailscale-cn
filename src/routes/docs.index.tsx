import { Link, createFileRoute } from '@tanstack/react-router'
import { docGroups, docs } from '@/content/docs'

export const Route = createFileRoute('/docs/')({
  component: DocsIndex,
  head: () => ({
    meta: [
      { title: '文档 · Tailscale' },
      {
        name: 'description',
        content:
          'Tailscale 文档索引：从安装与首次连接，到子网路由器、退出节点、MagicDNS、访问控制与命令行参考。',
      },
    ],
  }),
})

function DocsIndex() {
  return (
    <div className="shell">
      <header className="docs-hero">
        <div className="docs-hero__grid">
          <div>
            <div className="label">文档</div>
            <h1 className="docs-hero__title">从两台设备开始，逐步接管整个网络</h1>
            <p className="docs-hero__lede">
              入门部分只需要五分钟；后面的章节按能力拆分，遇到具体问题时再查。
              覆盖从首次建网、NAT 穿透原理，到子网路由、退出节点、MagicDNS 与访问控制策略的完整配置流程。
            </p>
          </div>

          <ol className="path">
            <li className="path__head">建议顺序</li>
            <li>
              <Link to="/docs/$slug" params={{ slug: 'install' }}>
                <span className="path__num">01</span>
                <span>
                  安装与首次连接
                  <span className="path__note">五分钟建好一张 tailnet</span>
                </span>
              </Link>
            </li>
            <li>
              <Link to="/docs/$slug" params={{ slug: 'what-is-tailscale' }}>
                <span className="path__num">02</span>
                <span>
                  什么是 Tailscale
                  <span className="path__note">先看清它与传统 VPN 的差别</span>
                </span>
              </Link>
            </li>
            <li>
              <Link to="/docs/$slug" params={{ slug: 'how-it-works' }}>
                <span className="path__num">03</span>
                <span>
                  工作原理
                  <span className="path__note">直连、打洞与中继各自发生在哪一层</span>
                </span>
              </Link>
            </li>
          </ol>
        </div>
      </header>

      <div className="docs-index">
        {docGroups.map((group) => {
          const items = docs.filter((doc) => doc.group === group)
          return (
            <section className="docs-group" key={group}>
              <div className="docs-group__head">
                <h2 className="docs-group__name">{group}</h2>
                <span className="docs-group__count">{items.length} 篇</span>
              </div>
              {items.map((doc) => (
                <Link key={doc.slug} to="/docs/$slug" params={{ slug: doc.slug }} className="doc-row">
                  <span className="doc-row__title">{doc.title}</span>
                  <p className="doc-row__desc">{doc.description}</p>
                  <span className="doc-row__min">{doc.minutes} 分钟</span>
                </Link>
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}
