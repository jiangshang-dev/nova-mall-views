<template>
  <MallShell>
    <div class="inner checkout-page">
      <h2>确认订单</h2>
      <a-spin :spinning="loading">
        <section class="block">
          <div class="block-head">
            <h3>收货地址</h3>
            <a-button type="link" @click="openAddress()">新增地址</a-button>
          </div>
          <a-empty v-if="!addresses.length" description="请先添加收货地址">
            <a-button type="primary" class="jd-btn" @click="openAddress()">添加地址</a-button>
          </a-empty>
          <div v-else class="addr-list">
            <div
              v-for="a in addresses"
              :key="a.id"
              class="addr-card"
              :class="{ active: selectedAddressId === a.id }"
              @click="selectedAddressId = a.id"
            >
              <div class="addr-main">
                <strong>{{ a.receiverName }}</strong>
                <span class="phone">{{ a.receiverPhone }}</span>
                <a-tag v-if="a.isDefault === 1" color="red">默认</a-tag>
              </div>
              <div class="addr-detail">
                {{ a.province }}{{ a.city }}{{ a.district }}{{ a.detail }}
              </div>
              <div class="addr-actions" @click.stop>
                <a-button type="link" size="small" @click="openAddress(a)">编辑</a-button>
                <a-button type="link" size="small" @click="onSetDefault(a)" v-if="a.isDefault !== 1">设为默认</a-button>
                <a-button type="link" size="small" danger @click="onRemoveAddr(a)">删除</a-button>
              </div>
            </div>
          </div>
        </section>

        <section class="block">
          <h3>商品信息</h3>
          <div v-for="item in items" :key="item.id || item.goodsId" class="goods-row">
            <img :src="item.cover || placeholder" alt="" />
            <div class="g-meta">
              <div class="g-name">{{ item.name }}</div>
              <div class="g-price">¥{{ formatPrice(item.price) }} × {{ item.quantity }}</div>
            </div>
            <div class="g-sub">¥{{ formatPrice(Number(item.price) * item.quantity) }}</div>
          </div>
        </section>

        <section class="block">
          <h3>支付方式</h3>
          <a-radio-group v-model:value="payType" class="pay-group">
            <a-radio-button value="alipay">
              <span class="pay-alipay">支付宝</span>
            </a-radio-button>
            <a-radio-button value="wxpay">
              <span class="pay-wx">微信支付</span>
            </a-radio-button>
          </a-radio-group>
          <a-textarea
            v-model:value="remark"
            :rows="2"
            maxlength="100"
            show-count
            placeholder="订单备注（选填）"
            style="margin-top: 14px"
          />
        </section>

        <div class="submit-bar">
          <div>
            应付合计：
            <span class="total">¥{{ formatPrice(totalAmount) }}</span>
          </div>
          <a-button type="primary" size="large" class="jd-btn" :loading="submitting" @click="onSubmit">
            提交订单
          </a-button>
        </div>
      </a-spin>
    </div>

    <a-modal
      v-model:open="addrVisible"
      :title="addrForm.id ? '编辑地址' : '新增地址'"
      :confirm-loading="addrSaving"
      @ok="onSaveAddr"
      destroy-on-close
    >
      <a-form layout="vertical">
        <a-form-item label="收货人" required>
          <a-input v-model:value="addrForm.receiverName" maxlength="32" placeholder="姓名" />
        </a-form-item>
        <a-form-item label="手机号" required>
          <a-input v-model:value="addrForm.receiverPhone" maxlength="11" placeholder="11位手机号" />
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
          <a-textarea v-model:value="addrForm.detail" :rows="2" maxlength="200" placeholder="街道门牌号等" />
        </a-form-item>
        <a-form-item>
          <a-checkbox :checked="addrForm.isDefault === 1" @change="(e) => (addrForm.isDefault = e.target.checked ? 1 : 0)">
            设为默认地址
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
  </MallShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import MallShell from '@/layouts/MallShell.vue'
import { listAddress, removeAddress, saveAddress, setDefaultAddress } from '@/api/address'
import { listCart } from '@/api/cart'
import { createOrder } from '@/api/order'
import { useCartBadge } from '@/composables/useCartBadge'
import regionOptions from '@/data/china-regions.json'

const placeholder = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'
const route = useRoute()
const router = useRouter()
const { refreshCartCount } = useCartBadge()

const loading = ref(false)
const submitting = ref(false)
const addresses = ref([])
const selectedAddressId = ref(null)
const items = ref([])
const payType = ref('alipay')
const remark = ref('')
const cartItemIds = ref([])

const addrVisible = ref(false)
const addrSaving = ref(false)
const regionPath = ref([])
const addrForm = reactive({
  id: undefined,
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: 0,
})

