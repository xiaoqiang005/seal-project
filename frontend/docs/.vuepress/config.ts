import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  base: '/',
  lang: 'zh-CN',
  title: '前端项目文档',
  description: '基于 Vue 3 + TypeScript 的前端项目文档',
  port: 3000,
  
  // 使用 vite 打包器
  bundler: viteBundler(),
  
  theme: defaultTheme({
    logo: '/images/logo.png',
    navbar: [
      { text: '首页', link: '/' },
      { text: '组件', link: '/components/' },
      { text: 'API', link: '/api/' },
      { text: '工具函数', link: '/utils/' }
    ],
    sidebar: {
      '/components/': [
        {
          text: '组件文档',
          children: ['/components/README.md']
        }
      ],
      '/api/': [
        {
          text: 'API 文档',
          children: ['/api/README.md']
        }
      ],
      '/utils/': [
        {
          text: '工具函数',
          children: ['/utils/README.md']
        }
      ]
    }
  })
}) 