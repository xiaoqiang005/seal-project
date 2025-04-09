<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="/logo.png" alt="Logo" class="logo">
        <h2>管理系统</h2>
      </div>
      
      <el-card class="login-card">
        <div class="message-box">
          <el-alert
            title="系统维护中"
            type="info"
            :closable="false"
            center
            show-icon
          >
            <p>尊敬的用户：</p>
            <p>系统正在进行维护升级，暂时无法访问。</p>
            <p>给您带来的不便，敬请谅解。</p>
          </el-alert>
        </div>
      </el-card>
      
      <div class="login-footer">
        <p>推荐使用 Chrome、Edge、Firefox 等现代浏览器</p>
        <p>Copyright © 2024 Company Name. All Rights Reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
}

.login-content {
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 84px;
  height: 84px;
  margin-bottom: 16px;
}

.login-header h2 {
  margin: 0;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.login-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-box {
  padding: 20px;
}

.message-box p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
}

.login-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.login-footer p {
  margin: 8px 0;
  font-size: 14px;
}
</style> 