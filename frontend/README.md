# Seal Project Frontend

基于 Vue 3 + TypeScript 的前端项目。

## 项目结构

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

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 生成文档

```bash
npm run docs
```

## API 文档

API 文档使用 JSDoc 生成，您可以在 `docs` 目录下找到生成的文档。 