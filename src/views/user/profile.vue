<template>
  <div class="profile">
    <h2>账户设置</h2>
    <p class="tip">修改昵称与头像，仿照京东个人中心基本信息</p>
    <a-spin :spinning="loading">
      <div class="card">
        <div class="avatar-block">
          <a-avatar :size="88" :src="form.avatar || undefined" style="background: #e1251b">
            {{ (form.userRealName || form.userName || '会')[0] }}
          </a-avatar>
          <div>
            <a-upload
              :show-upload-list="false"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <a-button :loading="uploading" preIcon="ant-design:camera-outlined">更换头像</a-button>
            </a-upload>
            <div class="hint">支持 JPG/PNG，建议正方形图片</div>
          </div>
        </div>

        <a-form layout="vertical" style="max-width: 420px; margin-top: 24px">
          <a-form-item label="登录账号">
            <a-input :value="form.userName" disabled />
          </a-form-item>
          <a-form-item label="昵称" required>
            <a-input v-model:value="form.userRealName" maxlength="32" placeholder="请输入昵称" />
          </a-form-item>
          <a-form-item label="手机号">
            <a-input :value="form.phone || '-'" disabled />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input :value="form.email || '-'" disabled />
          </a-form-item>
          <a-button type="primary" class="jd-btn" :loading="saving" @click="onSave">保存修改</a-button>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getProfile, updateProfile } from '@/api/member'
import { uploadFile } from '@/api/file'

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const form = reactive({
  userId: null,
  userName: '',
  userRealName: '',
  avatar: '',
  phone: '',
  email: '',
})

async function load() {
  loading.value = true
  try {
    const res = await getProfile()
    Object.assign(form, res.data || {})
  } finally {
    loading.value = false
  }
}

async function beforeUpload(file) {
  uploading.value = true
  try {
    const res = await uploadFile(file)
    form.avatar = res.data
    message.success('头像已上传，请点击保存')
  } finally {
    uploading.value = false
  }
  return false
}

async function onSave() {
  if (!form.userRealName?.trim()) return message.warning('请填写昵称')
  saving.value = true
  try {
    const res = await updateProfile({
      userRealName: form.userRealName.trim(),
      avatar: form.avatar || '',
    })
    Object.assign(form, res.data || {})
    localStorage.setItem('Nova-UserName', form.userRealName || form.userName || '会员')
    message.success('资料已更新')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.profile h2 {
  margin: 0 0 4px;
}
.tip {
  color: #999;
  margin: 0 0 20px;
  font-size: 13px;
}
.avatar-block {
  display: flex;
  align-items: center;
  gap: 20px;
}
.hint {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
</style>
