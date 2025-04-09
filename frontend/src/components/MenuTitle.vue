<template>
  <div class="menu-title">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.menu-title {
  padding: 20px;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  border: none;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 500;
}
</style> 