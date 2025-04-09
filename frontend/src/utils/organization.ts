import type { Organization, LevelType } from '@/types/organization'

/**
 * 获取层级对应的数值
 * @param level 层级名称
 * @returns 层级对应的数值
 */
export const getLevelValue = (level: LevelType): number => {
  const levelMap: Record<LevelType, number> = {
    '省级': 1,
    '市级': 2,
    '区级': 3,
    '县级': 4
  }
  return levelMap[level]
}

/**
 * 获取可用的下级层级
 * @param parentLevel 父级层级
 * @returns 可用的下级层级列表
 */
export const getAvailableLevels = (parentLevel?: LevelType): Array<{value: LevelType, label: string}> => {
  if (!parentLevel) {
    return [
      { value: '省级', label: '省级' },
      { value: '市级', label: '市级' },
      { value: '区级', label: '区级' },
      { value: '县级', label: '县级' }
    ]
  }

  const levelValue = getLevelValue(parentLevel)
  const allLevels: LevelType[] = ['省级', '市级', '区级', '县级']
  
  return allLevels
    .filter(level => getLevelValue(level) > levelValue)
    .map(level => ({ value: level, label: level }))
}

/**
 * 获取默认的子级层级
 * @param parentLevel 父级层级
 * @returns 默认的子级层级
 */
export const getDefaultChildLevel = (parentLevel: LevelType): LevelType => {
  const levelMap: Record<LevelType, LevelType> = {
    '省级': '市级',
    '市级': '区级',
    '区级': '县级',
    '县级': '县级'
  }
  return levelMap[parentLevel]
}

/**
 * 判断是否可以添加子级
 * @param level 当前层级
 * @returns 是否可以添加子级
 */
export const canAddChild = (level: LevelType): boolean => {
  return level !== '区级' && level !== '县级'
}

/**
 * 获取层级标签类型
 * @param level 层级名称
 * @returns 标签类型
 */
export const getLevelTagType = (level: LevelType): string => {
  const typeMap: Record<LevelType, string> = {
    '省级': 'primary',
    '市级': 'success',
    '区级': 'warning',
    '县级': 'info'
  }
  return typeMap[level]
}

/**
 * 获取层级索引
 * @param org 组织对象
 * @returns 层级索引字符串
 */
export const getHierarchicalIndex = (org: Organization): string => {
  if (!org.parent) return '1'
  
  const parent = org.parent as Organization
  const parentIndex = parent.hierarchicalIndex || '1'
  const siblings = parent.children || []
  const index = siblings.findIndex(child => child.id === org.id) + 1
  
  return `${parentIndex}.${index}`
} 