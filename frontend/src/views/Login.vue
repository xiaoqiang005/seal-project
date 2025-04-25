<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <h2>管理系统</h2>
      </div>
      
      <el-card class="login-card">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          @submit.prevent="handleSubmit"
          class="login-form"
          label-position="top"
        >
          <h2 class="title">登录系统</h2>
          
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              :prefix-icon="User"
              data-test="username"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              @keyup.enter="handleSubmit"
              data-test="password"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="submit-btn"
              @click="handleSubmit"
              data-test="login-button"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <div class="login-footer">
        <p>推荐使用 Chrome、Edge、Firefox 等现代浏览器</p>
        <p>Copyright © 2024 Company Name. All Rights Reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

interface LoginForm {
  username: string
  password: string
}

defineOptions({
  name: 'LoginView'
})

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref<FormInstance>()

const loginForm = reactive<LoginForm>({
  username: '',
  password: ''
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在 3-20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在 6-20 个字符之间', trigger: 'blur' }
  ]
})

const handleSubmit = async () => {
  if (!loginFormRef.value) return
  
  try {
    loading.value = true
    await loginFormRef.value.validate()
    
    // TODO: 实现登录逻辑
    console.log('登录表单数据：', loginForm)
    
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('表单验证失败：', error)
    ElMessage.error('请检查输入信息')
  } finally {
    loading.value = false
  }
}
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

.login-card :deep(.el-form) {
  padding: 24px;
}

.login-card :deep(.el-input) {
  margin-bottom: 16px;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.login-footer p {
  margin: 8px 0;
  font-size: 14px;
}

.login-form {
  width: 350px;
  padding: 35px;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #303133;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  color: #303133;
}

.submit-btn {
  width: 100%;
}
</style> 