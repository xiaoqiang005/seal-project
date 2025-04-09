<template>
  <el-menu
    :collapse="props.collapse"
    :unique-opened="true"
    :default-active="activeMenu"
    class="side-menu"
    @select="handleSelect"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <el-menu-item
      v-for="item in props.menuItems"
      :key="item.path"
      :index="item.path"
    >
      <el-icon v-if="item.icon">
        <component :is="item.icon" />
      </el-icon>
      <template #title>
        {{ item.title }}
      </template>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface MenuItem {
  title: string
  path: string
  icon?: string
}

const props = defineProps({
  collapse: Boolean,
  menuItems: {
    type: Array,
    required: true,
    validator: (value: unknown): value is MenuItem[] => {
      return Array.isArray(value) && value.every(item => 
        typeof item === 'object' &&
        item !== null &&
        'title' in item &&
        'path' in item
      )
    }
  }
})

const emit = defineEmits(['select'])

const route = useRoute()
const router = useRouter()
const activeMenu = ref(route.path)

// 设置初始活动菜单
const setInitialActiveMenu = () => {
  const currentPath = route.path
  if (currentPath === '/help') {
    activeMenu.value = '/help/drivers'
    router.push('/help/drivers')
  } else {
    activeMenu.value = currentPath
  }
}

onMounted(() => {
  setInitialActiveMenu()
})

// 监听路由变化
watch(() => route.path, (newPath: string) => {
  if (newPath === '/help') {
    activeMenu.value = '/help/drivers'
  } else {
    activeMenu.value = newPath
  }
})

const handleSelect = (index: string) => {
  activeMenu.value = index
  router.push(index)
  emit('select', index)
}
</script>

<style scoped>
.side-menu {
  height: 100%;
  border-right: none;
}

.side-menu:not(.el-menu--collapse) {
  width: 200px;
}

/* 自定义滚动条样式 */
.side-menu {
  overflow-y: auto;
}

.side-menu::-webkit-scrollbar {
  width: 6px;
}

.side-menu::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

.side-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}

.side-menu::-webkit-scrollbar-track {
  background: transparent;
}

/* 菜单项样式 */
.el-menu-item {
  transition: all 0.3s;
}

.el-menu-item.is-active {
  background-color: #1890ff !important;
  color: #fff !important;
}

.el-menu-item:hover {
  background-color: rgba(24, 144, 255, 0.1);
}

/* 图标样式 */
.el-icon {
  margin-right: 10px;
  font-size: 18px;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}
</style> 