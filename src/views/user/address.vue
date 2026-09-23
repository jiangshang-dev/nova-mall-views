<template>
  <div class="addr-page">
    <div class="head">
      <div>
        <h2>收货地址</h2>
        <p class="tip">管理常用收货地址，结算时可直接选用</p>
      </div>
      <a-button type="primary" class="jd-btn" @click="openAddress()">新增地址</a-button>
    </div>

    <a-spin :spinning="loading">
      <a-empty v-if="!addresses.length" description="暂无收货地址">
        <a-button type="primary" class="jd-btn" @click="openAddress()">添加地址</a-button>
      </a-empty>
      <div v-else class="addr-list">
        <div v-for="a in addresses" :key="a.id" class="addr-card">
          <div class="addr-main">
            <strong>{{ a.receiverName }}</strong>
            <span class="phone">{{ a.receiverPhone }}</span>
            <a-tag v-if="a.isDefault === 1" color="red">默认</a-tag>
          </div>
          <div class="addr-detail">
            {{ a.province }}{{ a.city }}{{ a.district }}{{ a.detail }}
          </div>
          <div class="addr-actions">
            <a-button type="link" size="small" @click="openAddress(a)">编辑</a-button>
            <a-button type="link" size="small" v-if="a.isDefault !== 1" @click="onSetDefault(a)">设为默认</a-button>
            <a-button type="link" size="small" danger @click="onRemove(a)">删除</a-button>
          </div>
        </div>
      </div>
    </a-spin>

    <a-modal
      v-model:open="visible"
      :title="form.id ? '编辑地址' : '新增地址'"
      :confirm-loading="saving"
      @ok="onSave"
      destroy-on-close
    >
      <a-form layout="vertical">
        <a-form-item label="收货人" required>
          <a-input v-model:value="form.receiverName" maxlength="32" />
        </a-form-item>
        <a-form-item label="手机号" required>
          <a-input v-model:value="form.receiverPhone" maxlength="11" />
        </a-form-item>
        <a-form-item label="省 / 市 / 区" required>
          <a-cascader
            v-model:value="regionPath"
            :options="regionOptions"
            placeholder="请选择省 / 市 / 区（含港澳台）"
            expand-trigger="hover"
            :show-search="{ filter: filterRegion }"
            style="width: 100%"
            @change="onRegionChange"
          />
        </a-form-item>
        <a-form-item label="详细地址" required>
          <a-textarea v-model:value="form.detail" :rows="2" maxlength="200" />
        </a-form-item>
        <a-form-item>
          <a-checkbox :checked="form.isDefault === 1" @change="(e) => (form.isDefault = e.target.checked ? 1 : 0)">
            设为默认地址
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { listAddress, removeAddress, saveAddress, setDefaultAddress } from '@/api/address'
import regionOptions from '@/data/china-regions.json'

const loading = ref(false)
const saving = ref(false)
const visible = ref(false)
const addresses = ref([])
const regionPath = ref([])
const form = reactive({
  id: undefined,
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: 0,
})

function filterRegion(inputValue, path) {
  return path.some((opt) => String(opt.label).toLowerCase().includes(String(inputValue).toLowerCase()))
}

function onRegionChange(value) {
  const path = value || []
  form.province = path[0] || ''
  form.city = path[1] || ''
  form.district = path[2] || ''
}

function syncRegionPath() {
  const path = [form.province, form.city, form.district].filter(Boolean)
  regionPath.value = path.length ? path : []
}

async function load() {
  loading.value = true
  try {
    const res = await listAddress()
    addresses.value = res.data || []
  } finally {
    loading.value = false
  }
}

function openAddress(record) {
  if (record) {
    Object.assign(form, {
      id: record.id,
      receiverName: record.receiverName,
      receiverPhone: record.receiverPhone,
      province: record.province || '',
      city: record.city || '',
      district: record.district || '',
      detail: record.detail || '',
      isDefault: record.isDefault || 0,
    })
  } else {
    Object.assign(form, {
      id: undefined,
      receiverName: '',
      receiverPhone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: addresses.value.length === 0 ? 1 : 0,
    })
  }
  syncRegionPath()
  visible.value = true
}

async function onSave() {
  if (!form.receiverName?.trim()) return message.warning('请填写收货人')
  if (!/^1\d{10}$/.test(form.receiverPhone || '')) return message.warning('手机号格式不正确')
  if (!form.province || !form.city || !form.district) return message.warning('请选择省 / 市 / 区')
  if (!form.detail?.trim()) return message.warning('请填写详细地址')
  saving.value = true
  try {
    await saveAddress({ ...form })
    message.success('地址已保存')
    visible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function onSetDefault(a) {
  await setDefaultAddress(a.id)
  message.success('已设为默认')
  await load()
}

function onRemove(a) {
  Modal.confirm({
    title: '删除地址',
    content: '确定删除该收货地址？',
    onOk: async () => {
      await removeAddress(a.id)
      message.success('已删除')
      await load()
    },
  })
}

onMounted(load)
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.head h2 {
  margin: 0 0 4px;
}
.tip {
  color: #999;
  margin: 0;
  font-size: 13px;
}
.addr-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.addr-card {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px 14px;
}
.addr-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.phone {
  color: #666;
}
.addr-detail {
  color: #555;
  font-size: 13px;
  line-height: 1.5;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
</style>
