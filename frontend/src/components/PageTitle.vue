<template>
  <div class="page-title">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageTitle'
})
</script>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 500;
  color: #1f2f3d;
  margin-bottom: 20px;
  line-height: 28px;
}
</style> 