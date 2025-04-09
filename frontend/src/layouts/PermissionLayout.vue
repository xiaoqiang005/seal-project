<template>
  <div class="permission-layout">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PermissionLayout',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.permission-layout {
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style> 