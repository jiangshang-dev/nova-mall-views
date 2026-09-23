<template>
  <MallShell>
    <div class="inner pay-page">
      <a-spin :spinning="loading">
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
                <a-radio-button value="alipay"><span class="pay-alipay">支付宝</span></a-radio-button>
                <a-radio-button value="wxpay"><span class="pay-wx">微信支付</span></a-radio-button>
              </a-radio-group>
              <a-alert
                style="margin-top: 16px"
                type="info"
                show-icon
                message="演示支付"
                description="未配置真实商户密钥时，将模拟支付宝/微信支付回调并完成扣库存。"
              />
              <div class="actions">
                <a-button size="large" @click="$router.push('/order')">稍后支付</a-button>
                <a-button type="primary" size="large" class="jd-btn" :loading="paying" @click="onPay">
                  {{ payType === 'alipay' ? '去支付宝支付' : '去微信支付' }}
                </a-button>
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
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import MallShell from '@/layouts/MallShell.vue'
import { getOrder, mockPaySuccess, preparePay } from '@/api/order'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const paying = ref(false)
const order = ref(null)
const payType = ref('alipay')

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}

async function load() {
  loading.value = true
  try {
    const res = await getOrder(route.params.orderNo)
    order.value = res.data
    if (res.data?.payType) payType.value = res.data.payType
  } finally {
    loading.value = false
  }
}

async function onPay() {
  paying.value = true
  try {
    const prep = await preparePay(route.params.orderNo, payType.value)
    const tip = prep.data?.payTip || '确认模拟支付？'
    Modal.confirm({
      title: prep.data?.payTypeText || '确认支付',
      content: tip,
      okText: '确认已支付',
      cancelText: '取消',
      onOk: async () => {
        const res = await mockPaySuccess(route.params.orderNo)
        order.value = res.data
        message.success('支付成功')
      },
    })
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  if (!localStorage.getItem('Access-Token')) {
    message.warning('请先登录')
    router.replace(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  load()
})
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
</style>
