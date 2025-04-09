import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { router } from './router'
import './styles/index.css'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用ElTimeline和ElTimelineItem组件
import { ElTimeline, ElTimelineItem } from 'element-plus'

// 全局使用ElementPlus
app.use(ElementPlus, {
  size: 'default',
  locale: zhCn
})
// 使用路由
app.use(router)
app.mount('#app') 