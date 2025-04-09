import request from '@/utils/request'
import type {
  Region,
  Organization,
  SealEnterpriseDetail,
  SealEnterpriseItem,
  CreateSealEnterpriseParams,
  GetSealEnterprisesParams,
  PaginatedResponse
} from '@/types/enterprise'

// 获取行政区域树形数据
export function getRegionsTree() {
  return request.get<Region[]>('/org-management/organizations/tree/')
}

// 获取行政区域列表数据
export function getRegionsData() {
  return request.get<Region[]>('/org-management/organizations/')
}

// 获取指定级别的行政区域
export function getRegions(level: number) {
  return request.get<Region[]>('/org-management/organizations/', { params: { level } })
}

// 获取指定级别的组织机构
export function getOrganizationsByLevel(level: number) {
  return request.get<Organization[]>('/org-management/organizations/', { params: { level } })
}

// 获取指定区域的单位
export function getUnitsByRegion(region: number) {
  return request.get<Organization[]>('/org-management/organizations/units_by_region/', { params: { region_id: region } })
}

// 创建印章企业
export function createSealEnterprise(data: CreateSealEnterpriseParams) {
  // 检查data是否包含文件数据
  const hasFiles = Object.values(data).some(value => value instanceof File)
  
  // 如果有文件，使用FormData
  if (hasFiles) {
    const formData = new FormData()
    
    // 添加基本信息
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    return request.post<SealEnterpriseDetail>('/enterprise/seal-enterprises/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } 
  // 没有文件，直接提交JSON数据
  else {
    return request.post<SealEnterpriseDetail>('/enterprise/seal-enterprises/', data)
  }
}

// 获取印章企业列表
export function getSealEnterprises(params: GetSealEnterprisesParams) {
  console.log('调用getSealEnterprises API，参数:', params);
  return request.get<PaginatedResponse<SealEnterpriseItem>>('/enterprise/seal-enterprises/', { params })
    .then(response => {
      console.log('getSealEnterprises API 原始响应:', response);
      return response;
    })
    .catch(error => {
      console.error('getSealEnterprises API 错误:', error);
      throw error;
    });
}

// 获取印章企业详情
export function getSealEnterpriseDetail(id: number) {
  return request.get<SealEnterpriseDetail>(`/enterprise/seal-enterprises/${id}/`)
}

// 更新用户状态
export function updateUserStatus(id: number, status: number) {
  return request.patch(`/enterprise/seal-enterprises/${id}/status/`, { status })
} 