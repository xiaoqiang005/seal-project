/// <reference types="vite/client" />

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

declare module 'vue'
declare module 'vue-router'
declare module 'element-plus'
declare module '@element-plus/icons-vue' {
  import type { Component } from 'vue'
  const Search: Component
  const Folder: Component
  const FolderOpened: Component
  const Document: Component
  export { Search, Folder, FolderOpened, Document }
} 