import type { Organization, OrganizationResponse, FormState } from '@/types/organization'
import request from '@/utils/request'
import type { OrganizationForm } from '@/types/organization'

// 获取组织树
export function getOrganizationTree() {
  return request.get<Organization[]>('/organizations/tree/')
}

// 获取组织架构列表
export const getOrganizationList = (params?: {
  search?: string
  page?: number
  page_size?: number
  level?: string
  parent?: number
}) => {
  return request.get<OrganizationResponse>('/organizations/', { params })
}

// 创建组织
export function createOrganization(data: OrganizationForm) {
  return request.post<Organization>('/organizations/', data)
}

// 更新组织
export function updateOrganization(id: number, data: OrganizationForm) {
  return request.put<Organization>(`/organizations/${id}/`, data)
}

// 删除组织
export function deleteOrganization(id: number) {
  return request.delete<void>(`/organizations/${id}/`)
}

// 获取组织架构详情
export const getOrganizationDetail = (id: number) => {
  return request.get<Organization>(`/organizations/${id}/`)
}

// 获取行政区域内的组织（除基层单位外所有单位）
export const getUnitsInRegion = (regionId: number) => {
  return request.get<Organization[]>('/organizations/', {
    params: { 
      parent: regionId,
      exclude_level: '基层'
    }
  })
}

// 获取行政区域内的基层单位
export const getBasicUnitsInRegion = (regionId: number) => {
  return request.get<Organization[]>('/organizations/', {
    params: { 
      parent: regionId,
      level: '基层'
    }
  })
}

// 获取指定级别的组织架构
export const getByLevel = (level: string) => {
  return request.get<Organization[]>('/organizations/', {
    params: { level }
  })
}

// 获取指定区域的组织架构
export const getByRegion = (region: number) => {
  return request.get<Organization[]>('/organizations/', {
    params: { region }
  })
}

// 获取可用的下级层级
export const getAvailableLevels = (id: number) => {
  return request.get<{ value: number, label: string }[]>(`/organizations/${id}/available_levels/`)
} 