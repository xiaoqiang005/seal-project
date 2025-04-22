# Seal Project 文档

这是一个基于 Vue.js 和 Django 的全栈项目文档。

## 快速开始

### 前端开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端开发

```bash
# 安装依赖
pip install -r requirements/dev.txt

# 启动开发服务器
python manage.py runserver
```

## 项目结构

### 前端结构

```
frontend/
├── src/                    # 源代码目录
│   ├── api/               # API 请求
│   ├── assets/            # 静态资源
│   ├── components/        # 组件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── types/             # TypeScript 类型
│   ├── utils/             # 工具函数
│   └── views/             # 页面视图
├── public/                # 公共资源
└── docs/                  # 项目文档
```

### 后端结构

```
backend1/
├── apps/                  # Django 应用
│   ├── organization/      # 组织管理应用
│   └── user/             # 用户管理应用
├── config/                # 项目配置
├── utils/                 # 工具函数
└── requirements/          # 依赖管理
```

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

## 文档导航

- [组件文档](./components/) - 查看所有可用组件
- [API 接口](./api/) - 查看后端 API 接口文档
- [工具函数](./utils/) - 查看通用工具函数 