<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      :pager-count="7"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  initPageSize: {
    type: Number,
    default: 10
  },
  initCurrentPage: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:pageSize', 'update:currentPage', 'pagination'])

const pageSize = ref(props.initPageSize as number)
const currentPage = ref(props.initCurrentPage as number)

watch(pageSize, (newValue: number) => {
  emit('update:pageSize', newValue)
  emit('pagination', currentPage.value, newValue)
})

watch(currentPage, (newValue: number) => {
  emit('update:currentPage', newValue)
  emit('pagination', newValue, pageSize.value)
})

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}
</script>

<style scoped>
@import '@/styles/common.css';
</style> 