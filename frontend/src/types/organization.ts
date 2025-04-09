import type { ComputedRef, Ref } from 'vue'
import type { FormInstance } from 'element-plus'

// 定义组织机构类型
export interface Organization {
  id: number
  name: string
  code: string
  level: LevelType
  parent?: number
  status: boolean
  sort_order: number
  children?: Organization[]
  hierarchicalIndex?: string
  expanded?: boolean
  created_at?: string
  updated_at?: string
}

// 定义表单状态类型
export interface FormState {
  id?: number
  name: string
  code: string
  parent: number | null
  parentName: string
  level: LevelType
  status: boolean
  sort_order: number
  parentLevel?: LevelType
}

// 定义组件状态类型
export interface OrganizationState {
  tableData: Organization[]
  searchKey: string
  dialogType: 'add' | 'edit' | 'addChild'
  dialogVisible: boolean
  form: FormState
  rules: Record<string, any[]>
  shouldDisableCode: boolean
}

// 定义组件方法类型
export interface OrganizationMethods {
  handleLevelChange: () => void
  submitForm: () => Promise<void>
  handleAdd: () => void
  handleEdit: (row: Organization) => void
  handleDelete: (row: Organization) => Promise<void>
  handleAddChild: (row: Organization) => void
  handleSearch: () => void
  getDisplayCode: (row: Organization) => string
  getIndent: (index: number) => number
  handleRowClick: (row: Organization, column: any) => void
  handleSelect: (selection: Organization[], row: Organization) => void
  handleSelectAll: (selection: Organization[]) => void
  handleDialogClose: () => void
  fetchOrganizationTree: () => Promise<void>
  highlightText: (text: string) => string
  getLevelTag: (level: LevelType) => string
  handleExpand: (row: Organization, expanded: boolean) => void
  handleSelectionClick: (row: Organization) => void
  getRowClass: (params: { row: Organization }) => string[]
  isSelected: (row: Organization) => boolean
}

// 定义组件属性类型
export interface OrganizationProps extends OrganizationState, OrganizationMethods {
  tableRef: any
  formRef: FormInstance | null
}

// 组织架构创建参数
export interface CreateOrganizationParams {
  name: string
  code: string
  level: LevelType
  parent?: number
  region?: number
  jurisdiction?: string
  description?: string
}

// 组织架构更新参数
export interface UpdateOrganizationParams {
  name?: string
  code?: string
  level?: LevelType
  parent?: number
  region?: number
  jurisdiction?: string
  description?: string
}

// 组织架构查询参数
export interface GetOrganizationsParams {
  search?: string
  page?: number
  page_size?: number
  level?: LevelType
  parent?: number
  region?: number
}

export interface OrganizationTreeNode {
  id: number
  name: string
  code: string
  level: LevelType
  children?: OrganizationTreeNode[]
}

// 定义API响应类型
export interface OrganizationResponse {
  data: Organization[]
  total: number
}

export type LevelType = '省级' | '市级' | '区级' | '县级'

export interface LevelOption {
  value: string
  label: string
}

export interface TableNode extends Organization {
  children?: TableNode[]
  expanded?: boolean
}

export interface OrganizationFormData {
  name: string
  code: string
  parent: number | null
  level: LevelType
  status: boolean
  sort_order: number
}

export interface OrganizationForm {
  id?: number
  name: string
  code: string
  level: LevelType
  parent?: number
  status: boolean
  sort_order: number
  parentLevel?: LevelType
}

export interface FormRules {
  name: { required: boolean; message: string; trigger: string }[]
  level: { required: boolean; message: string; trigger: string }[]
  code: { required: boolean; message: string; trigger: string; validator?: (rule: any, value: string, callback: Function) => void }[]
} 