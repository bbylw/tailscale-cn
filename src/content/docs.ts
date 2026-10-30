export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; id: string; text: string }
  | { kind: 'h3'; id: string; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'code'; label?: string; code: string }
  | { kind: 'note'; tone: 'info' | 'warn'; title: string; text: string }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | {
      kind: 'steps'
      items: { title: string; text: string; code?: { label?: string; code: string } }[]
    }

export type DocGroup = '入门' | '网络' | '安全与参考'

export type Doc = {
  slug: string
  title: string
  navTitle: string
  group: DocGroup
  description: string
  minutes: number
  blocks: Block[]
}

export const docs: Doc[] = [
  {
    slug: 'what-is-tailscale',
    title: '什么是 Tailscale',
    navTitle: '什么是 Tailscale',
    group: '入门',
    description: '一张基于身份、点对点加密的私有网络，取代传统 VPN 的中心网关。',
    minutes: 6,
    blocks: [
      {
        kind: 'p',
        text: 'Tailscale 是一个**基于身份的连接平台**。它把笔记本、手机、服务器、容器放进同一张私有网络——这张网络叫 **tailnet**——设备之间用 WireGuard 加密，能直连就直连，不需要公网 IP，也不需要改防火墙。',
      },
      {
        kind: 'h2',
        id: 'why',
        text: '它和传统 VPN 差在哪',
      },
      {
        kind: 'p',
        text: '传统 VPN 是**中心辐射**结构：所有流量先到一个网关，再由网关转发。网关离你远，延迟就高；网关带宽小，所有人一起慢；网关挂了，整张网络一起断。',
      },
      {
        kind: 'p',
        text: 'Tailscale 默认建的是**点对点网状网络**。每台设备都尝试直接连接其他设备，流量不必绕路。协调服务器只负责告诉设备“谁在哪儿、公钥是什么”，不进入数据路径。需要传统 VPN 那种“全部流量走一个出口”的行为时，再把某台设备设为[退出节点](/docs/exit-nodes)即可。',
      },
      {
        kind: 'table',
        head: ['维度', '传统 VPN', 'Tailscale'],
        rows: [
          ['拓扑', '中心网关，流量汇聚', '点对点网状，能直连就直连'],
          ['配置', '端口转发、防火墙规则、证书', '登录账号即可，无需开放入站端口'],
          ['身份', '通常绑定到网络位置', '绑定到用户与设备身份，接 SSO / MFA'],
          ['权限', '网关层面的粗粒度规则', '策略文件按用户、组、标签逐条授权'],
          ['故障域', '网关是单点', '单台设备故障不影响其他链路'],
        ],
      },
      {
        kind: 'h2',
        id: 'terms',
        text: '先认识这几个词',
      },
      {
        kind: 'table',
        head: ['术语', '含义'],
        rows: [
          ['tailnet', '你的私有网络。同一个 tailnet 内的设备才可以互相访问。'],
          ['协调服务器', '控制平面。分发设备列表与公钥，本身不转发你的业务流量。'],
          ['DERP', '中继服务器。两端无法打洞直连时，用它转发加密后的数据包。'],
          ['MagicDNS', '给每台设备自动分配可解析的域名，不必记 100.x 的 IP。'],
          ['子网路由器', '把一整段无法安装客户端的网络接入 tailnet。'],
          ['退出节点', '让设备的上网流量从指定节点出去，行为类似传统 VPN。'],
          ['策略文件', '用声明式规则描述谁能访问谁，默认拒绝。'],
        ],
      },
      {
        kind: 'h2',
        id: 'cases',
        text: '常见用法',
      },
      {
        kind: 'list',
        items: [
          '远程访问家里的 NAS、开发机、打印机，不用把端口暴露到公网。',
          '把多个云厂商的 VPC、Kubernetes 集群连成一张网，跨云访问内部服务。',
          '给 CI Runner、边缘设备、IoT 设备一个稳定的私有地址与身份。',
          '出差或咖啡店网络下，通过退出节点加密全部上网流量。',
        ],
      },
      {
        kind: 'note',
        tone: 'info',
        title: '先建立直觉',
        text: '把它想成“给每台设备发一张带身份的内网 IP 卡”：卡是 WireGuard 密钥，发卡的是协调服务器，刷卡之后的流量只在你和对方之间流动。',
      },
    ],
  },
  {
    slug: 'how-it-works',
    title: '工作原理',
    navTitle: '工作原理',
    group: '入门',
    description: '控制平面与数据平面分离：协调服务器发地图，WireGuard 直接搬数据。',
    minutes: 8,
    blocks: [
      {
        kind: 'p',
        text: '理解 Tailscale 只需要抓住一条分界线：**控制平面**负责“认识彼此”，**数据平面**负责“搬运数据”。两者是分开的，这也是它和传统 VPN 最根本的差异。',
      },
      { kind: 'h2', id: 'control-plane', text: '控制平面：协调服务器' },
      {
        kind: 'p',
        text: '每台设备首次登录时，会在本地生成一对节点密钥，把公钥交给协调服务器，并带上你的身份（来自 Google、Microsoft、GitHub、Okta 等身份提供商）。协调服务器据此生成一份 **netmap**：这张网络里有哪些设备、各自的公钥、Tailscale IP、以及策略文件允许它访问谁。',
      },
      {
        kind: 'p',
        text: 'netmap 会随着设备上下线、策略变更持续推送到客户端。所以你在管理控制台里改一条规则，几秒内所有客户端都会知道。协调服务器不保存你的业务数据，也不在你的数据路径上。',
      },
      { kind: 'h2', id: 'data-plane', text: '数据平面：WireGuard' },
      {
        kind: 'p',
        text: '真正传输数据的是内核里的 WireGuard（部分平台是用户态实现）。每个包都用两端协商出的会话密钥加密，密钥定期轮换。对上层应用来说，这只是一块普通的网卡：源地址是 `100.64.0.0/10` 段里的一个稳定 IP。',
      },
      {
        kind: 'p',
        text: '因为加密在设备之间完成，中间任何一跳——包括 Tailscale 自己的中继——都只能看到密文。',
      },
      { kind: 'h2', id: 'nat', text: 'NAT 穿透：先试着直连' },
      {
        kind: 'p',
        text: '两台设备通常都在 NAT 后面，互相不知道对方的公网地址。客户端会同时做几件事：向 STUN 服务询问自己映射后的公网地址与端口，通过协调服务器交换这些候选地址，然后双方同时向对方发包，试图在 NAT 上打开一条通路。',
      },
      {
        kind: 'p',
        text: '只要有一边的 NAT 允许这种“由内向外建立、双向使用”的映射，直连就成立。常见的家用路由器、云安全组大多可以。直连成功后，流量走最短路径，延迟接近物理网络的下限。',
      },
      { kind: 'h2', id: 'derp', text: 'DERP：直连失败时的兜底' },
      {
        kind: 'p',
        text: '对称 NAT、严苛的企业防火墙、CGNAT 会让打洞失败。这时两端改为连接 **DERP** 中继：数据包仍然是端到端加密的，DERP 只负责按公钥转发密文，无法读取内容。代价是绕路带来的额外延迟与带宽开销。',
      },
      {
        kind: 'p',
        text: '连接方式不是固定的。网络环境变化时（换 Wi-Fi、切蜂窝、休眠唤醒），客户端会重新评估路径，可能在直连与中继之间切换。用 `tailscale ping <设备名>` 可以看到当前走的是哪条路。',
      },
      {
        kind: 'code',
        label: '查看当前路径',
        code: `$ tailscale ping nas
pong from nas (100.101.102.103) via 192.168.1.20:41641 in 3ms
# 出现 "via DERP(nyc)" 则表示当前走中继`,
      },
      { kind: 'h2', id: 'keys', text: '身份、密钥与过期' },
      {
        kind: 'p',
        text: '设备身份由节点密钥决定，用户身份由身份提供商决定。管理控制台可以为设备设置**密钥过期时间**，到期后需要重新认证；也可以为服务器、容器这类长期在线的设备关闭过期。这一点对子网路由器和退出节点尤其重要——密钥过期后它们通告的路由会保留但不可达，这是有意的“fail close”设计，避免流量泄漏到不可信网络。',
      },
      {
        kind: 'note',
        tone: 'warn',
        title: '协调服务器不是数据中继',
        text: '很多人以为流量都经过 Tailscale 的服务器。默认情况下并非如此：只有打洞失败时才会经过 DERP，而且 DERP 拿到的是密文。想验证的话，直接看 `tailscale ping` 输出里的路径。',
      },
    ],
  },
  {
    slug: 'install',
    title: '安装与首次连接',
    navTitle: '安装与首次连接',
    group: '入门',
    description: '五分钟建好一张 tailnet：装客户端、登录、确认设备互通。',
    minutes: 5,
    blocks: [
      {
        kind: 'p',
        text: '整个流程只有三步：**装客户端、登录、在另一台设备上重复一次**。两台设备登录同一个账号，tailnet 就建好了。',
      },
      { kind: 'h2', id: 'install-client', text: '安装客户端' },
      {
        kind: 'code',
        label: 'Linux / Windows',
        code: `# Linux
curl -fsSL https://tailscale.com/install.sh | sh

# Windows
winget install Tailscale.Tailscale`,
      },
      {
        kind: 'p',
        text: 'macOS、iOS、Android 与各发行版的安装包都在 [pkgs.tailscale.com](https://pkgs.tailscale.com) 上。macOS 也可以直接从 App Store 安装带菜单栏界面的版本。',
      },
      { kind: 'h2', id: 'login', text: '登录并确认状态' },
      {
        kind: 'code',
        label: '启动并认证',
        code: `sudo tailscale up        # 会打开浏览器完成 SSO 登录
tailscale status         # 查看当前网络里的设备
tailscale ip -4          # 查看本机 Tailscale IPv4 地址`,
      },
      {
        kind: 'p',
        text: '`tailscale status` 的输出会列出所有设备、它们的 Tailscale IP、以及连接方式（`direct` 或 `relay "xxx"`）。第二台设备登录后，这里应该立刻出现它。',
      },
      { kind: 'h2', id: 'verify', text: '验证互通' },
      {
        kind: 'code',
        label: '从一台设备 ping 另一台',
        code: `tailscale ping <另一台设备的名字>
ssh <用户名>@<另一台设备的名字>`,
      },
      {
        kind: 'p',
        text: '名字能直接解析，是因为 MagicDNS 默认开启。如果解析失败，检查管理控制台 DNS 页面里的 MagicDNS 开关，或者先用 IP 试。',
      },
      { kind: 'h2', id: 'invite', text: '邀请其他人' },
      {
        kind: 'p',
        text: '在管理控制台的 **Users** 页面点 **Invite**，输入对方邮箱，对方用同一个身份提供商登录后就会加入你的 tailnet。新成员默认能看到网络里的其他设备——生产环境应当先写好[访问控制策略](/docs/access-control)，再邀请人。',
      },
      {
        kind: 'table',
        head: ['命令', '作用'],
        rows: [
          ['`tailscale status`', '列出设备、IP 与连接方式'],
          ['`tailscale ip -4`', '输出本机 Tailscale IPv4'],
          ['`tailscale ping <peer>`', '测试到某台设备的路径与延迟'],
          ['`tailscale netcheck`', '检测 NAT 类型、UDP 可用性与 DERP 延迟'],
          ['`tailscale down`', '临时断开，但保留登录状态'],
        ],
      },
      {
        kind: 'note',
        tone: 'info',
        title: '没有公网 IP 也能用',
        text: '不需要端口转发，也不需要固定公网地址。设备只要能出站访问互联网，剩下的交给 NAT 穿透。',
      },
    ],
  },
  {
    slug: 'subnet-routers',
    title: '子网路由器',
    navTitle: '子网路由器',
    group: '网络',
    description: '把打印机、摄像头、整段 VPC 这类装不了客户端的设备接进 tailnet。',
    minutes: 9,
    blocks: [
      {
        kind: 'p',
        text: '有些设备装不了 Tailscale：网络打印机、摄像头、老旧的工业控制器，或者一整个你不想逐台改造的 VPC 网段。**子网路由器**就是这些设备的网关——它自己跑 Tailscale，把背后的网段“通告”给整个 tailnet。',
      },
      { kind: 'h2', id: 'when', text: '什么时候该用' },
      {
        kind: 'list',
        items: [
          '访问无法安装客户端的传统设备。',
          '一次性接入整段私有网络，例如 `10.0.0.0/16` 的云上 VPC。',
          '渐进式迁移：先把现有网段接通，再慢慢给关键设备装客户端。',
          '访问只能通过私有网络到达的托管服务，例如 RDS、Cloud SQL。',
        ],
      },
      {
        kind: 'note',
        tone: 'info',
        title: '和退出节点的区别',
        text: '子网路由器接通的是**私有网段**；退出节点改写的是**公网出口**（`0.0.0.0/0`、`::/0`）。需要“所有上网流量都从某地出去”时，用退出节点。',
      },
      { kind: 'h2', id: 'setup', text: '配置步骤' },
      {
        kind: 'steps',
        items: [
          {
            title: '在网关上安装并登录 Tailscale',
            text: '这台机器要能同时访问目标子网和互联网。Linux 是最常见的网关系统。',
          },
          {
            title: '开启 IP 转发',
            text: 'Linux 默认不转发流量，必须先打开 IPv4 与 IPv6 转发。',
            code: {
              label: 'Linux',
              code: `echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf`,
            },
          },
          {
            title: '通告路由',
            text: '多个网段用逗号分隔。通告只是“声明”，还需要批准才会生效。',
            code: {
              label: '通告 192.168.1.0/24',
              code: `sudo tailscale set --advertise-routes=192.168.1.0/24`,
            },
          },
          {
            title: '在管理控制台批准',
            text: '打开 Machines 页面，找到带 Subnets 标记的设备，进入 Subnets 部分勾选路由并保存。配置了 autoApprovers 的话可以跳过这一步。',
          },
          {
            title: '让客户端接收路由',
            text: 'Windows、macOS、iOS、Android 会自动接收。Linux 必须显式开启。',
            code: {
              label: 'Linux 客户端',
              code: `sudo tailscale set --accept-routes`,
            },
          },
        ],
      },
      { kind: 'h2', id: 'snat', text: 'SNAT：源地址会被改写' },
      {
        kind: 'p',
        text: '默认情况下，经过子网路由器的流量会做源地址转换，背后设备看到的来源是路由器自己的地址。这在多数场景下没问题，但如果你需要保留原始源 IP（审计、按 IP 限流），可以在 Linux 网关上关闭 SNAT：',
      },
      {
        kind: 'code',
        label: '关闭 SNAT（仅 Linux）',
        code: `sudo tailscale up --snat-subnet-routes=false`,
      },
      {
        kind: 'p',
        text: '关闭后必须自己补一条返回路由：把 `100.64.0.0/10` 指向子网路由器的内网地址，否则子网里的设备不知道如何回到 Tailscale 客户端。这一步要在操作系统、VPC 路由表或 DHCP 里做。',
      },
      { kind: 'h2', id: 'caveats', text: '容易踩的坑' },
      {
        kind: 'table',
        head: ['现象', '原因与处理'],
        rows: [
          ['路由批准了，但访问仍然不通', '批准路由只是把路由注入路由表；能否通信还取决于策略文件是否授权。'],
          ['Linux 客户端看不到子网', 'Linux 默认不接收路由，需要 `--accept-routes`。'],
          ['网关重启后子网失联', '设备密钥过期会导致 fail close：路由仍在但不可达。给网关关闭密钥过期或做高可用。'],
          ['重叠网段只走一条路', '路由按最长前缀静态匹配，不做动态回退。让较宽的网段同时通告更具体的前缀来兜底。'],
          ['Apple TV 网关只通 IPv4', 'Apple TV 作为子网路由器时不支持 IPv6 子网。'],
        ],
      },
    ],
  },
  {
    slug: 'exit-nodes',
    title: '退出节点',
    navTitle: '退出节点',
    group: '网络',
    description: '让全部上网流量从指定设备出去，行为等同于传统 VPN。',
    minutes: 7,
    blocks: [
      {
        kind: 'p',
        text: '默认情况下 Tailscale 只管设备之间的流量，不管你去 Google 或 B 站的上网流量。**退出节点**改变这一点：把某台设备设为出口，其他设备的上网流量全部经它转发——本质上是把默认路由 `0.0.0.0/0` 和 `::/0` 指过去。',
      },
      { kind: 'h2', id: 'why', text: '什么时候需要' },
      {
        kind: 'list',
        items: [
          '在不可信的公共 Wi-Fi 上，给全部流量加一层加密。',
          '出差时需要访问只在本国可用的服务。',
          '合规要求所有员工上网必须经过公司出口。',
          '从不同地区测试自己的应用。',
        ],
      },
      { kind: 'h2', id: 'setup', text: '三步配置' },
      {
        kind: 'steps',
        items: [
          {
            title: '把设备声明为退出节点',
            text: '在作为出口的设备上执行。Android、iOS、macOS、Windows 也可以在客户端界面里打开对应开关。',
            code: {
              label: 'Linux / macOS 命令行',
              code: `sudo tailscale set --advertise-exit-node`,
            },
          },
          {
            title: '在管理控制台批准',
            text: 'Machines 页面找到带 Exit Node 标记的设备，打开路由设置并勾选 Use as exit node。只有 Owner、Admin 或 Network admin 能批准。',
          },
          {
            title: '在客户端选择出口',
            text: '每台设备都要单独选择，不会自动生效。',
            code: {
              label: '命令行方式',
              code: `sudo tailscale set --exit-node=<出口设备的 IP 或名字>
# 想同时保留对本地局域网的访问：
sudo tailscale set --exit-node=<出口设备> --exit-node-allow-lan-access`,
            },
          },
        ],
      },
      {
        kind: 'p',
        text: '验证是否生效：查一下自己的公网 IP，应该显示出口节点的地址，而不是本机所在地的地址。',
      },
      { kind: 'h2', id: 'acl', text: '最容易出错的一步：权限' },
      {
        kind: 'p',
        text: '默认策略下，tailnet 里的成员都能使用退出节点，不需要额外配置。但一旦你自定义了策略文件，就必须显式授权 `autogroup:internet`，否则选择出口会失败。',
      },
      {
        kind: 'code',
        label: '策略文件片段',
        code: `{
  "grants": [
    {
      "src": ["group:travel"],
      "dst": ["autogroup:internet"],
      "ip": ["*"]
    }
  ]
}`,
      },
      {
        kind: 'note',
        tone: 'warn',
        title: '别把出口设备本身写成目标',
        text: '把 `dst` 写成出口设备的地址，只允许你连接这台设备（比如 SSH），并不允许把它当作上网网关。要授权的是 `autogroup:internet`。',
      },
      { kind: 'h2', id: 'caveats', text: '限制' },
      {
        kind: 'list',
        items: [
          'Android 上的退出节点是用户态实现，性能和稳定性都不适合长期使用。',
          '默认情况下，使用退出节点后会失去对本地局域网的访问，需要单独开启 LAN access。',
          '出口节点的密钥过期后会 fail close：路由还在，但流量不通。长期运行的出口节点应关闭密钥过期，或部署多个做高可用。',
          '出口节点会看到你的目标地址。企业环境可开启目标日志，但这需要相应套餐与合同。',
        ],
      },
    ],
  },
  {
    slug: 'magicdns',
    title: 'MagicDNS',
    navTitle: 'MagicDNS',
    group: '网络',
    description: '给每台设备一个能直接 ping 通的名字，不用再记 100.x 的地址。',
    minutes: 5,
    blocks: [
      {
        kind: 'p',
        text: 'MagicDNS 会为 tailnet 里的每台设备自动注册 DNS 名称。加了一台叫 `my-server` 的机器之后，浏览器地址栏、`ssh`、`ping` 里直接写 `my-server` 就行，不用查它的 Tailscale IP。',
      },
      { kind: 'h2', id: 'enable', text: '开启' },
      {
        kind: 'p',
        text: '2022 年 10 月 20 日之后创建的 tailnet 默认开启。老网络可以在管理控制台的 **DNS** 页面打开开关。开启后 Tailscale 会同时下发搜索域，所以你只写机器名也能解析。',
      },
      { kind: 'h2', id: 'names', text: '完整域名怎么来的' },
      {
        kind: 'p',
        text: '每台设备都有一个完全限定域名（FQDN），由**机器名**加上 **tailnet DNS 名**组成：',
      },
      {
        kind: 'table',
        head: ['机器名', 'tailnet DNS 名', '完整域名'],
        rows: [
          ['monitoring', 'yak-bebop.ts.net', 'monitoring.yak-bebop.ts.net'],
          ['johns-iphone', 'tailab12.ts.net', 'johns-iphone.tailab12.ts.net'],
        ],
      },
      {
        kind: 'p',
        text: '下面两条命令等价，日常用短名字即可：',
      },
      {
        kind: 'code',
        label: '两种写法',
        code: `ping monitoring
ping monitoring.yak-bebop.ts.net`,
      },
      {
        kind: 'note',
        tone: 'warn',
        title: '共享设备必须用完整域名',
        text: '别人共享给你的设备出于安全考虑，只能用 FQDN 访问，短名字不解析。例如 `ping webserver.example2.ts.net`。',
      },
      { kind: 'h2', id: 'rename', text: '改名' },
      {
        kind: 'p',
        text: 'DNS 记录跟随机器名。在管理控制台修改设备名后，解析记录会自动更新，不需要手动维护。',
      },
      { kind: 'h2', id: 'disable', text: '关闭或排障' },
      {
        kind: 'p',
        text: '如果某台设备解析异常，可以先让它不接收 Tailscale 下发的 DNS 设置，用来判断问题是否出在 MagicDNS：',
      },
      {
        kind: 'code',
        label: 'Linux',
        code: `sudo tailscale set --accept-dns=false`,
      },
      {
        kind: 'p',
        text: 'macOS 打开菜单栏图标里的 **Preferences**，取消 **Use Tailscale DNS settings**；Windows 按住 `Shift` 右键托盘图标，取消 **Use Tailscale DNS**。',
      },
      {
        kind: 'p',
        text: '另外，macOS 上的 `host`、`nslookup` 这类工具会绕过系统 DNS 解析，MagicDNS 对它们无效——但 `ping`、浏览器、`ssh` 都正常。',
      },
    ],
  },
  {
    slug: 'access-control',
    title: '访问控制',
    navTitle: '访问控制',
    group: '安全与参考',
    description: '策略文件是唯一的权限来源：默认拒绝，按身份与标签逐条放行。',
    minutes: 8,
    blocks: [
      {
        kind: 'p',
        text: 'Tailscale 的权限模型是“默认拒绝”：网络里的连接只有在策略文件中被明确允许时才成立。策略文件是 tailnet 的唯一权限来源，写在管理控制台的 **Access controls** 页面里。',
      },
      {
        kind: 'note',
        tone: 'info',
        title: '新建网络自带一份放行策略',
        text: '新建的 tailnet 会带一份允许成员互相访问的默认策略，方便你先把网络跑起来。真实环境应当尽早替换成最小权限规则，再邀请成员。',
      },
      { kind: 'h2', id: 'grants', text: 'Grants 与 ACL' },
      {
        kind: 'p',
        text: '写规则有两种语法：**Grants** 是推荐方式，统一描述网络层与应用层能力；**ACL** 是早期语法，仍然长期支持。新策略直接用 Grants。',
      },
      { kind: 'h2', id: 'selectors', text: '用什么描述“谁”和“谁”' },
      {
        kind: 'table',
        head: ['选择器', '例子', '说明'],
        rows: [
          ['用户', '`alice@example.com`', '具体的人'],
          ['组', '`group:dev`', '在策略文件的 groups 里定义'],
          ['标签', '`tag:prod`', '给设备打标签，适合服务器与共享资源'],
          ['自动组', '`autogroup:member`', 'tailnet 内所有成员'],
          ['网段', '`192.168.1.0/24`', '子网路由器背后的地址'],
          ['公网出口', '`autogroup:internet`', '仅用于授权退出节点'],
        ],
      },
      { kind: 'h2', id: 'example', text: '一份可用的策略' },
      {
        kind: 'p',
        text: '下面这份策略做三件事：定义开发组；允许开发组访问生产标签的机器；允许他们通过退出节点上网。',
      },
      {
        kind: 'code',
        label: 'policy file',
        code: `{
  "groups": {
    "group:dev": ["alice@example.com", "bob@example.com"]
  },
  "tagOwners": {
    "tag:prod": ["group:dev"]
  },
  "grants": [
    {
      "src": ["group:dev"],
      "dst": ["tag:prod"],
      "ip": ["tcp:22", "tcp:443"]
    },
    {
      "src": ["group:dev"],
      "dst": ["autogroup:internet"],
      "ip": ["*"]
    }
  ]
}`,
      },
      {
        kind: 'p',
        text: '`ip` 字段控制协议与端口。`tcp:443` 只放行 HTTPS；`*:*` 表示全部。规则是白名单，没写到的组合一律不通。',
      },
      { kind: 'h2', id: 'ssh', text: 'Tailscale SSH' },
      {
        kind: 'p',
        text: 'Tailscale SSH 把 SSH 认证也交给身份系统：不用分发公钥，策略文件批准谁可以连哪台机器，连接时就按身份校验，还能按需记录会话。对需要审计的环境，这比维护 `authorized_keys` 可靠。',
      },
      { kind: 'h2', id: 'practice', text: '实践建议' },
      {
        kind: 'list',
        items: [
          '服务器用标签而不是个人账号归属，人走了权限还在。',
          '先写策略再拉人，避免默认策略期间的横向访问。',
          '按端口授权，不要整段 `*`，尤其是数据库端口。',
          '把策略文件纳入版本管理，改动走审查流程。',
        ],
      },
    ],
  },
  {
    slug: 'cli',
    title: '命令行参考',
    navTitle: '命令行参考',
    group: '安全与参考',
    description: '日常最常用的 tailscale 子命令与参数，按场景分组。',
    minutes: 6,
    blocks: [
      {
        kind: 'p',
        text: '`tailscale` 是客户端命令行工具，`tailscaled` 是后台守护进程。绝大多数操作都通过 `tailscale` 完成，需要特权的命令前面加 `sudo`。',
      },
      { kind: 'h2', id: 'daily', text: '日常命令' },
      {
        kind: 'table',
        head: ['命令', '作用'],
        rows: [
          ['`tailscale up`', '连接网络并应用参数'],
          ['`tailscale down`', '断开连接，保留登录状态'],
          ['`tailscale status`', '查看设备列表与连接方式'],
          ['`tailscale status --json`', '机器可读输出，适合脚本'],
          ['`tailscale ip -4`', '查看本机 Tailscale IPv4'],
          ['`tailscale ping <peer>`', '测试路径：直连还是 DERP'],
          ['`tailscale netcheck`', '检测 NAT 类型、UDP 与 DERP 延迟'],
          ['`tailscale version`', '查看客户端与协议版本'],
        ],
      },
      { kind: 'h2', id: 'up-flags', text: 'tailscale up 常用参数' },
      {
        kind: 'code',
        label: '一次性应用多个设置',
        code: `sudo tailscale up \\
  --hostname=gateway-hk \\
  --advertise-routes=10.0.0.0/16 \\
  --advertise-exit-node \\
  --accept-routes \\
  --ssh`,
      },
      {
        kind: 'table',
        head: ['参数', '含义'],
        rows: [
          ['`--hostname`', '覆盖设备在 tailnet 里显示的名字'],
          ['`--advertise-routes`', '通告子网路由，逗号分隔 CIDR'],
          ['`--advertise-exit-node`', '声明自己可作为退出节点'],
          ['`--accept-routes`', '接收其他设备通告的子网路由（Linux 必需）'],
          ['`--exit-node`', '使用指定设备作为上网出口'],
          ['`--exit-node-allow-lan-access`', '走出口时仍可访问本地局域网'],
          ['`--ssh`', '启用 Tailscale SSH'],
          ['`--shields-up`', '拒绝所有主动入站连接'],
        ],
      },
      { kind: 'h2', id: 'serve', text: '把本地服务分享出去' },
      {
        kind: 'p',
        text: '`tailscale serve` 把本机端口发布到 tailnet 内部，只有网络里的设备能访问；`tailscale funnel` 则进一步暴露到公网。两者都需要在策略文件里授权，funnel 还要求 HTTPS 证书。',
      },
      {
        kind: 'code',
        label: '在 tailnet 内发布 3000 端口',
        code: `tailscale serve --bg 3000
tailscale serve status`,
      },
      {
        kind: 'note',
        tone: 'warn',
        title: 'funnel 是对公网开放',
        text: '执行 `tailscale funnel` 前先确认策略与内容都没问题。它绕过了“只有 tailnet 内可访问”的保护，暴露面等于公网。',
      },
      { kind: 'h2', id: 'debug', text: '排障' },
      {
        kind: 'code',
        label: '常用诊断组合',
        code: `tailscale netcheck          # 网络环境是否支持直连
tailscale ping peer         # 具体到某台设备的路径
tailscale status            # 对端是否在线、是否过期
tailscale bugreport         # 生成诊断包，提交问题时附上`,
      },
      {
        kind: 'p',
        text: '如果 `status` 里对端显示 `offline`，先确认它真的在线并且客户端在运行；显示 `expired` 则是密钥过期，需要在管理控制台重新认证。',
      },
    ],
  },
  {
    slug: 'faq',
    title: '常见问题',
    navTitle: '常见问题',
    group: '安全与参考',
    description: '关于公网 IP、流量路径、开源范围与平台支持的短答案。',
    minutes: 5,
    blocks: [
      { kind: 'h2', id: 'public-ip', text: '需要公网 IP 或端口转发吗？' },
      {
        kind: 'p',
        text: '不需要。设备只要能出站访问互联网，客户端就会自己完成 NAT 穿透。只有在极端受限的网络里才会退回到 DERP 中继，仍然可用，只是多绕一跳。',
      },
      { kind: 'h2', id: 'traffic', text: '流量会经过 Tailscale 的服务器吗？' },
      {
        kind: 'p',
        text: '默认不经过。协调服务器只分发设备列表与公钥，不碰业务数据。两端无法直连时，数据经 DERP 中继转发，但仍是端到端加密的，中继看不到明文。',
      },
      { kind: 'h2', id: 'vs-vpn', text: '它和传统 VPN 是什么关系？' },
      {
        kind: 'p',
        text: '默认是点对点网状网络，不是中心网关。需要传统 VPN 的“全部流量走一个出口”时，把某台设备设为[退出节点](/docs/exit-nodes)，行为就一样了。',
      },
      { kind: 'h2', id: 'open-source', text: '哪些部分是开源的？' },
      {
        kind: 'p',
        text: '守护进程 `tailscaled` 与命令行工具 `tailscale` 开源，iOS 与 Android 客户端复用了同一套代码。macOS、iOS、Windows 上的 GUI 外壳以及托管协调服务本身不开源。仓库地址是 [github.com/tailscale/tailscale](https://github.com/tailscale/tailscale)。',
      },
      { kind: 'h2', id: 'platforms', text: '支持哪些系统？' },
      {
        kind: 'p',
        text: '`tailscaled` 可运行在 Linux、Windows、macOS 上，FreeBSD 与 OpenBSD 上也有不同程度支持；移动端有 iOS 与 Android 应用。路由器、NAS 等平台还有社区或官方打包的套件。',
      },
      { kind: 'h2', id: 'free', text: '个人用要花钱吗？' },
      {
        kind: 'p',
        text: '有面向个人的免费方案，设备数与功能额度以官网定价页为准。团队规模、SSO、日志等能力属于付费范围。本站不复制价格，避免过期信息。',
      },
      { kind: 'h2', id: 'self-host', text: '能自己搭协调服务器吗？' },
      {
        kind: 'p',
        text: '官方提供的协调服务器是托管服务，不在开源仓库范围内。客户端与守护进程开源，因此社区有第三方控制平面的实现，但它们不属于官方支持范围，功能与兼容性需要自行评估。',
      },
      { kind: 'h2', id: 'key-expiry', text: '设备突然连不上了？' },
      {
        kind: 'p',
        text: '先看 `tailscale status`。如果对端标记为 `expired`，是密钥过期，去管理控制台重新认证；如果是子网路由器或退出节点，检查它通告的路由是否仍然被批准。密钥过期会触发 fail close：路由保留但不可达。',
      },
      { kind: 'h2', id: 'ipv6', text: '支持 IPv6 吗？' },
      {
        kind: 'p',
        text: '支持。Tailscale 会给设备分配 IPv4 与 IPv6 地址，子网路由也可以通告 IPv6 网段。例外是 Apple TV 作为子网路由器时只支持 IPv4。',
      },
      { kind: 'h2', id: 'about-site', text: '这个站点是官方的吗？' },
      {
        kind: 'p',
        text: '不是。本站是中文导读站点，内容依据开源仓库的 README 与 tailscale.com/docs 整理，用中文重新组织表述，不是官方文档的逐字翻译。涉及计费、合规与最新行为时，请以官方英文文档为准。',
      },
    ],
  },
]

