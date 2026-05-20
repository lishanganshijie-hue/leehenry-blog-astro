---
title: "Hermes Agent完整教程：本地部署+Telegram机器人接入"
published: 2026-05-19 21:44:00
description: "😀 本文详细讲解了国内本地部署 Hermes Agent 全攻略：从一键安装到电报机器人深度避坑"
tags: ["AGENT", "SKILL"]
category: "Hermes-叭叭叭"
---

## 一、 安装 Hermes（快速流程）

在开始之前，请确保你的电脑处于**科学上网**环境，国内原生网络无法完成部署。

### 1. Windows 一键安装

以管理员身份运行 **PowerShell**，输入以下命令：

PowerShell

`irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1 | iex`

* **配置建议：** 出现提示时选择 `Quick setup`（快速安装）。
* **模型选择：** 我使用的是 **MiniMax 2.7**，实测响应速度与逻辑水平非常平衡。有能力者建议gpt最新模型

### 2. 常用管理命令

如果安装后窗口关闭，或需要重新调整，请记好这几个“后悔药”命令：

* **重启服务：** `hermes`
* **全部重新配置：** `hermes setup`
* **仅修改 AI 模型：** `hermes setup model`
* **配置 Telegram/微信网关：** `hermes setup gateway`

---

## 二、 Telegram 机器人深度接入

### 1. 基础对接流程

1. 在配置平台时选择：`Telegram`。
2. 在 Telegram 搜索 **@BotFather**，创建 Bot 并获取 **API Token**。
3. 将 Token 粘贴回命令窗口（注意：窗口处于安全保护，**不会显示**字符，粘贴后直接回车即可）。

### 2. 权限安全设置（重要）

为了防止别人盗用你的机器人，必须设置只允许自己的账号使用：

* 在 Telegram 搜索 **@userinfobot** 获取你的账户 **ID**。
* 在 Hermes 配置中填入该 ID。

---

## 三、 避坑指南：机器人没反应怎么办？

如果你的 Telegram 机器人“装死”，请按以下步骤排查。

### 1. 检查依赖环境

新开一个 PowerShell 窗口，输入 `hermes gateway`。 如果报错 `python-telegram-bot not installed`，请依次运行以下命令安装依赖：

PowerShell

\`# 进入 Hermes 核心目录 cd \$env:LOCALAPPDATA\\hermes\\hermes-agent

# 安装并升级环境依赖

.\\venv\\Scripts\\python.exe -m ensurepip .\\venv\\Scripts\\python.exe -m pip install --upgrade pip .\\venv\\Scripts\\python.exe -m pip install python-telegram-bot\`

### 2. 配置国内网络代理（核心）

如果你在境内，Hermes 默认连不上 Telegram 接口。你需要把梯子的 **监听端口** 喂给它（以常用端口 7890 为例）：

PowerShell

`$env:HTTP_PROXY="http://127.0.0.1:7890" $env:HTTPS_PROXY="http://127.0.0.1:7890" hermes gateway`

*注：请将 7890 替换为你实际使用的代理端口（如 Clash 或 V2Ray 的设置）。*

### 3. Windows 兼容性终极补丁

如果设置完代理依然报错，可能是 `status.py` 文件在 Windows 上的兼容性 bug。

* **文件路径：** `C:\Users\你的用户名\AppData\Local\hermes\hermes-agent\gateway\status.py`
* **解决方案：** 替换该文件。
* **补丁下载：** 点击前往夸克网盘下载替换文件 【[**夸克网盘**](https://pan.quark.cn/s/26912a566e78)】

---

## 💡 常见问题 (FAQ)

> **Q: 为什么我输入 API Token 时屏幕没反应？A:** 这是为了安全设计的。实际上内容已经粘贴进去了，你直接敲回车键即可。

> **Q: 每次重启电脑都要重新设置代理端口吗？A:** 是的，在当前会话中设置的临时环境变量关闭后会失效。建议将代理命令写成一个 `.ps1` 脚本，下次一键运行。
>
