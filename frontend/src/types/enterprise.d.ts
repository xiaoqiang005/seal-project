// 企业详情接口
export interface SealEnterpriseDetail {
  id: number
  user?: {
    id: number
    username: string
    is_active: boolean
  }
  enterprise_name: string
  company_type: string
  business_license: string
  legal_person: string
  legal_person_id: string
  created_at: string
  updated_at: string
  special_license_image?: string
  business_license_image?: string
  premises_front_image?: string
  premises_layout_image?: string
  equipment_list_image?: string
  legal_person_photo?: string
  jurisdiction?: string
  description?: string
  address?: string
  type?: string
}

// 企业列表项接口
export interface SealEnterpriseItem {
  id: number
  user?: {
    id: number
    username: string
    is_active: boolean
  }
  enterprise_name: string
  business_license: string
  legal_person: string
  legal_person_id: string
  created_at: string
  updated_at: string
}

// 企业创建参数接口
export interface CreateSealEnterpriseParams {
  enterprise_name: string
  business_license: string
  region: string | null
  unit_name: string
  address: string
  contact_phone: string
  legal_person: string
  legal_person_id: string
  legal_person_phone: string
  status: boolean
  special_license_image?: File
  business_license_image?: File
  premises_front_image?: File
  premises_layout_image?: File
  equipment_list_image?: File
  legal_person_photo?: File
  [key: string]: any
}

// 企业查询参数接口
export interface GetSealEnterprisesParams {
  search?: string
  page?: number
  page_size?: number
}

// 分页响应接口
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
} 