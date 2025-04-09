/**
 * 格式化日期时间
 * @param timestamp 时间戳或日期字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
} 