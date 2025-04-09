// 分页响应接口
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// 行政区域
export interface Region {
  id: number
  name: string
  code: string
  level: string
  jurisdiction?: string
  parent?: number
  children?: Region[]
}

// 组织机构
export interface Organization {
  id: number
  name: string
  code: string
  level: string
  jurisdiction?: string
  parent?: number
  children?: Organization[]
}

// 印章企业详情
export interface Employee {
  employeeId: string
  name: string
  role: string
  gender: string
  idNumber: string
  education: string
  phone: string
  joinDate: string
}

export interface SealEnterpriseDetail extends SealEnterpriseItem {
  special_license_image?: string
  business_license_image?: string
  premises_front_image?: string
  premises_layout_image?: string
  equipment_list_image?: string
  legal_person_photo?: string
}

// 印章企业列表项
export interface SealEnterpriseItem {
  id: number
  user: {
    id: number
    username: string
    is_active: boolean
  }
  enterprise_name: string
  business_license: string
  region: number
  region_info: Organization
  unit_name: string
  address: string
  contact_phone: string
  type: string
  description?: string
  legal_person: string
  legal_person_id: string
  legal_person_phone: string
  legal_address?: string
  status: boolean
  created_at: string
  updated_at: string
  jurisdiction?: string
  unit_type?: string
}

// 创建印章企业参数
export interface CreateSealEnterpriseParams {
  enterprise_name: string
  business_license: string
  region: number
  unit_name: string
  address: string
  contact_phone: string
  type: string
  description?: string
  legal_person: string
  legal_person_id: string
  legal_person_phone: string
  legal_address?: string
  special_license_image?: File
  business_license_image?: File
  premises_front_image?: File
  premises_layout_image?: File
  equipment_list_image?: File
  legal_person_photo?: File
}

// 获取印章企业列表参数
export interface GetSealEnterprisesParams {
  search?: string
  page?: number
  page_size?: number
  region_id?: number
}

// 用户详情接口
export interface UserInfo extends SealEnterpriseDetail {
  updatedAt?: string
  isActive?: boolean
} 