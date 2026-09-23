<template>
  <MallShell>
    <div class="inner pay-page">
      <a-spin :spinning="loading || paying">
        <template v-if="order">
          <a-result
            v-if="order.status === 1"
            status="success"
            title="支付成功"
            :sub-title="`订单号 ${order.orderNo}，已通过${order.payTypeText}付款 ¥${formatPrice(order.totalAmount)}`"
          >
            <template #extra>
              <a-button type="primary" class="jd-btn" @click="$router.push('/order')">查看订单</a-button>
              <a-button @click="$router.push('/')">继续购物</a-button>
            </template>
          </a-result>

          <a-result
            v-else-if="order.status === 5"
            status="info"
            title="货到付款订单已提交"
            :sub-title="`订单号 ${order.orderNo}，请等待同城配送，收货时现金付款，运营核销后完成。应付 ¥${formatPrice(order.totalAmount)}`"
          >
            <template #extra>
              <a-button type="primary" class="jd-btn" @click="$router.push('/order')">查看订单</a-button>
              <a-button @click="$router.push('/')">继续购物</a-button>
            </template>
          </a-result>

          <template v-else-if="order.status === 0">
            <h2>订单支付</h2>
            <div class="pay-card">
              <div class="row"><span>订单号</span><strong>{{ order.orderNo }}</strong></div>
              <div class="row"><span>收货人</span><span>{{ order.receiverName }} {{ order.receiverPhone }}</span></div>
              <div class="row"><span>收货地址</span><span>{{ order.receiverAddress }}</span></div>
              <div class="row amount">
                <span>应付金额</span>
                <span class="price">¥{{ formatPrice(order.totalAmount) }}</span>
              </div>
            </div>

            <div class="pay-select">
              <h3>选择支付方式</h3>
              <a-radio-group v-model:value="payType" class="pay-group">
                <a-radio-button value="wxpay"><span class="pay-wx">微信扫码支付</span></a-radio-button>
                <a-radio-button value="alipay"><span class="pay-alipay">支付宝</span></a-radio-button>
              </a-radio-group>

              <!-- 选中微信即展示付款码，无需再点「获取」 -->
              <div v-if="payType === 'wxpay'" class="wx-native">
                <div v-if="displayCodeUrl" class="qr-panel">
                  <div class="qr-frame">
                    <img :src="qrSrc(displayCodeUrl)" alt="微信扫码支付" />
                    <div v-if="payInfo?.demoMode !== false" class="demo-badge">演示码</div>
                  </div>
                  <div class="qr-side">
                    <h4>请打开手机微信扫一扫</h4>
                    <p class="amt">应付 <em>¥{{ formatPrice(order.totalAmount) }}</em></p>
                    <p class="tip">{{ payInfo?.payTip || '请使用微信扫码完成支付' }}</p>
                    <a-space>
                      <a-button type="primary" class="wx-btn" :loading="polling" @click="onConfirmWxPaid">
                        {{ payInfo?.demoMode === false ? '我已完成支付' : '模拟扫码支付成功' }}
                      </a-button>
                      <a-button :loading="paying" @click="fetchWxQr(true)">刷新二维码</a-button>
                    </a-space>
                  </div>
                </div>
                <div v-else class="qr-loading">正在拉起微信付款码…</div>
              </div>

              <div v-else class="ali-todo">
                <a-alert type="info" show-icon message="支付宝收银台后续接入" description="本期先完成微信扫码，支付宝暂不处理。" />
              </div>

              <div class="actions">
                <a-button size="large" @click="$router.push('/order')">稍后支付</a-button>
              </div>
            </div>
          </template>

          <a-result v-else status="warning" :title="order.statusText || '订单不可支付'">
            <template #extra>
              <a-button type="primary" class="jd-btn" @click="$router.push('/order')">我的订单</a-button>
            </template>
          </a-result>
        </template>
      </a-spin>
    </div>
  </MallShell>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MallShell from '@/layouts/MallShell.vue'
import { getOrder, mockPaySuccess, preparePay } from '@/api/order'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const paying = ref(false)
const polling = ref(false)
const order = ref(null)
const payType = ref('wxpay')
const payInfo = ref(null)
let pollTimer = null
let fetching = false

const displayCodeUrl = computed(() => {
  if (payInfo.value?.codeUrl) return payInfo.value.codeUrl
  if (payType.value === 'wxpay' && order.value?.orderNo) {
    return `weixin://wxpay/bizpayurl?pr=DEMO${order.value.orderNo}`
  }
  return ''
})

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}

