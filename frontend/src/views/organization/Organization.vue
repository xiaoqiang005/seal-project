<template>
  <div class="organization-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>组织管理</span>
          <el-button type="primary" @click="handleAdd">新增组织</el-button>
        </div>
      </template>
      <el-table :data="organizationList" style="width: 100%">
        <el-table-column prop="name" label="组织名称" />
        <el-table-column prop="code" label="组织代码" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const organizationList = ref([])

const handleAdd = () => {
  // 处理添加组织
}

const handleEdit = (row: any) => {
  // 处理编辑组织
}

const handleDelete = (row: any) => {
  // 处理删除组织
}
</script>

<style scoped>
.organization-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 100%;
}
</style> 