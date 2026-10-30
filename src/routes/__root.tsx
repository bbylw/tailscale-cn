import { Outlet, createRootRoute, HeadContent, Link, Scripts } from '@tanstack/react-router'
import '@fontsource-variable/archivo'
import '@fontsource-variable/jetbrains-mono'
import appCss from '@/styles/app.css?url'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#eceee7' },
      {
        title: 'Tailscale · 让私有 WireGuard 网络变得简单',
      },
      {
        name: 'description',
        content:
          '用 WireGuard 把笔记本、手机、服务器连成点对点私有网络，不需要公网 IP，也不需要端口转发。包含安装、子网路由、退出节点、MagicDNS 与访问控制。',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        <a className="skip-link" href="#main">
          跳到主要内容
        </a>
        <SiteHeader />
        <main id="main">
          <Outlet />
        </main>
        <SiteFooter />
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
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
