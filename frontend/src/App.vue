<template>
  <router-view />
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
}

/* 强制在线中心菜单样式 */
.el-menu--horizontal > .el-menu-item {
  display: inline-block !important;
  height: 60px !important;
  line-height: 60px !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.el-menu-item[index="online"] {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* 适配高对比度模式 */
@media (forced-colors: active) {
  /* 允许 Element Plus 组件在高对比度模式下显示原有样式 */
  .el-button, .el-input, .el-menu, .el-menu-item, .el-card, .el-form-item {
    forced-color-adjust: none;
  }
  
  /* 对于图标和边框，使用系统颜色 */
  .el-icon {
    color: ButtonText;
  }
  
  a {
    color: LinkText;
  }
}
</style> 