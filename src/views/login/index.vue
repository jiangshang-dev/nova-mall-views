<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="brand" @click="$router.push('/')">
        <span class="mark">N</span>
        <div>
          <strong>Nova Mall</strong>
          <p>自营商城账号中心</p>
        </div>
      </div>

      <a-tabs v-model:activeKey="tab">
        <a-tab-pane key="login" tab="登录">
          <a-form layout="vertical" :model="loginForm" @finish="onLogin">
            <a-form-item
              label="账号"
              name="username"
              :rules="[{ required: true, message: '请输入邮箱 / 手机号 / 用户名' }]"
            >
              <a-input
                v-model:value="loginForm.username"
                size="large"
                placeholder="邮箱 / 手机号 / 用户名"
                allow-clear
              >
                <template #prefix>
                  <Icon icon="ant-design:user-outlined" />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
              <a-input-password v-model:value="loginForm.password" size="large" placeholder="请输入密码">
                <template #prefix>
                  <Icon icon="ant-design:lock-outlined" />
                </template>
              </a-input-password>
            </a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              class="jd-btn"
              :loading="loading"
              preIcon="ant-design:login-outlined"
            >
              登录
            </a-button>
          </a-form>
          <p class="hint">演示账号：user / user@nova.com / 13800000000，密码 admin123</p>
        </a-tab-pane>

        <a-tab-pane key="register" tab="邮箱注册">
          <a-form layout="vertical" :model="regForm" @finish="onRegister">
            <a-form-item
              label="邮箱"
              name="email"
              :rules="[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]"
            >
              <a-input v-model:value="regForm.email" size="large" placeholder="name@example.com">
                <template #prefix>
                  <Icon icon="ant-design:mail-outlined" />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请设置密码' }]">
              <a-input-password v-model:value="regForm.password" size="large" placeholder="至少 6 位">
                <template #prefix>
                  <Icon icon="ant-design:lock-outlined" />
                </template>
              </a-input-password>
            </a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              class="jd-btn"
              :loading="loading"
              preIcon="ant-design:user-add-outlined"
            >
              注册并登录
            </a-button>
          </a-form>
        </a-tab-pane>
      </a-tabs>

      <div class="back">
        <a-button type="link" preIcon="ant-design:arrow-left-outlined" @click="$router.push('/')">
          返回商城首页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { login, register } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const tab = ref(route.query.tab === 'register' ? 'register' : 'login')
const loading = ref(false)
const loginForm = reactive({ username: 'user@nova.com', password: 'admin123' })
const regForm = reactive({ email: '', password: '' })

watch(
  () => route.query.tab,
  (t) => {
    tab.value = t === 'register' ? 'register' : 'login'
  }
)

async function onLogin() {
  loading.value = true
  try {
    const res = await login({ username: loginForm.username, password: loginForm.password })
    localStorage.setItem('Access-Token', res.data.token)
    localStorage.setItem('Nova-UserName', res.data.userRealName || res.data.userName || '会员')
    message.success('登录成功')
    router.push('/')
  } finally {
    loading.value = false
  }
}

async function onRegister() {
  loading.value = true
  try {
    await register({
      username: regForm.email,
      email: regForm.email,
      password: regForm.password,
    })
    message.success('注册成功')
    loginForm.username = regForm.email
    loginForm.password = regForm.password
    await onLogin()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.tab === 'register') tab.value = 'register'
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background:
    linear-gradient(120deg, rgba(200, 22, 35, 0.88), rgba(26, 26, 26, 0.78)),
    url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600') center / cover;
  font-family: "JDZhengHei", "PingFang SC", "Microsoft YaHei", sans-serif;
  padding: 24px;
}
.auth-card {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 28px 28px 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}
.mark {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(145deg, #ff4d3a, #c81623);
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  display: grid;
  place-items: center;
}
.brand strong {
  display: block;
  font-size: 20px;
}
.brand p {
  margin: 0;
  color: #999;
  font-size: 12px;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
.hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #999;
}
.back {
  text-align: center;
  margin-top: 4px;
}
</style>
