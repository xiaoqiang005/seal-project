<template>
  <div class="page-container">
    <page-title>刻章企业管理</page-title>
    
    <!-- 搜索栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">添加刻章企业</el-button>
      <div class="flex-spacer"></div>
      <el-input
        v-model="searchKey"
        placeholder="请输入企业名称或营业执照号搜索"
        class="search-input"
        @input="handleSearch"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <!-- 表格 -->
    <el-card class="table-card" v-loading="loading">
      <template v-if="isInitialized">
        <el-table
          ref="tableRef"
          :data="paginatedData"
          border
          style="width: 100%"
          row-key="id"
          @row-click="handleRowClick"
          :row-class-name="getRowClass"
          :highlight-current-row="true">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="name" label="企业名称" min-width="200" align="center">
            <template #default="scope">
              <span v-html="highlightText(scope.row.name)" />
            </template>
          </el-table-column>
          <el-table-column prop="businessLicenseNo" label="营业执照号" width="180" align="center" />
          <el-table-column prop="legalPerson" label="法定代表人" width="120" align="center" />
          <el-table-column prop="legalPhone" label="法人电话" width="120" align="center" />
          <el-table-column prop="recordUnit" label="备案单位" min-width="150" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status ? 'success' : 'danger'">
                {{ scope.row.status ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right" align="center">
            <template #default="scope">
            <div class="operation-buttons">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click.stop="handleEdit(scope.row)"
                >
                  编辑
              </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click.stop="handleDelete(scope.row)"
                >
                  删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
      <template v-else>
        <div class="loading-placeholder">
          <el-empty description="加载中..." />
        </div>
      </template>
    </el-card>

    <!-- 添加/编辑企业对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加刻章企业' : '编辑刻章企业'"
      v-model="dialogVisible"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="营业执照号" prop="businessLicenseNo">
          <el-input v-model="form.businessLicenseNo" placeholder="请输入营业执照号" />
        </el-form-item>
        <el-form-item label="法定代表人" prop="legalPerson">
          <el-input v-model="form.legalPerson" placeholder="请输入法定代表人姓名" />
        </el-form-item>
        <el-form-item label="法人电话" prop="legalPhone">
          <el-input v-model="form.legalPhone" placeholder="请输入法人联系电话" />
        </el-form-item>
        <el-form-item label="备案单位" prop="recordUnit">
          <el-select v-model="form.recordUnit" placeholder="请选择备案单位" style="width: 100%">
            <el-option
              v-for="unit in recordUnitOptions"
              :key="unit.value"
              :label="unit.label"
              :value="unit.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="企业地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入企业详细地址" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="营业执照" prop="businessLicense">
          <el-upload
            class="upload-demo"
            action="/api/upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :on-success="handleSuccess"
            :file-list="fileList"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import PageTitle from '@/components/PageTitle.vue'

export default defineComponent({
  name: 'EnterpriseManagement',
  components: {
    PageTitle,
    Search
  },
  setup() {
    // 状态定义
    const tableData = ref([])
    const originalData = ref([])
    const searchKey = ref('')
    const dialogType = ref('add')
    const dialogVisible = ref(false)
    const loading = ref(false)
    const isInitialized = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
    const totalCount = ref(0)
    const formRef = ref()
    const tableRef = ref()
    const fileList = ref([])

    const form = reactive({
      id: 0,
      name: '',
      businessLicenseNo: '',
      legalPerson: '',
      legalPhone: '',
      recordUnit: '',
      address: '',
      status: true,
      businessLicense: ''
    })
    
    // 备案单位选项
    const recordUnitOptions = ref([
      { value: '海南省公安厅', label: '海南省公安厅' },
      { value: '海口市公安局', label: '海口市公安局' },
      { value: '三亚市公安局', label: '三亚市公安局' }
    ])

    const rules = reactive({
      name: [
        { required: true, message: '请输入企业名称', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      businessLicenseNo: [
        { required: true, message: '请输入营业执照号', trigger: 'blur' },
        { pattern: /^[0-9A-Z]{18}$/, message: '请输入18位营业执照号', trigger: 'blur' }
      ],
      legalPerson: [
        { required: true, message: '请输入法定代表人姓名', trigger: 'blur' }
      ],
      legalPhone: [
        { required: true, message: '请输入法人联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      recordUnit: [
        { required: true, message: '请选择备案单位', trigger: 'change' }
      ],
      address: [
        { required: true, message: '请输入企业地址', trigger: 'blur' }
      ]
    })

    // 分页数据计算
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return tableData.value.slice(start, end)
    })

    // 初始化数据
    const fetchData = async () => {
      loading.value = true
      try {
        // 使用静态模拟数据
        const mockData = [
          {
            id: 1,
            name: '海南某某刻章有限公司',
            businessLicenseNo: '91460000MA5T3U00KU',
            legalPerson: '张三',
            legalPhone: '13800138000',
            recordUnit: '海口市公安局',
            address: '海南省海口市美兰区某某路123号',
            status: true,
            created_at: '2023-04-01 10:00:00'
          },
          {
            id: 2,
            name: '三亚某某印章制作公司',
            businessLicenseNo: '91460200MA5T4VY1YK',
            legalPerson: '李明',
            legalPhone: '13900139000',
            recordUnit: '三亚市公安局',
            address: '海南省三亚市吉阳区某某路456号',
            status: true,
            created_at: '2023-04-02 11:00:00'
          }
        ]
        
        originalData.value = mockData
        tableData.value = [...mockData]
        totalCount.value = mockData.length
        isInitialized.value = true
      } catch (error) {
        console.error('获取企业数据失败', error)
        ElMessage.error('获取企业数据失败，请刷新重试')
      } finally {
        loading.value = false
      }
    }

    // 定义企业数据类型
    interface Enterprise {
      id: number
      name: string
      businessLicenseNo: string
      legalPerson: string
      legalPhone: string
      recordUnit: string
      address: string
      status: boolean
      created_at: string
      businessLicense?: string
    }

    // 搜索处理
    const handleSearch = () => {
      if (!searchKey.value.trim()) {
        tableData.value = [...originalData.value]
      } else {
        const keyword = searchKey.value.toLowerCase()
        tableData.value = originalData.value.filter((item: Enterprise) => 
          item.name.toLowerCase().includes(keyword) ||
          item.businessLicenseNo.toLowerCase().includes(keyword)
        )
      }
      totalCount.value = tableData.value.length
      currentPage.value = 1
    }

    // 高亮搜索关键词
    const highlightText = (text: string) => {
      if (!searchKey.value.trim() || !text) return text
      const keyword = searchKey.value
      const index = text.toLowerCase().indexOf(keyword.toLowerCase())
      if (index === -1) return text
      const pre = text.substring(0, index)
      const match = text.substring(index, index + keyword.length)
      const post = text.substring(index + keyword.length)
      return `${pre}<span class="highlight">${match}</span>${post}`
    }

    // 分页处理
    const handleSizeChange = (val: number) => {
      pageSize.value = val
      currentPage.value = 1
    }

    const handleCurrentChange = (val: number) => {
      currentPage.value = val
    }

    // 行点击处理
    const handleRowClick = (row: any) => {
      // 可以在这里添加行点击的处理逻辑
      console.log('Row clicked:', row)
    }

    // 行样式处理
    const getRowClass = ({ row }: { row: any }) => {
      // 可以根据需要返回行的类名
      return ''
    }

    // 添加企业
    const handleAdd = () => {
      dialogType.value = 'add'
      Object.assign(form, {
        id: 0,
        name: '',
        businessLicenseNo: '',
        legalPerson: '',
        legalPhone: '',
        recordUnit: '',
        address: '',
        status: true,
        businessLicense: ''
      })
      fileList.value = []
      dialogVisible.value = true
    }

    // 编辑企业
    const handleEdit = (row: Enterprise) => {
      dialogType.value = 'edit'
      Object.assign(form, {
        id: row.id,
        name: row.name,
        businessLicenseNo: row.businessLicenseNo,
        legalPerson: row.legalPerson,
        legalPhone: row.legalPhone,
        recordUnit: row.recordUnit,
        address: row.address,
        status: row.status
      })
      fileList.value = row.businessLicense ? [{ name: '营业执照', url: row.businessLicense }] : []
      dialogVisible.value = true
    }

    // 删除企业
    const handleDelete = (row: Enterprise) => {
      ElMessageBox.confirm(
        `确定要删除企业"${row.name}"吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = tableData.value.findIndex((item: Enterprise) => item.id === row.id)
        if (index > -1) {
          tableData.value.splice(index, 1)
          originalData.value = [...tableData.value]
          totalCount.value = tableData.value.length
          ElMessage.success('删除成功')
        }
      }).catch(() => {
        // 取消删除操作
      })
    }

    // 图片预览
    const handlePreview = (file: any) => {
      if (file.url) {
        window.open(file.url)
      }
    }

    // 移除文件
    const handleRemove = (file: any) => {
      form.businessLicense = ''
    }

    // 移除文件前的确认
    const beforeRemove = (file: any) => {
      return ElMessageBox.confirm(`确定移除 ${file.name}？`)
    }

    // 上传成功回调
    const handleSuccess = (response: any, file: any) => {
      form.businessLicense = response.url
    }

    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate((valid: boolean) => {
        if (valid) {
          const data = {
            ...form,
            created_at: new Date().toISOString()
          }
          
          if (dialogType.value === 'add') {
            data.id = Date.now()
            tableData.value.push(data)
          } else {
            const index = tableData.value.findIndex(item => item.id === data.id)
            if (index > -1) {
              tableData.value[index] = data
            }
          }
          
          originalData.value = [...tableData.value]
          totalCount.value = tableData.value.length
          dialogVisible.value = false
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
        }
      })
    }

    // 关闭对话框
    const handleDialogClose = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
      fileList.value = []
    }

    // 格式化日期时间
    const formatDateTime = (datetime: string) => {
      if (!datetime) return '-'
      return datetime
    }

    // 初始化
    onMounted(() => {
      fetchData()
    })

    return {
      tableData,
      originalData,
      searchKey,
      dialogType,
      dialogVisible,
      form,
      rules,
      loading,
      isInitialized,
      currentPage,
      pageSize,
      totalCount,
      recordUnitOptions,
      formRef,
      tableRef,
      paginatedData,
      handleSearch,
      highlightText,
      handleSizeChange,
      handleCurrentChange,
      handleAdd,
      handleEdit,
      handleDelete,
      handleRowClick,
      getRowClass,
      handlePreview,
      handleRemove,
      beforeRemove,
      handleSuccess,
      submitForm,
      handleDialogClose,
      formatDateTime
    }
  }
})
</script>

<style scoped>
@import '@/styles/common.css';

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.loading-placeholder {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.selected-row {
  background-color: #ecf5ff;
}

.operation-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

:deep(.highlight) {
  color: #409EFF;
  font-weight: bold;
}

.upload-demo {
  width: 100%;
}

.el-upload__tip {
  line-height: 1.2;
  padding-top: 4px;
  color: #909399;
}
</style> 