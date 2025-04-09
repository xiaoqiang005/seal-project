<template>
  <div class="page-container">
    <page-title>角色管理</page-title>
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">添加角色</el-button>
      <el-input
        v-model="searchValue"
        placeholder="请输入角色名称"
        prefix-icon="Search"
        clearable
        class="search-input"
        @input="handleSearch"
      />
    </div>
    
    <el-card class="table-card">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="name" label="角色名称" align="center" />
        <el-table-column prop="description" label="描述" align="center" />
        <el-table-column prop="created_at" label="创建时间" align="center" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" align="center" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
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

  <!-- 角色表单对话框 -->
  <el-dialog
    :title="dialogType === 'add' ? '添加角色' : '编辑角色'"
    v-model="dialogVisible"
    width="500px"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      label-position="right"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="请输入角色描述"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import CommonPagination from '@/components/CommonPagination.vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import axios from 'axios'

// API基础URL
const API_BASE_URL = 'http://localhost:8000/api/permission'

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 表格数据
const tableData = ref([])

// 表单相关
interface RoleForm {
  name: string
  description: string
}

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance | null>(null)

const form = reactive<RoleForm>({
  name: '',
  description: ''
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ]
})

// 搜索角色
const searchValue = ref('')
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchRoles()
}

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE_URL}/roles/`, {
      params: {
        search: searchValue.value,
        page: currentPage.value,
        page_size: pageSize.value
      }
    })
    
    // 处理返回的数据
    if (response.data.results) {
      tableData.value = response.data.results
      total.value = response.data.count
    } else {
      tableData.value = response.data
      total.value = response.data.length
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 分页变化处理
const handlePagination = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  fetchRoles()
}

// 添加角色
const handleAdd = () => {
  dialogType.value = 'add'
  form.name = ''
  form.description = ''
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.name = row.name
  form.description = row.description
  // 保存当前编辑的角色ID
  currentEditId.value = row.id
  dialogVisible.value = true
}

// 保存当前编辑的角色ID
const currentEditId = ref<number | null>(null)

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (dialogType.value === 'add') {
      // 添加角色
      await axios.post(`${API_BASE_URL}/roles/`, {
        name: form.name,
        description: form.description,
        status: true
      })
      ElMessage.success('添加角色成功')
    } else {
      // 编辑角色
      await axios.put(`${API_BASE_URL}/roles/${currentEditId.value}/`, {
        name: form.name,
        description: form.description
      })
      ElMessage.success('编辑角色成功')
    }
    
    dialogVisible.value = false
    fetchRoles() // 刷新列表
  } catch (error) {
    console.error('表单提交失败:', error)
    if (error.response && error.response.data) {
      // 显示后端返回的错误信息
      ElMessage.error(JSON.stringify(error.response.data))
    } else {
      ElMessage.error('操作失败')
    }
  }
}

// 删除角色
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      type: 'warning'
    })
    
    await axios.delete(`${API_BASE_URL}/roles/${row.id}/`)
    ElMessage.success('删除成功')
    fetchRoles() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return '-';
  
  // 格式化为 YYYY-MM-DD HH:MM:SS
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 组件挂载时获取角色列表
onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
@import '@/styles/common.css';

/* 表格样式 */
:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table__row) {
  height: 48px;
}

:deep(.el-table .cell) {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.operation-buttons .el-button {
  padding: 6px 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style> 