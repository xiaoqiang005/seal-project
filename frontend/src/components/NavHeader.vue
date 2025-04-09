<template>
  <div class="nav-header">
    <div class="left">
      <div class="logo-text">海南省特种行业治安综合管理信息系统印章子系统</div>
      <div class="menu-wrapper">
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          @select="handleSelect"
          class="main-menu"
          background-color="transparent"
          text-color="#333"
          active-text-color="#409EFF"
        >
          <el-menu-item index="home">首页</el-menu-item>
          <el-menu-item index="business">业务管理</el-menu-item>
          <el-menu-item index="daily">日常管理</el-menu-item>
          <el-menu-item index="permission">权限管理</el-menu-item>
          <el-menu-item index="help">帮助中心</el-menu-item>
          <el-menu-item index="online">在线中心</el-menu-item>
        </el-menu>
      </div>
    </div>
    
    <div class="right">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="account-settings">
          账户设置<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="account-info">账户信息</el-dropdown-item>
            <el-dropdown-item command="change-password">修改密码</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <el-button 
        link
        class="logout-btn"
        @click="confirmLogout"
      >
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义事件
const emit = defineEmits(['logout', 'menu-change'])

// 定义属性
const props = defineProps({
  loginDuration: {
    type: String,
    required: true
  },
  activeMenu: {
    type: String,
    required: true
  }
})

const activeMenu = ref(props.activeMenu)

// 监听props变化
watch(() => props.activeMenu, (newVal: string) => {
  activeMenu.value = newVal
})

const handleSelect = (index: string) => {
  activeMenu.value = index
  emit('menu-change', index)
  
  // 添加路由跳转逻辑
  const routeMap = {
    'home': '/',
    'business': '/business/orders',
    'daily': '/daily/manufacturers',
    'permission': '/permission/organization',
    'help': '/help/drivers',
    'online': '/online/service'
  } as const
  
  if (routeMap[index as keyof typeof routeMap]) {
    router.push(routeMap[index as keyof typeof routeMap])
  }
}

const handleCommand = (command: string) => {
  // 处理账户设置下拉菜单选项
  console.log('处理账户设置：', command)
}

const confirmLogout = () => {
  ElMessageBox.confirm(
    `您已登录 ${props.loginDuration}，确定要退出吗？`,
    '退出提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('logout')
  })
}
</script>

<style scoped>
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.left {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-right: 40px;
  white-space: nowrap;
}

.menu-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.main-menu {
  border-bottom: none;
  white-space: nowrap;
  display: flex;
}

:deep(.el-menu) {
  border-bottom: none !important;
}

:deep(.el-menu--horizontal) {
  border: none;
}

:deep(.el-menu--horizontal > .el-menu-item) {
  float: none;
  display: inline-flex;
  align-items: center;
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  position: relative;
  text-decoration: none;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  vertical-align: middle;
}

.el-menu-item {
  font-size: 16px;
  transition: all 0.3s;
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background: linear-gradient(90deg, #409EFF 0%, #87CEFA 100%);
  color: #fff !important;
}

.el-menu-item.is-active {
  border-bottom: 2px solid #409EFF !important;
  font-weight: bold;
  color: #409EFF !important;
}

.right {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 20px;
}

.account-settings {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
}

.account-settings:hover {
  color: #409EFF;
}

.logout-btn {
  color: #606266;
}

.logout-btn:hover {
  color: #f56c6c;
}
</style> 