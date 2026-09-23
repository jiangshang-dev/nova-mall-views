# Nova Mall Views

> Nova Mall **C 端商城前台** · Vue 3 + Vite + Ant Design Vue

<p align="center">
  <a href="https://github.com/jiangshang-dev/nova-mall-views/stargazers"><img src="https://img.shields.io/github/stars/jiangshang-dev/nova-mall-views?style=for-the-badge&logo=github" alt="Stars"/></a>
  <a href="https://github.com/jiangshang-dev/nova-mall-views/network/members"><img src="https://img.shields.io/github/forks/jiangshang-dev/nova-mall-views?style=for-the-badge" alt="Forks"/></a>
  <img src="https://img.shields.io/badge/Vue-3.5-brightgreen?style=for-the-badge&logo=vuedotjs" alt="Vue"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/Ant%20Design%20Vue-4-0170FE?style=for-the-badge&logo=antdesign" alt="AntDV"/>
</p>

<p align="center">
  <a href="https://github.com/jiangshang-dev/nova-mall">后端 API</a> ·
  <b>商城前台（本仓库）</b> ·
  <a href="https://github.com/jiangshang-dev/nova-mall-back">管理后台</a>
</p>

---

## ⭐ 开源约定

> **请先 Star，再 Clone。**  
> 未点星禁止 Clone（君子协议，开源江湖规矩）。

顺手把姊妹仓库也 Star 一下，方便完整跑通：

| 仓库 | 角色 |
|------|------|
| [nova-mall](https://github.com/jiangshang-dev/nova-mall) | 后端（必须） |
| [nova-mall-views](https://github.com/jiangshang-dev/nova-mall-views) | 本仓库 · 前台 |
| [nova-mall-back](https://github.com/jiangshang-dev/nova-mall-back) | 管理后台 |

```bash
# 1. 浏览器点亮 Star
# 2. 再拉代码
git clone https://github.com/jiangshang-dev/nova-mall-views.git
```

---

## 简介

面向消费者的 B2C 商城前端，京东风布局，对接 Nova Mall 后端 REST / WebSocket。

### 已实现能力

- 首页分类导航、商品列表与搜索  
- 商品详情（图文 / 评价 / 加购 / 立即购买）  
- 购物车、确认订单（地址 · 配送 · 运费 · 支付宝/微信/货到付款）  
- 微信扫码收银台（演示码 / 真实 Native）  
- 个人中心（资料、头像、收货地址、订单）  
- 右下角人工客服浮窗（WebSocket）  

---

## 技术栈

- Vue 3.5 + Vue Router  
- Vite 6  
- Ant Design Vue 4  
- Axios  

---

## 快速开始

### 前置条件

1. 已启动后端：[nova-mall](https://github.com/jiangshang-dev/nova-mall)（默认 `http://localhost:8082`）  
2. Node.js 18+  

### 安装与运行

```bash
npm install
npm run dev
```

- 本地地址：http://localhost:5173  
- `/api`、`/ws` 默认代理到 `http://localhost:8082`（见 `vite.config.js`）  

### 环境变量（可选）

可在 `.env.development` 中配置，例如：

```env
VITE_PORT=5173
VITE_PROXY_URL=http://localhost:8082
VITE_GLOB_API_URL=/api
```

### 演示账号

- 账号：`user@nova.com` / `user`  
- 密码：`admin123`  
- 也可页面「免费注册」  

---

## 目录结构（简）

```
src/
├── api/           # 接口封装
├── views/         # 页面（home / goods / cart / order / user …）
├── layouts/       # MallShell 布局
├── components/    # 通用组件（含 CsWidget 客服）
├── router/        # 路由
└── data/          # 省市区 JSON 等
```

---

## 与后端联调

| 能力 | 说明 |
|------|------|
| HTTP | `Access-Token` 请求头 |
| 客服 | `ws://host/ws/cs?Access-Token=...&role=member` |
| 支付 | 收银台页自动拉微信 Native 二维码 |

完整架构与支付配置见后端 README：  
https://github.com/jiangshang-dev/nova-mall

---

## License

与主仓库一致，建议使用 [MIT](https://opensource.org/licenses/MIT)。  
喜欢就给个 **Star**，谢谢支持！

<p align="center">
  <sub>Part of <a href="https://github.com/jiangshang-dev/nova-mall">Nova Mall</a></sub>
</p>
