<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header height="60px">
      <nav-header 
        @logout="handleLogout"
        @menu-change="handleMenuChange"
        :loginDuration="loginDuration"
        :activeMenu="activeMenu"
      />
    </el-header>
    
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" v-show="showSidebar">
        <side-menu 
          :collapse="isCollapse"
          :menuItems="currentMenuItems"
          @select="handleMenuSelect"
        />
      </el-aside>
      
      <!-- 主要内容区 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavHeader from '@/components/NavHeader.vue'
import SideMenu from '@/components/SideMenu.vue'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)
const showSidebar = ref(true)
const loginDuration = ref('0小时0分钟')
const activeMenu = ref('home' as const)

interface MenuItem {
  title: string
  path: string
  icon: string
}

type MenuConfig = {
  home: never[]
  business: MenuItem[]
  daily: MenuItem[]
  permission: MenuItem[]
  help: MenuItem[]
  online: MenuItem[]
  account: MenuItem[]
}

// 菜单配置
const menuConfig: MenuConfig = {
  home: [],
  business: [
    { title: '订单查询', path: '/business/orders', icon: 'Document' },
    { title: '印章查询', path: '/business/seals', icon: 'Search' },
    { title: '使用单位管理', path: '/business/units', icon: 'OfficeBuilding' },
    { title: '经办人管理', path: '/business/agents', icon: 'User' },
    { title: '印章预录', path: '/business/pre-record', icon: 'Edit' },
    { title: '承接制作', path: '/business/undertake', icon: 'Stamp' },
    { title: '交付管理', path: '/business/delivery', icon: 'TakeawayBox' },
    { title: '挂失报废', path: '/business/lost', icon: 'Warning' },
    { title: '旧印章收缴销毁', path: '/business/destroy', icon: 'Delete' }
  ],
  daily: [
    { title: '制作单位管理', path: '/daily/manufacturers', icon: 'House' },
    { title: '从业人员管理', path: '/daily/employees', icon: 'User' },
    { title: '可疑情况管理', path: '/daily/suspicious', icon: 'Warning' }
  ],
  permission: [
    { title: '区域管理', path: '/permission/organization', icon: 'OfficeBuilding' },
    { title: '主管单位管理', path: '/permission/supervisor', icon: 'School' },
    { title: '角色管理', path: '/permission/role', icon: 'UserFilled' },
    { title: '刻章企业管理', path: '/permission/user', icon: 'Stamp' },
    { title: '菜单管理', path: '/permission/menu', icon: 'Menu' }
  ],
  help: [
    { title: '驱动下载', path: '/help/drivers', icon: 'Download' },
    { title: '操作手册', path: '/help/manual', icon: 'Document' },
    { title: '操作视频', path: '/help/videos', icon: 'VideoCamera' }
  ],
  online: [
    { title: '在线客服', path: '/online/service', icon: 'Service' },
    { title: '在线留言', path: '/online/message', icon: 'ChatDotRound' },
    { title: '客服电话', path: '/online/phone', icon: 'Phone' }
  ],
  account: [
    { title: '账户信息', path: '/account/info', icon: 'User' },
    { title: '修改密码', path: '/account/password', icon: 'Lock' }
  ]
}

// 根据当前路由设置激活的菜单
const setActiveMenuByRoute = (path: string) => {
  if (path === '/' || path === '') {
    activeMenu.value = 'home'
    showSidebar.value = false
    return
  }
  
  // 从路径中提取主菜单部分
  const mainPath = path.split('/')[1]
  
  if (mainPath && mainPath in menuConfig) {
    activeMenu.value = mainPath as keyof MenuConfig
    showSidebar.value = true
    // 如果是帮助中心的根路径，重定向到驱动下载页面
    if (mainPath === 'help' && path === '/help') {
      router.push('/help/drivers')
    }
  } else {
    activeMenu.value = 'home'
    showSidebar.value = false
  }
}

// 当前显示的菜单项
const currentMenuItems = computed(() => {
  const menu = activeMenu.value as keyof MenuConfig
  return menuConfig[menu]
})

// 监听路由变化
watch(() => route.path, (newPath: string) => {
  setActiveMenuByRoute(newPath)
}, { immediate: true })

// 生命周期钩子
onMounted(() => {
  // 刷新页面时确保根据URL路径设置正确的状态
  const path = window.location.pathname
  setActiveMenuByRoute(path)
})

// 处理顶部菜单切换
const handleMenuChange = (menu: keyof MenuConfig) => {
  activeMenu.value = menu
  showSidebar.value = menu !== 'home'
  
  // 根据菜单跳转到对应的路由
  if (menu === 'home') {
    router.push('/')
  } else {
    // 对于帮助中心，直接跳转到驱动下载页面
    if (menu === 'help') {
      router.push('/help/drivers')
    } else if (menuConfig[menu].length > 0) {
      router.push(menuConfig[menu][0].path)
    }
  }
}

// 处理侧边栏菜单选择
const handleMenuSelect = (path: string) => {
  router.push(path)
}

// 退出登录处理
const handleLogout = async () => {
  // 处理退出登录逻辑
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  transition: width 0.3s;
  background-color: #304156;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

@media (forced-colors: active) {
  .el-aside, .el-menu, .el-menu-item {
    forced-color-adjust: none;
  }
}

:deep(.el-menu--horizontal > .el-menu-item) {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
</style> 