<template>
  <div class="page-container">
    <page-title>主管单位管理</page-title>
    
    <!-- 搜索栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">添加主管单位</el-button>
      <div class="flex-spacer"></div>
      <el-input
        v-model="searchKey"
        placeholder="请输入主管单位名称或编码搜索"
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
        :tree-props="{ 
          children: 'children', 
          hasChildren: 'hasChildren',
          indent: 24
        }"
        @row-click="handleRowClick"
        :row-class-name="getRowClass"
        :highlight-current-row="true">
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="code" label="编号" width="150" align="center" />
        <el-table-column prop="name" label="主管单位名称" min-width="200" align="center">
          <template #default="scope">
            <span v-html="highlightText(scope.row.name)" />
          </template>
        </el-table-column>
        <el-table-column prop="jurisdiction" label="行政区域" min-width="200" align="center" />
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

    <!-- 添加/编辑主管单位对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加主管单位' : '编辑主管单位'"
      v-model="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="编号" prop="code">
          <el-input 
            v-model="form.code" 
            placeholder="请输入编号（六位纯数字）" 
            :disabled="shouldDisableCode"
            maxlength="6"
            oninput="value=value.replace(/[^\d]/g,'')"
          />
        </el-form-item>
        <el-form-item label="主管单位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入主管单位名称" />
        </el-form-item>
        <el-form-item label="行政区域" prop="region">
          <el-cascader
            v-model="form.regionValue"
            :options="regionOptions"
            :props="{
              checkStrictly: false,
              emitPath: false,
              value: 'value',
              label: 'label',
              children: 'children',
              expandTrigger: 'click'
            }"
            placeholder="请选择行政区域"
            clearable
            @change="handleRegionChange"
            filterable
          />
        </el-form-item>
        <el-form-item label="上级主管单位" prop="parent">
          <el-select 
            v-model="form.parent" 
            placeholder="请选择上级主管单位" 
            filterable
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in parentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span>{{ item.label }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.level }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-select 
            v-model="form.level" 
            placeholder="请选择层级" 
            style="width: 100%"
          >
            <el-option label="省级" value="省级" />
            <el-option label="市级" value="市级" />
            <el-option label="区级" value="区级" />
          </el-select>
        </el-form-item>
        <el-form-item label="行政区域描述" prop="jurisdiction">
          <el-input v-model="form.jurisdiction" placeholder="请输入行政区域描述" type="textarea" :rows="2" />
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
  name: 'SupervisorUnit',
  components: {
    PageTitle,
    Search
  },
  setup() {
    // 状态定义
    const tableData = ref([]);
    const originalData = ref([]);
    const searchKey = ref('');
    const dialogType = ref('add');
    const dialogVisible = ref(false);
    const form = reactive({
      id: 0,
      code: '',
      name: '',
      level: '',
      jurisdiction: '',
      parent: null,
      regionValue: null
    });
    const rules = reactive({
      code: [
        { required: true, message: '请输入编号', trigger: 'blur' },
        { min: 6, max: 6, message: '编号必须为6位数字', trigger: 'blur' },
        { pattern: /^\d{6}$/, message: '编号必须为6位数字', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入主管单位名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      level: [
        { required: true, message: '请选择层级', trigger: 'change' }
      ],
      region: [
        { required: true, message: '请选择行政区域', trigger: 'change' }
      ]
    });
    const shouldDisableCode = ref(false);
    const loading = ref(true);
    const isInitialized = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalCount = ref(0);
    const selectedId = ref(null);
    const regionOptions = ref([]);
    const parentOptions = ref([]);
    
    const formRef = ref(null);
    const tableRef = ref(null);

    // 初始化数据
    const fetchData = async () => {
      loading.value = true;
      try {
        // 使用静态模拟数据
        const mockData = [
          {
            id: 1,
            code: '460000',
            name: '海南省公安厅',
            level: '省级',
            jurisdiction: '海南省',
            parent: null,
            created_at: '2023-04-01 19:39:15',
            children: [
              {
                id: 2,
                code: '460100',
                name: '海口市公安局',
                level: '市级',
                jurisdiction: '海口市',
                parent: 1,
                created_at: '2023-04-01 19:40:05'
              },
              {
                id: 3,
                code: '460200',
                name: '三亚市公安局',
                level: '市级',
                jurisdiction: '三亚市',
                parent: 1,
                created_at: '2023-04-02 18:31:18'
              }
            ]
          }
        ];
        
        originalData.value = mockData;
        tableData.value = [...mockData];
        totalCount.value = countTotalNodes(mockData);
        isInitialized.value = true;
      } catch (error) {
        console.error('获取主管单位数据失败', error);
        ElMessage.error('获取主管单位数据失败，请刷新重试');
      } finally {
        loading.value = false;
      }
    };
    
    // 递归计算节点总数（包括子节点）
    const countTotalNodes = (nodes) => {
      if (!nodes || !Array.isArray(nodes)) return 0;
      return nodes.reduce((total, node) => {
        return total + 1 + (node.children ? countTotalNodes(node.children) : 0);
      }, 0);
    };

    // 获取行政区域数据
    const fetchRegionOptions = async () => {
      try {
        // 使用静态行政区域数据
        regionOptions.value = [
          { 
            value: 1, 
            label: '海南省', 
            code: '460000', 
            level: '省级',
            children: [
              { 
                value: 2, 
                label: '海口市', 
                code: '460100', 
                level: '市级',
                children: [
                  { value: 4, label: '美兰区', code: '460108', level: '区级' },
                  { value: 5, label: '琼山区', code: '460107', level: '区级' }
                ]
              },
              { 
                value: 3, 
                label: '三亚市', 
                code: '460200', 
                level: '市级',
                children: [
                  { value: 6, label: '海棠区', code: '460202', level: '区级' },
                  { value: 7, label: '吉阳区', code: '460203', level: '区级' }
                ]
              }
            ] 
          }
        ];
      } catch (error) {
        console.error('获取行政区域失败', error);
        ElMessage.error('获取行政区域失败，请刷新重试');
      }
    };

    // 获取上级主管单位选项
    const updateParentOptions = () => {
      // 递归函数，将树形结构转为平面数组
      const flattenTree = (nodes, result = []) => {
        if (!nodes || !Array.isArray(nodes)) return result;
        
        nodes.forEach(node => {
          result.push({
            value: node.id,
            label: node.name,
            level: node.level
          });
          
          if (node.children && node.children.length > 0) {
            flattenTree(node.children, result);
          }
        });
        
        return result;
      };
      
      parentOptions.value = flattenTree(originalData.value);
    };

    // 搜索
    const handleSearch = () => {
      if (!searchKey.value.trim()) {
        tableData.value = [...originalData.value];
      } else {
        const keyword = searchKey.value.toLowerCase();
        
        // 递归搜索函数
        const searchInTree = (nodes) => {
          if (!nodes) return [];
          
          return nodes.reduce((result, node) => {
            const nameMatch = node.name && node.name.toLowerCase().includes(keyword);
            const codeMatch = node.code && node.code.toLowerCase().includes(keyword);
            const jurisdictionMatch = node.jurisdiction && node.jurisdiction.toLowerCase().includes(keyword);
            
            if (nameMatch || codeMatch || jurisdictionMatch) {
              // 节点匹配，添加它及其所有子节点
              result.push({...node});
            } else if (node.children && node.children.length > 0) {
              // 节点不匹配，但检查其子节点
              const matchedChildren = searchInTree(node.children);
              if (matchedChildren.length > 0) {
                result.push({
                  ...node,
                  children: matchedChildren
                });
              }
            }
            
            return result;
          }, []);
        };
        
        tableData.value = searchInTree(originalData.value);
      }
      totalCount.value = countTotalNodes(tableData.value);
      currentPage.value = 1;
    };

    // 高亮显示搜索关键词
    const highlightText = (text) => {
      if (!searchKey.value.trim() || !text) return text;
      const keyword = searchKey.value.trim();
      const index = text.toLowerCase().indexOf(keyword.toLowerCase());
      
      if (index !== -1) {
        const pre = text.substring(0, index);
        const match = text.substring(index, index + keyword.length);
        const post = text.substring(index + keyword.length);
        return `${pre}<span class="highlight">${match}</span>${post}`;
      }
      
      return text;
    };

    // 分页数据
    const paginatedData = computed(() => {
      // 在树形数据中，分页会比较复杂
      // 这里简单实现为只显示顶层节点的分页
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      return tableData.value.slice(startIndex, endIndex);
    });

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pageSize.value = size;
    };

    // 处理当前页变化
    const handleCurrentChange = (page) => {
      currentPage.value = page;
    };

    // 添加主管单位
    const handleAdd = () => {
      dialogType.value = 'add';
      form.id = 0;
      form.code = '';
      form.name = '';
      form.level = '';
      form.jurisdiction = '';
      form.parent = null;
      form.regionValue = null;
      shouldDisableCode.value = false;
      dialogVisible.value = true;
    };

    // 编辑主管单位
    const handleEdit = (row) => {
      dialogType.value = 'edit';
      form.id = row.id;
      form.code = row.code;
      form.name = row.name;
      form.level = row.level;
      form.jurisdiction = row.jurisdiction || '';
      form.parent = row.parent;
      form.regionValue = findRegionByCode(row.code);
      shouldDisableCode.value = true;
      dialogVisible.value = true;
    };
    
    // 根据编码查找行政区域值
    const findRegionByCode = (code) => {
      // 简单返回null
      return null;
    };

    // 删除主管单位
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除主管单位"${row.name}"吗？`,
        '删除提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        try {
          // 模拟删除操作
          const removeNodeById = (nodes, id) => {
            for (let i = 0; i < nodes.length; i++) {
              if (nodes[i].id === id) {
                nodes.splice(i, 1);
                return true;
              }
              
              if (nodes[i].children && nodes[i].children.length > 0) {
                if (removeNodeById(nodes[i].children, id)) {
                  return true;
                }
              }
            }
            
            return false;
          };
          
          removeNodeById(originalData.value, row.id);
          tableData.value = [...originalData.value];
          totalCount.value = countTotalNodes(tableData.value);
          ElMessage.success('删除成功');
        } catch (error) {
          console.error('删除主管单位失败', error);
          ElMessage.error('删除主管单位失败，请重试');
        }
      }).catch(() => {
        // 取消删除，不做操作
      });
    };

    // 处理行点击
    const handleRowClick = (row) => {
      selectedId.value = row.id;
    };

    // 获取行样式
    const getRowClass = ({ row }) => {
      return selectedId.value === row.id ? 'selected-row' : '';
    };

    // 获取层级对应的标签类型
    const getLevelTag = (level) => {
      const levelMap = {
        '省级': 'danger',
        '市级': 'warning',
        '区级': 'success'
      };
      return levelMap[level] || 'info';
    };
    
    // 处理区域变化
    const handleRegionChange = (value) => {
      if (value) {
        // 根据选中的区域更新行政区域描述
        const findRegionInfo = (options, value) => {
          for (const option of options) {
            if (option.value === value) {
              return option;
            }
            if (option.children && option.children.length) {
              const found = findRegionInfo(option.children, value);
              if (found) return found;
            }
          }
          return null;
        };
        
        const regionInfo = findRegionInfo(regionOptions.value, value);
        if (regionInfo) {
          form.jurisdiction = regionInfo.label;
          // 根据区域层级自动设置主管单位层级
          form.level = regionInfo.level;
        }
      }
    };

    // 提交表单
    const submitForm = () => {
      if (!formRef.value) return;
      
      formRef.value.validate((valid) => {
        if (valid) {
          loading.value = true;
          try {
            // 模拟数据处理
            if (dialogType.value === 'add') {
              // 创建新节点
              const newNode = {
                id: Date.now(), // 模拟生成ID
                code: form.code,
                name: form.name,
                level: form.level,
                jurisdiction: form.jurisdiction,
                parent: form.parent,
                created_at: new Date().toLocaleString()
              };
              
              // 如果有父节点，添加到父节点的children中
              if (form.parent) {
                const addNodeToParent = (nodes, parentId, newNode) => {
                  for (const node of nodes) {
                    if (node.id === parentId) {
                      if (!node.children) node.children = [];
                      node.children.push(newNode);
                      return true;
                    }
                    if (node.children && node.children.length) {
                      if (addNodeToParent(node.children, parentId, newNode)) {
                        return true;
                      }
                    }
                  }
                  return false;
                };
                
                addNodeToParent(originalData.value, form.parent, newNode);
              } else {
                // 没有父节点，添加到顶层
                originalData.value.push(newNode);
              }
              
              ElMessage.success('添加主管单位成功');
            } else {
              // 更新节点
              const updateNode = (nodes, id, updatedData) => {
                for (let i = 0; i < nodes.length; i++) {
                  if (nodes[i].id === id) {
                    nodes[i] = { ...nodes[i], ...updatedData };
                    return true;
                  }
                  
                  if (nodes[i].children && nodes[i].children.length > 0) {
                    if (updateNode(nodes[i].children, id, updatedData)) {
                      return true;
                    }
                  }
                }
                
                return false;
              };
              
              updateNode(originalData.value, form.id, {
                code: form.code,
                name: form.name,
                level: form.level,
                jurisdiction: form.jurisdiction,
                parent: form.parent
              });
              
              ElMessage.success('更新主管单位成功');
            }
            
            // 更新表格数据
            tableData.value = [...originalData.value];
            totalCount.value = countTotalNodes(tableData.value);
            dialogVisible.value = false;
          } catch (error) {
            console.error('提交主管单位数据失败', error);
            ElMessage.error('提交主管单位数据失败，请重试');
          } finally {
            loading.value = false;
          }
        }
      });
    };

    // 关闭对话框
    const handleDialogClose = () => {
      if (formRef.value) {
        formRef.value.resetFields();
      }
    };

    // 格式化日期时间
    const formatDateTime = (timestamp) => {
      if (!timestamp) return '-';
      return timestamp;
    };

    // 初始化
    onMounted(() => {
      fetchData();
      fetchRegionOptions();
      updateParentOptions();
    });

    return {
      tableData,
      originalData,
      searchKey,
      dialogType,
      dialogVisible,
      form,
      rules,
      shouldDisableCode,
      loading,
      isInitialized,
      currentPage,
      pageSize,
      totalCount,
      selectedId,
      regionOptions,
      parentOptions,
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
      getLevelTag,
      handleRegionChange,
      submitForm,
      handleDialogClose,
      formatDateTime
    };
  }
});
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
</style> 