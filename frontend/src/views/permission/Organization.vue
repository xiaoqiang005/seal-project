<template>
  <div class="page-container">
    <page-title title="区域管理" />
    
    <!-- 搜索栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">添加区域</el-button>
      <div class="flex-spacer"></div>
      <el-input
        v-model="searchKey"
        placeholder="请输入区域名称或编码搜索"
        class="search-input"
        @input="handleSearchInput"
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
          :tree-props="{ 
            children: 'children', 
            hasChildren: 'hasChildren',
            indent: 24
          }"
          @expand-change="handleExpand"
        @row-click="handleRowClick"
        :row-class-name="getRowClass"
        :highlight-current-row="true">
        <el-table-column
          label="序号"
          width="100"
          align="left"
        >
          <template #default="{ row }">
            <span class="hierarchical-index">{{ getHierarchicalIndex(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="编号" width="320" align="left">
          <template #default="scope">
            <div class="code-cell">
              <div 
                class="org-node"
                :style="{ paddingLeft: `${scope.level * 20}px` }"
              >
                <!-- 连接线 -->
                <div 
                  v-if="scope.level > 0"
                  class="node-line"
                  :style="{ left: `${(scope.level - 1) * 20 + 10}px` }"
                ></div>
                
                <!-- 节点图标 -->
                <div class="node-icon" :class="'level-' + scope.row.level">
                  <el-icon v-if="scope.row.children && scope.row.children.length">
                    <component :is="scope.row.expanded ? 'FolderOpened' : 'Folder'" />
                  </el-icon>
                  <el-icon v-else><Document /></el-icon>
                </div>

                <!-- 编号和层级信息 -->
                <div class="node-content">
                  <span v-html="highlightText(getDisplayCode(scope.row))" />
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="区域名称" min-width="200" align="center">
          <template #default="scope">
            <span v-html="highlightText(scope.row.name || '')" />
          </template>
        </el-table-column>
        <el-table-column prop="level" label="层级" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getLevelTag(scope.row.level)">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
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
                v-if="scope.row.level !== '区级' && scope.row.level !== '县级'"
                type="success" 
                size="small" 
                @click.stop="handleAddChild(scope.row)"
              >
                添加下级
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

    <!-- 添加/编辑区域对话框 -->
    <el-dialog
    :title="dialogType === 'add' ? '添加区域' : dialogType === 'edit' ? '编辑区域' : '添加下级区域'"
      v-model="dialogVisible"
      width="500px"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
      :validate-on-rule-change="false"
      :inline-message="true"
    >
      <el-form-item 
        label="编号" 
        prop="code" 
        v-if="(dialogType === 'add' || dialogType === 'edit') && !formData.parent"
      >
          <el-input 
          v-model="formData.code"
          placeholder="请输入编号（六位纯数字）"
          :maxlength="6"
          :validate-event="false"
          :disabled="dialogType === 'edit'"
          />
        </el-form-item>
      <el-form-item 
        label="区域名称" 
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入区域名称"
          :validate-event="false"
        />
        </el-form-item>
      <el-form-item 
        label="层级" 
        prop="level"
      >
        <el-select
          v-model="formData.level"
          placeholder="请选择层级"
          :disabled="isLevelSelectDisabled"
        >
          <el-option
            v-for="option in dialogType === 'add' ? levelOptions : availableLevels"
            :key="option.value || option"
            :label="option.label || option"
            :value="option.value || option"
          />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onBeforeMount, type ComputedRef, nextTick, watch } from 'vue'
import type { Organization, FormState, LevelType, TableNode } from '@/types/organization'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import * as organizationApi from '@/api/organization'
import { Search, Folder, FolderOpened, Document } from '@element-plus/icons-vue'
import PageTitle from '@/components/PageTitle.vue'
import { formatDateTime } from '@/utils/date'
import { getHierarchicalIndex, getLevelValue, getAvailableLevels, canAddChild, getLevelTagType, getDefaultChildLevel } from '@/utils/organization'
import axios from 'axios'

interface OrganizationWithHierarchicalIndex extends Organization {
  hierarchicalIndex?: string
  expanded?: boolean
  children?: OrganizationWithHierarchicalIndex[]
}

interface ComponentState {
  tableData: OrganizationWithHierarchicalIndex[]
  originalData: OrganizationWithHierarchicalIndex[]
  searchKey: string
  dialogType: 'add' | 'edit' | 'addChild'
  dialogVisible: boolean
  formData: FormState
  rules: Record<string, any[]>
  shouldDisableCode: boolean
  loading: boolean
  isInitialized: boolean
  currentPage: number
  pageSize: number
  totalCount: number
  selectedId: number | null
  selectedNode: Organization | null
  availableLevels: Array<{value: string, label: string}>
}

export default defineComponent({
  name: 'Organization',
  components: {
    PageTitle,
    Search,
    Folder,
    FolderOpened,
    Document
  },
  setup() {
    const loading = ref(false)
    const isInitialized = ref(false)
    const tableRef = ref<any>(null)
    const formRef = ref<FormInstance | null>(null)

    // 创建基础状态
    const tableData = ref<OrganizationWithHierarchicalIndex[]>([])
    const originalData = ref<OrganizationWithHierarchicalIndex[]>([])  // 保存原始数据
    const searchKey = ref('')
    const dialogType = ref<'add' | 'edit' | 'addChild'>('add')
const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formData = ref<FormState>({
      id: undefined,
      name: '',
  code: '',
  level: '',
      parent: undefined,
      status: true,
      sort_order: 0
    })

    const rules = reactive({
  name: [
        { required: true, message: '请输入区域名称', trigger: 'submit' }
  ],
  level: [
        { required: true, message: '请选择层级', trigger: 'submit' }
      ],
      code: [
        { required: true, message: '请输入编码', trigger: 'submit' },
        { pattern: /^\d{6}$/, message: '编码必须是6位数字', trigger: 'submit' }
      ]
    })

    const shouldDisableCode = computed(() => {
      // 编辑时，有上级的组织禁用编号
      if (dialogType.value === 'edit' && formData.value.parent) return true
      
      // 添加下级时禁用编号
      if (dialogType.value === 'addChild') return true
      
      // 其他情况可以编辑编号
      return false
    })

    // 分页相关状态
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalCount = ref(0)
    const selectedId = ref<number | null>(null)

    // 添加 availableLevels ref
    const availableLevels = ref([
      { value: '省级', label: '省级' },
      { value: '市级', label: '市级' },
      { value: '区级', label: '区级' },
      { value: '县级', label: '县级' }
    ])

    const selectedNode = ref<Organization | null>(null)

    // 监听选中行变化，自动设置层级
    watch(() => selectedId.value, () => {
      if (dialogVisible.value) {
        updateAvailableLevels()
      }
    }, { immediate: true })

    // 监听对话框显示状态
    watch(() => dialogVisible.value, (newVal) => {
      if (newVal) {
        updateAvailableLevels()
      }
    })

    // 重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
      
      formData.value = {
        id: undefined,
        name: '',
        code: '',
        level: '',
        parent: undefined,
        status: true,
        sort_order: 0
      }

      // 重置可选层级
      if (dialogType.value === 'add') {
        availableLevels.value = [
          { value: '省级', label: '省级' },
          { value: '市级', label: '市级' },
          { value: '区级', label: '区级' },
          { value: '县级', label: '县级' }
        ]
      }
    }

    // 方法定义
    const handleLevelChange = () => {
      // 如果有父级，使用父级编号
      if (formData.value.parent) {
        const parent = tableData.value.find(item => item.id === formData.value.parent)
        if (parent) {
          formData.value.code = parent.code
        }
      }
    }

    const formatCode = (code: string) => {
      // 确保编号是6位纯数字
      // 如果少于6位，在左侧补0
      return code.replace(/\D/g, '').padStart(6, '0').slice(0, 6)
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        // 手动触发表单验证
        await formRef.value.validate()
        
        // 准备提交数据
        let submitData: any = {
          name: formData.value.name,
          level: formData.value.level,
          parent: formData.value.parent || null
        }
        
        // 只有在顶级区域时才发送编码
        if (!formData.value.parent) {
          submitData.code = formData.value.code
        }
        
        if (formData.value.id) {
          await organizationApi.updateOrganization(formData.value.id, submitData)
          ElMessage.success('更新成功')
        } else {
          await organizationApi.createOrganization(submitData)
          ElMessage.success('创建成功')
        }
        
        dialogVisible.value = false
        await fetchOrganizationTree()
      } catch (error: any) {
        console.error('操作失败:', error)
        ElMessage.error(error.response?.data?.detail || '操作失败')
      }
    }

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
      updateAvailableLevels()
  dialogVisible.value = true
}

    const handleEdit = (row: Organization) => {
      dialogType.value = 'edit'
      formData.value = { ...row }
      
      // 根据是否有子节点决定层级选项
      const hasChildren = row.children && row.children.length > 0
      
      if (hasChildren) {
        // 有子节点时，只允许选择当前层级
        availableLevels.value = [{ value: row.level, label: row.level }]
      } else {
        // 没有子节点时，根据父节点层级提供可选层级
        if (row.parent) {
          // 查找父节点
          const parentNode = findNodeById(tableData.value, row.parent)
          if (parentNode) {
            // 根据父级层级设置可选层级
            switch (parentNode.level) {
              case '省级':
                availableLevels.value = [
                  { value: '市级', label: '市级' },
                  { value: '区级', label: '区级' },
                  { value: '县级', label: '县级' }
                ]
                break
              case '市级':
                availableLevels.value = [
                  { value: '区级', label: '区级' },
                  { value: '县级', label: '县级' }
                ]
                break
              case '区级':
                availableLevels.value = [
                  { value: '县级', label: '县级' }
                ]
                break
              default:
                availableLevels.value = [{ value: row.level, label: row.level }]
            }
          } else {
            availableLevels.value = [{ value: row.level, label: row.level }]
          }
        } else {
          // 顶级节点没有子节点时可以选择所有层级
          availableLevels.value = [
            { value: '省级', label: '省级' },
            { value: '市级', label: '市级' },
            { value: '区级', label: '区级' },
            { value: '县级', label: '县级' }
          ]
        }
      }
      
      dialogVisible.value = true
    }

    const handleDelete = async (row: Organization) => {
      try {
        await ElMessageBox.confirm('确定要删除该区域吗？', '提示', {
          type: 'warning'
        })
        
        // 调用删除API
        await organizationApi.deleteOrganization(row.id)
        
        // 重新获取组织树
        await fetchOrganizationTree()
        
        ElMessage.success('删除成功')
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          ElMessage.error(error.response?.data?.detail || '删除失败')
        }
      }
    }

    const handleAddChild = (row: Organization) => {
      // 检查是否可以添加下级
      if (row.level === '区级' || row.level === '县级') {
        ElMessage.warning(`${row.level}不能添加下级区域`)
    return
  }

  dialogType.value = 'addChild'
  resetForm()
      
      // 设置父级信息和选中节点
      selectedNode.value = row
      formData.value.parent = row.id
      formData.value.code = row.code  // 自动使用父级编码
      
      // 更新可选层级列表
      updateAvailableLevels()
      
      // 如果有可选层级，默认选择第一个
      if (availableLevels.value.length > 0) {
        formData.value.level = availableLevels.value[0].value
  }
  
  dialogVisible.value = true
}

    const handleSearch = () => {
      if (!searchKey.value) {
        tableData.value = originalData.value
      } else {
        const key = searchKey.value.toLowerCase()
        tableData.value = originalData.value.filter(item => 
          item.name.toLowerCase().includes(key) || 
          item.code.toLowerCase().includes(key)
        )
      }
      currentPage.value = 1
    }

    const getDisplayCode = (row: Organization) => {
      return row.code || '-'
    }

    const getIndent = (index: number) => {
      return index * 20
    }

    const handleRowClick = (row: Organization) => {
      // 获取表格实例
      const table = tableRef.value
      if (!table) return

      // 切换展开/收起状态
      table.toggleRowExpansion(row)
    }

    const handleClose = () => {
      resetForm()
      dialogVisible.value = false
    }

    const handleCancel = () => {
      handleClose()
    }

    const fetchOrganizationTree = async () => {
      try {
        loading.value = true
        const API_BASE_URL = 'http://localhost:8000/api'
        const response = await axios.get(`${API_BASE_URL}/organizations/tree/`)
        
        // 处理返回的数据，确保所有节点都有正确的children属性
        const processTreeData = (nodes: Organization[]) => {
          return nodes.map(node => ({
            ...node,
            children: node.children ? processTreeData(node.children) : [],
            expanded: false
          }))
        }
        
        const processedData = processTreeData(response.data)
        tableData.value = processedData
        originalData.value = JSON.parse(JSON.stringify(processedData))
        totalCount.value = countNodes(tableData.value)
        isInitialized.value = true
        
        // 强制更新表格
        nextTick(() => {
          if (tableRef.value) {
            tableRef.value.doLayout()
          }
        })
      } catch (error) {
        console.error('获取组织树失败:', error)
        ElMessage.error('获取组织树失败')
      } finally {
        loading.value = false
      }
    }

    const countNodes = (nodes: Organization[]): number => {
      let count = nodes.length
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          count += countNodes(node.children)
        }
      }
      return count
    }

    const highlightText = (text: string) => {
      if (!searchKey.value || !text) return text
      const key = searchKey.value.toLowerCase()
      const index = text.toLowerCase().indexOf(key)
      if (index === -1) return text
      
      const before = text.substring(0, index)
      const match = text.substring(index, index + key.length)
      const after = text.substring(index + key.length)
      
      return `${before}<span class="highlight">${match}</span>${after}`
    }

    const getLevelTag = (level: string): string => {
      return getLevelTagType(level as LevelType)
    }

    const handleExpand = (row: Organization, expanded: boolean) => {
      row.expanded = expanded
    }

    const getRowClass = ({ row }: { row: Organization }) => {
      const level = row.level
      let className = ''
      
      // 根据层级添加不同的样式
      switch(level) {
        case '省级':
          className = 'level-province'
          break
        case '市级':
          className = 'level-city'
          break
        case '区级':
          className = 'level-district'
          break
        case '县级':
          className = 'level-county'
          break
      }
      
      return row.expanded ? `${className} expanded-row` : className
    }

    const handleSizeChange = (val: number) => {
      pageSize.value = val
      currentPage.value = 1
    }

    const handleCurrentChange = (val: number) => {
      currentPage.value = val
    }

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return tableData.value.slice(start, end)
    })

    const getHierarchicalIndex = (node: Organization) => {
      // 递归查找节点路径
      const findNodePath = (currentNode: Organization, targetId: number): Organization[] | null => {
        if (!currentNode) return null;
        if (currentNode.id === targetId) return [currentNode];

        if (currentNode.children) {
          for (const child of currentNode.children) {
            const path = findNodePath(child, targetId);
            if (path) return [currentNode, ...path];
          }
        }
        return null;
      };

      // 获取节点在同级中的索引
      const getSiblingIndex = (node: Organization, siblings: Organization[]): number => {
        const index = siblings.findIndex(sibling => sibling.id === node.id);
        return index + 1;
      };

      // 从树形数据中查找完整路径
      let path: Organization[] = [];
      for (const root of tableData.value) {
        const nodePath = findNodePath(root, node.id);
        if (nodePath) {
          path = nodePath;
          break;
        }
      }

      // 构建层级索引
      if (path.length === 0) return '';

      let index = '';
      let currentLevel = path[0];
      let currentSiblings = tableData.value;
      
      // 获取根节点索引
      index = getSiblingIndex(currentLevel, currentSiblings).toString();

      // 处理子节点
      for (let i = 1; i < path.length; i++) {
        currentLevel = path[i];
        currentSiblings = path[i - 1].children || [];
        index += '.' + getSiblingIndex(currentLevel, currentSiblings);
      }

      return index;
    }

    // 查找节点
    const findNodeById = (nodes: Organization[], id: number): Organization | null => {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findNodeById(node.children, id)
          if (found) return found
        }
      }
      return null
    }

    // 在组件挂载前初始化数据
    onBeforeMount(async () => {
      await fetchOrganizationTree()
    })

    // 更新可选层级列表
    const updateAvailableLevels = () => {
      if (dialogType.value === 'add') {
        // 添加顶级区域时，可以选择所有层级
        availableLevels.value = [
          { value: '省级', label: '省级' },
          { value: '市级', label: '市级' },
          { value: '区级', label: '区级' },
          { value: '县级', label: '县级' }
        ]
      } else if (dialogType.value === 'addChild' && selectedNode.value) {
        // 根据父级层级设置可选层级
        switch (selectedNode.value.level) {
          case '省级':
            availableLevels.value = [
              { value: '市级', label: '市级' },
              { value: '区级', label: '区级' },
              { value: '县级', label: '县级' }
            ]
            break
          case '市级':
            availableLevels.value = [
              { value: '区级', label: '区级' },
              { value: '县级', label: '县级' }
            ]
            break
          case '区级':
          case '县级':
            availableLevels.value = []
            ElMessage.warning(`${selectedNode.value.level}不能添加下级区域`)
            break
        }
      }
    }

    // 使用防抖处理搜索
    let searchTimer: number | null = null
    const handleSearchInput = () => {
      if (searchTimer) {
        clearTimeout(searchTimer)
      }
      searchTimer = window.setTimeout(() => {
        handleSearch()
      }, 300)
    }

    // 层级选项
    const levelOptions = ref([
      { value: '省级', label: '省级' },
      { value: '市级', label: '市级' },
      { value: '区级', label: '区级' },
      { value: '县级', label: '县级' }
    ])

    // 获取可用的层级选项
    const getAvailableLevels = async (parentId: number) => {
      try {
        const { data } = await organizationApi.getAvailableLevels(parentId)
        // 根据层级顺序过滤和排序选项
        const sortOrder = { '省级': 1, '市级': 2, '区级': 3, '县级': 4 }
        return data.available_levels.sort((a, b) => sortOrder[a] - sortOrder[b])
      } catch (error) {
        console.error('获取可用层级失败:', error)
        return []
      }
    }

    // 处理父级变化
    const handleParentChange = async (value: number) => {
      if (!value) {
        // 如果是顶级，只显示省级选项
        formData.value.level = '省级'
        availableLevels.value = ['省级']
      } else {
        // 获取可用的下级层级
        availableLevels.value = await getAvailableLevels(value)
        if (availableLevels.value.length > 0) {
          formData.value.level = availableLevels.value[0]
        }
      }
    }

    // 计算层级选择框是否禁用
    const isLevelSelectDisabled = computed(() => {
      // 编辑模式下，检查是否有子节点
      if (dialogType.value === 'edit') {
        if (formData.value.id) {
          // 找到当前编辑的节点
          const currentNode = findNodeById(tableData.value, formData.value.id)
          // 如果有子节点，禁用层级选择
          return currentNode?.children && currentNode.children.length > 0
        }
      }
      return false
    })

    return {
      loading,
      isInitialized,
      tableRef,
      formRef,
      tableData,
      originalData,
      searchKey,
      dialogType,
      dialogVisible,
      formData,
      rules,
      shouldDisableCode,
      currentPage,
      pageSize,
      totalCount,
      availableLevels,
      paginatedData,
      formatDateTime,
      getHierarchicalIndex,
      getLevelTag,
      formatCode,
      getDisplayCode,
      highlightText,
      getIndent,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      handleExpand,
      getRowClass,
      handleRowClick,
      handleClose,
      handleCancel,
      handleAdd,
      handleEdit,
      handleDelete,
      handleAddChild,
      handleSubmit,
      updateAvailableLevels,
      selectedNode,
      handleSearchInput,
      levelOptions,
      getAvailableLevels,
      handleParentChange,
      isLevelSelectDisabled
    }
  }
})
</script>

<style>
@import '@/styles/common.css';

.page-container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 300px;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.org-node {
  display: flex;
  align-items: center;
  position: relative;
}

.node-line {
  position: absolute;
  width: 20px;
  height: 1px;
  background-color: #dcdfe6;
  left: 0;
  top: 50%;
}

.node-icon {
  margin-right: 8px;
  color: #409eff;
}

.node-content {
  flex: 1;
}

.level-省级 .el-icon {
  color: #409eff;
}

.level-市级 .el-icon {
  color: #67c23a;
}

.level-区级 .el-icon {
  color: #e6a23c;
}

.level-县级 .el-icon {
  color: #f56c6c;
}

.hierarchical-index {
  font-family: monospace;
  color: #666;
}

.highlight {
  color: #409eff;
  font-weight: bold;
}
</style> 