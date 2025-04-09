<template>
  <menu-title title="电话咨询" />
</template>

<script setup lang="ts">
import MenuTitle from '@/components/MenuTitle.vue'
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.contact-card {
  height: 100%;
  min-height: 250px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.phone-number {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.phone-number h3 {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}

.service-time {
  margin-bottom: 20px;
  color: #909399;
}

.notice-card {
  margin-top: 20px;
}

.notice-content {
  color: #606266;
}

.notice-content h4 {
  margin: 0 0 15px;
  color: #303133;
}

.notice-content ol {
  margin: 0 0 20px;
  padding-left: 20px;
  line-height: 1.8;
}

:deep(.el-collapse) {
  border-top: none;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  color: #303133;
}

:deep(.el-collapse-item__content) {
  padding: 10px 20px;
  color: #606266;
  line-height: 1.6;
}
</style> 