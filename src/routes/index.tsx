import { createFileRoute, Link } from '@tanstack/react-router'
import { Topology } from '@/components/topology'
import { HubDiagram, MeshDiagram } from '@/components/diagrams'
import { CodeBlock } from '@/components/code-block'

export const Route = createFileRoute('/')({
  component: Landing,
  head: () => ({
    meta: [
      { title: 'Tailscale 中文 · 不需要公网 IP，也能连成一张网' },
      {
        name: 'description',
        content:
          'Tailscale 用 WireGuard 把设备接进同一张私有网络：点对点直连、无需公网 IP、无需端口转发。中文导读，含安装、子网路由器、退出节点与访问控制。',
      },
    ],
  }),
})

const FEATURES = [
  {
    name: '子网路由器',
    cmd: '--advertise-routes=10.0.0.0/16',
    desc: '把打印机、摄像头、整段 VPC 这类装不了客户端的设备，通过一台网关接进网络。',
    slug: 'subnet-routers',
  },
  {
    name: '退出节点',
    cmd: '--exit-node=gw-hkg',
    desc: '需要传统 VPN 那种「全部流量走一个出口」时，把某台设备设为出口即可。',
    slug: 'exit-nodes',
  },
  {
    name: 'MagicDNS',
    cmd: 'ping monitoring',
    desc: '每台设备自动获得可解析的名字，ssh 和浏览器里不用再记 100.x 的地址。',
    slug: 'magicdns',
  },
  {
    name: '访问控制',
    cmd: 'autogroup:internet',
    desc: '用声明式策略描述谁能访问谁，默认拒绝，按标签与端口逐条放行。',
    slug: 'access-control',
  },
  {
    name: 'SSH 访问',
    cmd: 'tailscale up --ssh',
    desc: '用身份而不是公钥登录服务器：策略批准谁能连哪台机器，会话按需记录。',
    slug: 'access-control',
  },
  {
    name: '命令行',
    cmd: 'tailscale netcheck',
    desc: '设备状态、连接路径、NAT 类型、中继延迟，都能在终端里一眼看清。',
    slug: 'cli',
  },
] as const

