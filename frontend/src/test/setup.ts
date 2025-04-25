import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'

// 配置全局插件
config.global.plugins = [ElementPlus]

// 模拟 CSS 模块
jest.mock('element-plus/dist/index.css', () => ({})) 