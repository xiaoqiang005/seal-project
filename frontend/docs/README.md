---
home: true
heroImage: /images/logo.png
heroText: 前端项目文档
tagline: 基于 Vue 3 + TypeScript 的前端项目
actions:
  - text: 快速开始 →
    link: /guide/
    type: primary
features:
  - title: Vue 3 + TypeScript
    details: 使用 Vue 3 Composition API 和 TypeScript 开发，提供更好的类型支持和开发体验
  - title: Element Plus
    details: 使用 Element Plus 组件库，提供美观且功能丰富的 UI 组件
  - title: 最佳实践
    details: 遵循前端开发最佳实践，包括代码规范、性能优化、测试等
footer: MIT Licensed | Copyright © 2024
---

## 项目概述

这是一个基于 Vue 3 + TypeScript + Element Plus 的前端项目。

## 目录结构

```
frontend/
├── src/
│   ├── api/        # API 接口
│   ├── components/ # 组件
│   ├── router/     # 路由配置
│   ├── store/      # 状态管理
│   ├── utils/      # 工具函数
│   ├── views/      # 页面
│   └── App.vue     # 根组件
└── docs/           # 文档
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 文档导航

- [组件文档](./components/) - 查看所有可用组件
- [API 接口](./api/) - 查看后端 API 接口文档
- [工具函数](./utils/) - 查看通用工具函数 