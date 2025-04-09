import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios'
import { ElMessage } from 'element-plus'

// 响应数据接口
interface ApiResponse<T = any> {
  code?: number;
  data: T;
  message?: string;
  detail?: string;
}

// 请求配置接口
interface RequestConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
  shouldRetry?: boolean;
  skipErrorHandler?: boolean;
}

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : '/api',  // 统一使用相对路径
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 用于存储取消函数
const pendingRequests = new Map<string, Canceler>()

// 生成请求的唯一键
const generateRequestKey = (config: AxiosRequestConfig): string => {
  const { url, method, params, data } = config
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 添加或移除请求
const addPendingRequest = (config: AxiosRequestConfig): void => {
  const requestKey = generateRequestKey(config)
  if (!pendingRequests.has(requestKey)) {
    config.cancelToken = new axios.CancelToken((cancel) => {
      pendingRequests.set(requestKey, cancel)
    })
  }
}

const removePendingRequest = (config: AxiosRequestConfig): void => {
  const requestKey = generateRequestKey(config)
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey)
    cancel && cancel('请求已取消')
    pendingRequests.delete(requestKey)
  }
}

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 检查是否存在重复请求，如果有则取消之前的请求
    removePendingRequest(config)
    addPendingRequest(config)

    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    removePendingRequest(response.config)
    return response.data
  },
  async (error) => {
    const config = error.config as RequestConfig
    
    // 如果是取消的请求，不显示错误信息
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    // 处理请求重试
    if (config && config.shouldRetry && config.retry && config.retry > 0) {
      config.retry -= 1
      config.shouldRetry = false
      await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000))
      return service(config)
    }

    // 如果配置了跳过错误处理，直接返回错误
    if (config?.skipErrorHandler) {
      return Promise.reject(error)
    }

    // 获取错误信息
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        '未知错误'
    
    // 显示错误信息
    ElMessage.error(errorMessage)

    return Promise.reject(error)
  }
)

// 请求方法类型定义
type RequestMethods = {
  get: <T = any>(url: string, config?: RequestConfig) => Promise<ApiResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: RequestConfig) => Promise<ApiResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: RequestConfig) => Promise<ApiResponse<T>>;
  delete: <T = any>(url: string, config?: RequestConfig) => Promise<ApiResponse<T>>;
}

// 默认的重试配置
const defaultConfig: Partial<RequestConfig> = {
  retry: 3,
  retryDelay: 1000,
  shouldRetry: true,
  timeout: 15000
}

// 封装请求方法
const request: RequestMethods = {
  get: (url, config) => 
    service.get(url, { ...defaultConfig, ...config }),
  post: (url, data, config) => 
    service.post(url, data, { ...defaultConfig, ...config }),
  put: (url, data, config) => 
    service.put(url, data, { ...defaultConfig, ...config }),
  delete: (url, config) => 
    service.delete(url, { ...defaultConfig, ...config })
}

export default request 