<template>
  <div class="page-container">
    <page-title title="菜单管理" />
    <div class="operation-bar">
      <el-button type="primary">添加菜单</el-button>
      <el-input
        placeholder="请输入菜单名称"
        prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>
    
    <el-card class="table-card">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="菜单名称" />
        <el-table-column prop="path" label="路由路径" />
        <el-table-column prop="icon" label="图标" align="center">
          <template #default="scope">
            <el-icon v-if="scope.row.icon">
              <component :is="scope.row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template #default>
            <div class="operation-buttons">
              <el-button type="primary" size="small">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button type="success" size="small">
                <el-icon><Plus /></el-icon>
                <span>添加子菜单</span>
              </el-button>
              <el-button type="danger" size="small">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <common-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        @pagination="handlePagination"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import CommonPagination from '@/components/CommonPagination.vue'
import { Edit, Plus, Delete } from '@element-plus/icons-vue'

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const handlePagination = (page: number, size: number) => {
  console.log('当前页:', page, '每页条数:', size)
  // 这里处理分页逻辑
}

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '权限管理',
    path: '/permission',
    icon: 'Lock',
    sort: 1,
    children: [
      {
        id: 11,
        name: '组织管理',
        path: '/permission/organization',
        icon: 'Office',
        sort: 1
      },
      {
        id: 12,
        name: '角色管理',
        path: '/permission/role',
        icon: 'User',
        sort: 2
      }
    ]
  }
])
</script>

<style scoped>
@import '@/styles/common.css';

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: var(--el-table-row-hover-bg-color);
}
</style> 