function Landing() {
  return (
    <>
      <section className="hero">
        <div className="shell hero__grid">
          <div>
            <h1 className="hero__title">
              不需要公网 IP，
              <span>也能连成一张网</span>
            </h1>
            <p className="hero__lede">
              Tailscale 用 WireGuard 把笔记本、手机、服务器接进同一个私有网络。能直连就直连，
              NAT 和防火墙后面也一样——不用开放入站端口，也不用维护一台中心网关。
            </p>
            <div className="hero__actions">
              <Link to="/docs/$slug" params={{ slug: 'install' }} className="btn btn--primary">
                开始搭建
              </Link>
              <Link to="/docs" className="btn btn--ghost">
                阅读文档
              </Link>
            </div>
            <div className="hero__meta mono">
              <span>
                <i className="dot" />
                开源守护进程
              </span>
              <span>Linux · macOS · Windows · iOS · Android</span>
            </div>
          </div>

          <Topology />
        </div>
      </section>

      <section className="section section--tight">
        <div className="shell">
          <div className="section-head section-head--split">
            <h2 className="h2">把流量塞进一台网关，是所有麻烦的开始</h2>
            <p className="section-note">
              传统 VPN 把所有人接到同一个出口：它工作，但延迟、带宽和可用性都压在那台机器上。
              网状网络换了一个前提——设备之间本来就可以直接说话。
            </p>
          </div>

          <div className="compare">
            <div className="compare__col">
              <div className="compare__head">
                <span className="compare__name">传统 VPN</span>
                <span className="compare__state">中心辐射</span>
              </div>
              <HubDiagram />
              <p className="compare__caption">
                所有流量经过同一台网关。它离你越远，延迟越高；它的带宽越小，所有人一起变慢；
                它挂了，整张网络一起断。
              </p>
            </div>

            <div className="compare__col compare__col--good">
              <div className="compare__head">
                <span className="compare__name">Tailscale</span>
                <span className="compare__state">点对点优先</span>
              </div>
              <MeshDiagram />
              <p className="compare__caption">
                设备两两协商直连，只有打洞失败时才退回加密中继。单台设备故障不会波及其他链路，
                加设备也不会给某个节点增加负担。
              </p>
            </div>
          </div>

          <p className="label" style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--color-line-soft)', lineHeight: 1.7 }}>
            差别不在是否加密，而在流量走哪条路：一个必须经过网关，一个尽量直连。
          </p>
        </div>
      </section>

      <section className="section" id="how">
        <div className="shell how-wrap">
          <div className="how__intro">
            <h2 className="h2">四步，把两个内网接起来</h2>
            <p className="section-note" style={{ marginTop: 18 }}>
              控制平面与数据平面是分开的：协调服务器只负责告诉设备彼此在哪、公钥是什么，
              业务数据在两台设备之间加密直传，不经过它。
            </p>

            <div className="terminal">
              <div className="terminal__head">
                <span className="dot" style={{ background: 'rgba(236,238,231,.35)' }} />
                示例输出
              </div>
              <pre className="terminal__body">
                <span className="c">$ tailscale status</span>
                {'\n'}100.101.102.4 laptop alice@ linux {'\n'}
                100.101.102.12 nas alice@ linux <span className="g">direct</span>
                {'\n'}100.101.102.21 cloud-sin-1 alice@ linux <span className="g">direct</span>
                {'\n'}100.101.102.30 office-nas alice@ linux relay "hkg"
                {'\n\n'}
                <span className="c">$ tailscale ping nas</span>
                {'\n'}pong from nas via 192.168.1.20:41641 in 3ms
              </pre>
            </div>
            <p className="label" style={{ marginTop: 12, lineHeight: 1.6 }}>
              直连时延接近物理下限；出现 relay 说明当前走中继。
            </p>
          </div>

          <div className="how">
            <div className="how__row">
              <div className="how__index">01</div>
              <div>
                <h3 className="how__title">认证身份</h3>
                <p className="how__text">
                  设备用你现有的身份提供商（Google、Microsoft、GitHub、Okta 等）登录，
                  本地生成节点密钥。谁在这张网络里，由身份决定，而不是由 IP 段决定。
                </p>
              </div>
            </div>
            <div className="how__row">
              <div className="how__index">02</div>
              <div>
                <h3 className="how__title">交换地图</h3>
                <p className="how__text">
                  协调服务器把 netmap 推给每台设备：有哪些 peer、各自的公钥、Tailscale IP，
                  以及策略允许它访问谁。策略一改，几秒内全网生效。
                </p>
              </div>
            </div>
            <div className="how__row">
              <div className="how__index">03</div>
              <div>
                <h3 className="how__title">尝试打洞</h3>
                <p className="how__text">
                  客户端先问 STUN 服务「我在公网长什么样」，再通过协调服务器交换候选地址，
                  双方同时向对方发包，在 NAT 上开出一条双向通路。
                </p>
              </div>
            </div>
            <div className="how__row">
              <div className="how__index">04</div>
              <div>
                <h3 className="how__title">加密传输</h3>
                <p className="how__text">
                  通路建立后，流量走 WireGuard，端到端加密。打洞失败时自动改走 DERP 中继，
                  中继只转发密文。具体走哪条路，用 <code>tailscale ping</code> 就能看到。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight" id="features">
        <div className="shell">
          <div className="section-head section-head--split">
            <h2 className="h2">能力按需打开，不用一次学完</h2>
            <p className="section-note">
              从两台设备开始就够用。需要接旧设备、需要统一出口、需要给团队分权限时，
              再逐项打开对应的能力。
            </p>
          </div>

          <div className="features">
            {FEATURES.map((feature) => (
              <div className="feature" key={feature.name}>
                <div>
                  <div className="feature__name">{feature.name}</div>
                  <div className="feature__cmd" style={{ marginTop: 4 }}>
                    {feature.cmd}
                  </div>
                </div>
                <p className="feature__desc">{feature.desc}</p>
                <Link
                  to="/docs/$slug"
                  params={{ slug: feature.slug }}
                  className="feature__link"
                >
                  阅读
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-band section" id="open-source">
        <div className="shell">
          <div className="section-head section-head--split">
            <div>
              <h2 className="h2" style={{ color: '#eceee7' }}>
                守护进程和命令行，都是开源的
              </h2>
              <p className="section-note" style={{ marginTop: 16 }}>
                仓库里有 <code>tailscaled</code> 与 <code>tailscale</code> 的完整实现。
                发布构建用 <code>build_dist.sh</code> 把提交 ID 与版本写进二进制，
                这样错误报告里的版本号才有意义。
              </p>
            </div>
            <div>
              <CodeBlock
                label="从源码构建"
                code={`go install tailscale.com/cmd/tailscale{,d}

./build_dist.sh tailscale.com/cmd/tailscale
./build_dist.sh tailscale.com/cmd/tailscaled`}
              />
            </div>
          </div>

          <div className="repo-grid">
            <div>
              <div className="label">相关仓库</div>
              <ul className="repo-list">
                <li>
                  <a href="https://github.com/tailscale/tailscale" target="_blank" rel="noreferrer noopener">
                    主仓库 · 守护进程与命令行
                  </a>
                </li>
                <li>
                  <a href="https://github.com/tailscale/tailscale-android" target="_blank" rel="noreferrer noopener">
                    Android 客户端
                  </a>
                </li>
                <li>
                  <a href="https://github.com/tailscale/tailscale-synology" target="_blank" rel="noreferrer noopener">
                    Synology 套件
                  </a>
                </li>
                <li>
                  <a href="https://github.com/tailscale/tailscale-qpkg" target="_blank" rel="noreferrer noopener">
                    QNAP 套件
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="label">构建与协作</div>
              <ul className="repo-list">
                <li>要求最新的 Go 版本，目前是 Go 1.27</li>
                <li>提交信息引用对应的缺陷报告</li>
                <li>每个提交带 DCO 的 <code>Signed-off-by</code> 行</li>
                <li>移动端 GUI 外壳与托管控制面不开源</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell start-grid">
          <div>
            <h2 className="h2">两台设备，五分钟</h2>
            <p className="section-note" style={{ marginTop: 16 }}>
              装客户端、登录、在另一台机器上重复一次。两台设备出现在同一个 tailnet 里，
              就可以直接用名字互相访问。
            </p>

            <ol className="quick-steps">
              <li>
                <span className="quick-steps__num">01</span>
                <span>
                  安装客户端
                  <span className="quick-steps__note">Linux 用脚本，Windows 用 winget，其余平台用官方安装包</span>
                </span>
              </li>
              <li>
                <span className="quick-steps__num">02</span>
                <span>
                  登录并认证
                  <span className="quick-steps__note">sudo tailscale up 会打开浏览器完成 SSO</span>
                </span>
              </li>
              <li>
                <span className="quick-steps__num">03</span>
                <span>
                  在第二台设备重复
                  <span className="quick-steps__note">tailscale status 出现对方，就能按名字访问</span>
                </span>
              </li>
            </ol>

            <div className="hero__actions">
              <Link to="/docs/$slug" params={{ slug: 'install' }} className="btn btn--primary">
                完整安装步骤
              </Link>
              <Link to="/docs" className="btn btn--ghost">
                浏览全部文档
              </Link>
            </div>
          </div>

          <div>
            <CodeBlock
              label="Linux"
              code={`curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
tailscale status`}
            />
            <div className="platform-list">
              <div>
                <span>macOS</span>
                <span>App Store，或官方安装包</span>
              </div>
              <div>
                <span>Windows</span>
                <span>winget install Tailscale.Tailscale</span>
              </div>
              <div>
                <span>Linux</span>
                <span>install.sh 脚本，或发行版仓库</span>
              </div>
              <div>
                <span>其他平台</span>
                <span>pkgs.tailscale.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