export const docGroups: DocGroup[] = ['入门', '网络', '安全与参考']

export function getDoc(slug: string): Doc | undefined {
  return docs.find((doc) => doc.slug === slug)
}

export function getDocNeighbours(slug: string) {
  const index = docs.findIndex((doc) => doc.slug === slug)
  return {
    previous: index > 0 ? docs[index - 1] : undefined,
    next: index >= 0 && index < docs.length - 1 ? docs[index + 1] : undefined,
  }
}

export function getHeadings(doc: Doc) {
  return doc.blocks
    .filter((block): block is Extract<Block, { kind: 'h2' | 'h3' }> => block.kind === 'h2' || block.kind === 'h3')
    .map((block) => ({
      id: block.id,
      text: block.text,
      level: (block.kind === 'h2' ? 2 : 3) as 2 | 3,
    }))
}

export const searchIndex = docs.map((doc) => ({
  slug: doc.slug,
  title: doc.title,
  description: doc.description,
  group: doc.group,
  keywords: `${doc.title} ${doc.description} ${doc.blocks
    .map((block) => {
      if (block.kind === 'p' || block.kind === 'h2' || block.kind === 'h3') return block.text
      if (block.kind === 'list') return block.items.join(' ')
      return ''
    })
    .join(' ')}`,
}))
