/// <reference types="vite/client" />
/// <reference types="element-plus/global" />

// 环境变量类型声明
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Vue 相关类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@element-plus/icons-vue' {
  import type { Component } from 'vue'
  export const User: Component
  export const Lock: Component
  export const Search: Component
  export const Folder: Component
  export const FolderOpened: Component
  export const Document: Component
  // ... 其他图标
} 