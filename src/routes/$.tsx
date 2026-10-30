import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$')({
  head: () => ({
    meta: [{ title: '页面未找到 · Tailscale 中文' }],
  }),
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="shell" style={{ paddingBlock: '96px 120px' }}>
      <div className="label">404</div>
      <h1 className="h2" style={{ marginTop: 12 }}>
        这个地址不在网络里
      </h1>
      <p className="hero__lede" style={{ marginTop: 16 }}>
        页面可能被移动或删除。回到文档索引重新找一下。
      </p>
      <div className="hero__actions">
        <Link to="/docs" className="btn btn--primary">
          打开文档索引
        </Link>
        <Link to="/" className="btn btn--ghost">
          回到首页
        </Link>
      </div>
    </div>
  )
}
