# Tailscale

https://tailscale.com

让私有 WireGuard® 网络变得简单

## 概述

本仓库包含 Tailscale 绝大部分开源代码。
其中尤其包括 `tailscaled` 守护进程与
`tailscale` 命令行工具。`tailscaled` 守护进程可运行于 Linux、Windows、
[macOS](https://tailscale.com/kb/1065/macos-variants/) 上，并在
FreeBSD 与 OpenBSD 上以不同程度的支持运行。Tailscale 的 iOS 与 Android
应用复用了本仓库的代码，但本仓库并不包含移动端 GUI 代码。

其他值得关注的 [Tailscale 仓库](https://github.com/orgs/tailscale/repositories)：

* Android 应用：https://github.com/tailscale/tailscale-android
* Synology 套件：https://github.com/tailscale/tailscale-synology
* QNAP 套件：https://github.com/tailscale/tailscale-qpkg
* Chocolatey 打包：https://github.com/tailscale/tailscale-chocolatey

如需了解 Tailscale 哪些部分是开源的以及背后的原因，
请参阅 [https://tailscale.com/opensource/](https://tailscale.com/opensource/)。

## 使用

我们为各类发行版与平台提供安装包，地址在
[https://pkgs.tailscale.com](https://pkgs.tailscale.com/)。

## 其他客户端

[macOS、iOS 与 Windows 客户端](https://tailscale.com/download)
使用了本仓库的代码，但额外附带了小型 GUI 外壳。
非开源平台上的 GUI 外壳本身并不开源。

## 构建

我们始终要求使用最新的 Go 版本，目前是 Go 1.27。（虽然我们使用自己的
[Go 分支](https://github.com/tailscale/go/) 来构建发布版本，但并不强制要求使用它。）

```
go install tailscale.com/cmd/tailscale{,d}
```

如果你要为发行而打包 Tailscale，请改用 `build_dist.sh`
将提交 ID 与版本信息固化到二进制文件中：

```
./build_dist.sh tailscale.com/cmd/tailscale
./build_dist.sh tailscale.com/cmd/tailscaled
```

如果你的发行版有约定禁止使用 `build_dist.sh`，
请按照你发行版的方式做等价处理，
以便错误报告中包含有用的版本信息。

## 缺陷反馈

关于本代码或托管服务的任何问题，请提交到
[问题追踪器](https://github.com/tailscale/tailscale/issues)。

## 贡献

欢迎提交 PR！但请先提交缺陷报告。提交信息应 [引用
缺陷](https://docs.github.com/en/github/writing-on-github/autolinked-references-and-urls)。

我们要求提交中带有 [开发者原创证书（Developer Certificate of
Origin）](https://en.wikipedia.org/wiki/Developer_Certificate_of_Origin)
的 `Signed-off-by` 行。

查看 [commit-messages.md](https://github.com/tailscale/tailscale/blob/main/docs/commit-messages.md)（或浏览 `git log`）了解我们的提交信息规范。

## 关于我们

[Tailscale](https://tailscale.com/) 主要由
https://github.com/orgs/tailscale/people 中的成员开发。其他贡献者请参阅：

* https://github.com/tailscale/tailscale/graphs/contributors
* https://github.com/tailscale/tailscale-android/graphs/contributors

## 法律声明

WireGuard 是 Jason A. Donenfeld 的注册商标。