const totalAmount = computed(() =>
  items.value.reduce((s, i) => s + Number(i.price || 0) * (i.quantity || 0), 0)
)

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}

function filterRegion(inputValue, path) {
  return path.some((opt) => String(opt.label).toLowerCase().includes(String(inputValue).toLowerCase()))
}

function onRegionChange(value) {
  const path = value || []
  addrForm.province = path[0] || ''
  addrForm.city = path[1] || ''
  addrForm.district = path[2] || ''
}

function syncRegionPath() {
  const path = [addrForm.province, addrForm.city, addrForm.district].filter(Boolean)
  regionPath.value = path.length ? path : []
}

async function loadAddress() {
  const res = await listAddress()
  addresses.value = res.data || []
  const def = addresses.value.find((a) => a.isDefault === 1) || addresses.value[0]
  selectedAddressId.value = def?.id || null
}

async function loadItems() {
  const res = await listCart()
  let rows = res.data || []
  if (route.query.goodsId) {
    const gid = Number(route.query.goodsId)
    const hit = rows.filter((i) => i.goodsId === gid)
    if (hit.length) {
      rows = hit
    } else {
      message.warning('请从购物车或商品详情发起结算')
      router.replace('/cart')
      return
    }
  }
  if (!rows.length) {
    message.warning('没有可结算商品')
    router.replace('/cart')
    return
  }
  items.value = rows
  cartItemIds.value = rows.map((i) => i.id)
}

function openAddress(record) {
  if (record) {
    Object.assign(addrForm, {
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
    Object.assign(addrForm, {
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
  addrVisible.value = true
}

async function onSaveAddr() {
  if (!addrForm.receiverName?.trim()) return message.warning('请填写收货人')
  if (!/^1\d{10}$/.test(addrForm.receiverPhone || '')) return message.warning('手机号格式不正确')
  if (!addrForm.province || !addrForm.city || !addrForm.district) return message.warning('请选择省 / 市 / 区')
  if (!addrForm.detail?.trim()) return message.warning('请填写详细地址')
  addrSaving.value = true
  try {
    await saveAddress({ ...addrForm })
    message.success('地址已保存')
    addrVisible.value = false
    await loadAddress()
  } finally {
    addrSaving.value = false
  }
}

async function onSetDefault(a) {
  await setDefaultAddress(a.id)
  message.success('已设为默认')
  await loadAddress()
}

function onRemoveAddr(a) {
  Modal.confirm({
    title: '删除地址',
    content: '确定删除该收货地址？',
    onOk: async () => {
      await removeAddress(a.id)
      message.success('已删除')
      await loadAddress()
    },
  })
}

async function onSubmit() {
  if (!selectedAddressId.value) return message.warning('请选择收货地址')
  if (!items.value.length) return message.warning('没有可结算商品')
  submitting.value = true
  try {
    const payload = {
      addressId: selectedAddressId.value,
      payType: payType.value,
      remark: remark.value,
      cartItemIds: cartItemIds.value,
    }
    const res = await createOrder(payload)
    await refreshCartCount()
    message.success('订单已创建，请支付')
    router.replace(`/order/pay/${res.data.orderNo}`)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (!localStorage.getItem('Access-Token')) {
    message.warning('请先登录')
    router.replace(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  loading.value = true
  try {
    await Promise.all([loadAddress(), loadItems()])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.inner {
  width: 1190px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}
.checkout-page {
  background: #fff;
  border-radius: 4px;
  padding: 20px 24px 28px;
  min-height: 420px;
}
.checkout-page h2 {
  margin: 0 0 18px;
}
.block {
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f0f0f0;
}
.block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.block h3 {
  margin: 0 0 12px;
  font-size: 16px;
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
  cursor: pointer;
  transition: border-color 0.15s;
}
.addr-card.active {
  border-color: #e1251b;
  box-shadow: 0 0 0 1px #e1251b inset;
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
.addr-actions {
  margin-top: 4px;
}
.goods-row {
  display: grid;
  grid-template-columns: 72px 1fr 120px;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
}
.goods-row img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  background: #f5f5f5;
}
.g-name {
  color: #333;
}
.g-price {
  color: #999;
  font-size: 13px;
  margin-top: 4px;
}
.g-sub {
  color: #e1251b;
  font-weight: 600;
  text-align: right;
}
.pay-group :deep(.ant-radio-button-wrapper) {
  height: 40px;
  line-height: 38px;
  margin-right: 10px;
}
.pay-alipay {
  color: #1677ff;
  font-weight: 600;
}
.pay-wx {
  color: #07c160;
  font-weight: 600;
}
.submit-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 18px;
  margin-top: 8px;
}
.total {
  color: #e1251b;
  font-size: 24px;
  font-weight: 700;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
</style>