function qrSrc(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function startPoll() {
  stopPoll()
  if (payInfo.value?.demoMode !== false) return
  pollTimer = setInterval(async () => {
    try {
      const res = await getOrder(route.params.orderNo)
      order.value = res.data
      if (res.data?.status === 1) {
        stopPoll()
        message.success('支付成功')
      }
    } catch (_) {
      /* ignore */
    }
  }, 3000)
}

async function fetchWxQr(manual = false) {
  if (fetching) return
  fetching = true
  paying.value = true
  try {
    const prep = await preparePay(route.params.orderNo, 'wxpay')
    const data = prep.data || {}
    if (!data.codeUrl) {
      data.codeUrl = `weixin://wxpay/bizpayurl?pr=DEMO${route.params.orderNo}`
      data.demoMode = true
    }
    payInfo.value = data
    if (manual) {
      message.success(data.demoMode ? '已刷新演示收款码' : '已刷新支付二维码')
    }
    startPoll()
  } catch (e) {
    // 接口失败仍展示本地演示码，避免空白
    payInfo.value = {
      demoMode: true,
      codeUrl: `weixin://wxpay/bizpayurl?pr=DEMO${route.params.orderNo}`,
      payTip: e?.message || '拉起支付失败，当前为演示码',
    }
  } finally {
    paying.value = false
    fetching = false
  }
}

async function onConfirmWxPaid() {
  polling.value = true
  try {
    if (payInfo.value?.demoMode !== false) {
      const res = await mockPaySuccess(route.params.orderNo)
      order.value = res.data
      stopPoll()
      message.success('支付成功')
      return
    }
    const res = await getOrder(route.params.orderNo)
    order.value = res.data
    if (res.data?.status === 1) {
      stopPoll()
      message.success('支付成功')
    } else {
      message.info('尚未收到微信回调，请稍后再点或等待自动刷新')
    }
  } finally {
    polling.value = false
  }
}

async function load() {
  loading.value = true
  try {
    const res = await getOrder(route.params.orderNo)
    order.value = res.data
    if (res.data?.payType === 'alipay') {
      payType.value = 'alipay'
    } else {
      payType.value = 'wxpay'
    }
  } finally {
    loading.value = false
  }
}

watch(payType, (v) => {
  stopPoll()
  if (v === 'wxpay' && order.value?.status === 0) {
    fetchWxQr(false)
  } else {
    payInfo.value = null
  }
})

watch(
  () => order.value?.status,
  (s) => {
    if (s === 1) stopPoll()
  }
)

onMounted(async () => {
  if (!localStorage.getItem('Access-Token')) {
    message.warning('请先登录')
    router.replace(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  await load()
  if (order.value?.status === 0 && payType.value === 'wxpay') {
    await fetchWxQr(false)
  }
})

onBeforeUnmount(stopPoll)
</script>

<style scoped>
.inner {
  width: 1190px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}
.pay-page {
  background: #fff;
  border-radius: 4px;
  padding: 24px;
  min-height: 420px;
}
.pay-page h2 {
  margin: 0 0 16px;
}
.pay-card {
  background: #fafafa;
  border-radius: 4px;
  padding: 16px 18px;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  color: #555;
}
.amount {
  border-top: 1px dashed #e5e5e5;
  margin-top: 8px;
  padding-top: 14px;
  align-items: center;
}
.price {
  color: #e1251b;
  font-size: 26px;
  font-weight: 700;
}
.pay-select {
  margin-top: 24px;
}
.pay-select h3 {
  margin: 0 0 12px;
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
.wx-native {
  margin-top: 20px;
  padding: 20px;
  background: #f7faf7;
  border: 1px solid #d9f0dd;
  border-radius: 6px;
  min-height: 200px;
}
.qr-panel {
  display: flex;
  gap: 28px;
  align-items: center;
  flex-wrap: wrap;
}
.qr-frame {
  position: relative;
  width: 220px;
  height: 220px;
  background: #fff;
  border: 1px solid #e8e8e8;
  padding: 10px;
}
.qr-frame img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.demo-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #fa8c16;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.qr-side h4 {
  margin: 0 0 10px;
  font-size: 18px;
}
.qr-side .amt {
  margin: 0 0 8px;
  color: #666;
}
.qr-side .amt em {
  color: #e1251b;
  font-style: normal;
  font-size: 22px;
  font-weight: 700;
}
.qr-side .tip {
  color: #888;
  font-size: 13px;
  max-width: 360px;
  line-height: 1.6;
  margin-bottom: 16px;
}
.qr-loading {
  color: #666;
  padding: 40px 0;
  text-align: center;
}
.ali-todo {
  margin-top: 16px;
}
.wx-btn {
  background: #07c160 !important;
  border-color: #07c160 !important;
}
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
@media (max-width: 700px) {
  .qr-panel {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
