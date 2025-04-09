<template>
  <el-dialog
    title="详情"
    :model-value="props.visible"
    @update:model-value="handleClose"
    width="50%"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="用户名">{{ props.userInfo.username }}</el-descriptions-item>
      <el-descriptions-item label="单位名称">{{ props.userInfo.companyName }}</el-descriptions-item>
      <el-descriptions-item label="行政区域">{{ props.userInfo.jurisdiction }}</el-descriptions-item>
      <el-descriptions-item label="单位类型">{{ getCompanyTypeName }}</el-descriptions-item>
      <el-descriptions-item label="营业执照号">
        {{ props.userInfo.businessLicenseNumber }}
        <el-link v-if="props.userInfo.businessLicenseImage" type="primary" @click="previewImage(props.userInfo.businessLicenseImage)">查看图片</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="特种设备使用登记证">
        {{ props.userInfo.specialLicenseNumber }}
        <el-link v-if="props.userInfo.specialLicenseImage" type="primary" @click="previewImage(props.userInfo.specialLicenseImage)">查看图片</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="单位状态">
        <el-tag :type="props.userInfo.status === 1 ? 'success' : 'danger'">
          {{ props.userInfo.status === 1 ? '正常' : '异常' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ props.userInfo.phone }}</el-descriptions-item>
      <el-descriptions-item label="注册时间">{{ formatDateTime(props.userInfo.registrationTime || '') }}</el-descriptions-item>
      <el-descriptions-item label="备案单位">{{ props.userInfo.recordUnit }}</el-descriptions-item>
      <el-descriptions-item label="场所门头照片">
        <el-link v-if="props.userInfo.premisesFrontImage" type="primary" @click="previewImage(props.userInfo.premisesFrontImage)">查看图片</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="平面布局图">
        <el-link v-if="props.userInfo.layoutImage" type="primary" @click="previewImage(props.userInfo.layoutImage)">查看图片</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="设备清单">
        <el-link v-if="props.userInfo.equipmentListImage" type="primary" @click="previewImage(props.userInfo.equipmentListImage)">查看图片</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="描述">{{ props.userInfo.description }}</el-descriptions-item>
      <el-descriptions-item label="地址">{{ props.userInfo.address }}</el-descriptions-item>
      <el-descriptions-item label="法人姓名">{{ props.userInfo.legalName }}</el-descriptions-item>
      <el-descriptions-item label="法人身份证号">{{ props.userInfo.legalIdNumber }}</el-descriptions-item>
      <el-descriptions-item label="法人照片">
        <el-link v-if="props.userInfo.legalPhoto" type="primary" @click="previewImage(props.userInfo.legalPhoto)">查看图片</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="法人住址">{{ props.userInfo.legalAddress }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup generic="T extends Record<string, any>" lang="ts">
import { computed } from 'vue'

interface UserInfo {
  id?: string
  username?: string
  companyName?: string
  jurisdiction?: string
  type?: string
  businessLicenseNumber?: string
  businessLicenseImage?: string
  specialLicenseNumber?: string
  specialLicenseImage?: string
  status?: number
  phone?: string
  registrationTime?: string
  recordUnit?: string
  premisesFrontImage?: string
  layoutImage?: string
  equipmentListImage?: string
  description?: string
  address?: string
  legalName?: string
  legalIdNumber?: string
  legalPhoto?: string
  legalAddress?: string
}

const props = defineProps<{
  visible: boolean
  userInfo: UserInfo
}>()

const emit = defineEmits<{
  'update:visible': [boolean]
}>()

const handleClose = () => {
  emit('update:visible', false)
}

const typeMap = {
  '1': '生产企业',
  '2': '经营企业',
  '3': '使用单位'
} as const

const getCompanyTypeName = computed(() => {
  return typeMap[props.userInfo.type as keyof typeof typeMap] || '未知'
})

const previewImage = (url: string) => {
  if (!url) return
  window.open(url)
}

const formatDateTime = (timestamp: string) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped>
.el-descriptions {
  margin: 20px 0;
}
</style> 