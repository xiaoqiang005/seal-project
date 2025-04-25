import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import Login from '../Login.vue'

// Mock Element Plus
vi.mock('element-plus', () => ({
  default: {
    install: vi.fn()
  },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  User: {
    template: '<span>User Icon</span>'
  },
  Lock: {
    template: '<span>Lock Icon</span>'
  }
}))

// 创建测试用的路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: { template: '<div>Home</div>' }
    }
  ]
})

describe('Login.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    router.push('/login')
  })

  it('renders login form', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: {
          'el-form': {
            template: '<form><slot /></form>'
          },
          'el-form-item': {
            template: '<div><slot /></div>'
          },
          'el-input': {
            template: '<input />'
          },
          'el-button': {
            template: '<button><slot /></button>'
          },
          'el-card': {
            template: '<div class="el-card"><slot /></div>'
          }
        }
      }
    })
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('has username and password inputs', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: {
          'el-form': {
            template: '<form><slot /></form>'
          },
          'el-form-item': {
            template: '<div><slot /></div>'
          },
          'el-input': {
            template: '<input />'
          },
          'el-button': {
            template: '<button><slot /></button>'
          },
          'el-card': {
            template: '<div class="el-card"><slot /></div>'
          }
        }
      }
    })
    expect(wrapper.find('[data-test="username"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="password"]').exists()).toBe(true)
  })

  it('has login button', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: {
          'el-form': {
            template: '<form><slot /></form>'
          },
          'el-form-item': {
            template: '<div><slot /></div>'
          },
          'el-input': {
            template: '<input />'
          },
          'el-button': {
            template: '<button><slot /></button>'
          },
          'el-card': {
            template: '<div class="el-card"><slot /></div>'
          }
        }
      }
    })
    expect(wrapper.find('[data-test="login-button"]').exists()).toBe(true)
  })

  it('validates form on submit', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: {
          'el-form': {
            template: '<form><slot /></form>',
            methods: {
              validate: () => Promise.reject()
            }
          },
          'el-form-item': {
            template: '<div><slot /></div>'
          },
          'el-input': {
            template: '<input />'
          },
          'el-button': {
            template: '<button><slot /></button>'
          },
          'el-card': {
            template: '<div class="el-card"><slot /></div>'
          }
        }
      }
    })
    
    // 尝试提交空表单
    await wrapper.find('[data-test="login-button"]').trigger('click')
    await nextTick()
    
    // 应该显示错误消息
    expect(ElMessage.error).toHaveBeenCalledWith('请检查输入信息')
  })

  it('navigates to home on successful login', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: {
          'el-form': {
            template: '<form><slot /></form>',
            methods: {
              validate: () => Promise.resolve()
            }
          },
          'el-form-item': {
            template: '<div><slot /></div>'
          },
          'el-input': {
            template: '<input />'
          },
          'el-button': {
            template: '<button><slot /></button>'
          },
          'el-card': {
            template: '<div class="el-card"><slot /></div>'
          }
        }
      }
    })
    
    // 设置有效的表单数据
    await wrapper.find('[data-test="username"]').setValue('admin')
    await wrapper.find('[data-test="password"]').setValue('password123')
    
    // 提交表单
    await wrapper.find('[data-test="login-button"]').trigger('click')
    await nextTick()
    await router.isReady()
    
    // 验证成功消息和导航
    expect(ElMessage.success).toHaveBeenCalledWith('登录成功')
    expect(router.currentRoute.value.path).toBe('/home')
  })
}) 