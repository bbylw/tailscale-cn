import { Link } from '@tanstack/react-router'
import { Wordmark } from '@/components/site-header'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer__grid">
          <div>
            <Link to="/" className="brand">
              <Wordmark />
              <span className="brand__name">Tailscale</span>
            </Link>
            <p className="site-footer__desc">
              基于 WireGuard 的点对点私有网络。把笔记本、手机、服务器与容器接进同一张 tailnet，无需公网 IP，也无需改动防火墙。
            </p>
          </div>

          <div className="site-footer__col">
            <h3>文档</h3>
            <Link to="/docs/$slug" params={{ slug: 'what-is-tailscale' }}>
              什么是 Tailscale
            </Link>
            <Link to="/docs/$slug" params={{ slug: 'install' }}>
              安装与首次连接
            </Link>
            <Link to="/docs/$slug" params={{ slug: 'how-it-works' }}>
              工作原理
            </Link>
            <Link to="/docs/$slug" params={{ slug: 'access-control' }}>
              访问控制
            </Link>
            <Link to="/docs" className="site-footer__more">
              全部文档
            </Link>
          </div>

          <div className="site-footer__col">
            <h3>官方资源</h3>
            <a href="https://tailscale.com" target="_blank" rel="noreferrer noopener">
              tailscale.com
            </a>
            <a href="https://tailscale.com/docs" target="_blank" rel="noreferrer noopener">
              官方文档
            </a>
            <a href="https://github.com/tailscale/tailscale" target="_blank" rel="noreferrer noopener">
              源代码仓库
            </a>
            <a href="https://pkgs.tailscale.com" target="_blank" rel="noreferrer noopener">
              安装包
            </a>
          </div>
        </div>

        <div className="site-footer__btm">
          <span>BSD 3-Clause 开源守护进程 · tailscale/tailscale</span>
          <span>WireGuard 是 Jason A. Donenfeld 的注册商标</span>
        </div>
      </div>
    </footer>
  )
}
