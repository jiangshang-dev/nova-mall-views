<template>
  <MallShell>
    <div class="inner order-page">
      <h2>我的订单</h2>
      <a-spin :spinning="loading">
        <a-empty v-if="!loading && list.length === 0" description="暂无订单">
          <a-button type="primary" class="jd-btn" @click="$router.push('/')">去逛逛</a-button>
        </a-empty>
        <div v-for="o in list" :key="o.id" class="order-card">
          <div class="head">
            <span>订单号 {{ o.orderNo }}</span>
            <span class="status" :class="'s' + o.status">{{ o.statusText }}</span>
          </div>
          <div class="addr">
            {{ o.receiverName }} {{ o.receiverPhone }} · {{ o.receiverAddress }}
          </div>
          <div v-for="it in o.items || []" :key="it.id" class="item">
            <img :src="it.goodsCover || placeholder" alt="" />
            <div class="meta">
              <div>{{ it.goodsName }}</div>
              <div class="sub">¥{{ formatPrice(it.price) }} × {{ it.quantity }}</div>
            </div>
            <div class="amt">¥{{ formatPrice(it.amount) }}</div>
          </div>
          <div class="foot">
            <div>
              {{ o.payTypeText || '未支付' }}
              <span v-if="o.deliveryName"> · {{ o.deliveryName }}</span>
              · 合计
              <span class="total">¥{{ formatPrice(o.totalAmount) }}</span>
              <span v-if="o.freightAmount != null" class="freight">（含运费 ¥{{ formatPrice(o.freightAmount) }}）</span>
            </div>
            <div class="ops">
              <a-button v-if="o.status === 0" type="primary" class="jd-btn" @click="$router.push(`/order/pay/${o.orderNo}`)">
                去支付
              </a-button>
              <a-button v-if="o.status === 0 || o.status === 5" @click="onCancel(o)">取消订单</a-button>
            </div>
          </div>
        </div>
        <div v-if="pagination.total > pagination.pageSize" class="pager">
          <a-pagination
            v-model:current="pagination.current"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            @change="load"
          />
        </div>
      </a-spin>
    </div>
  </MallShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import MallShell from '@/layouts/MallShell.vue'
import { cancelOrder, pageMyOrders } from '@/api/order'

const placeholder = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'
const router = useRouter()
const loading = ref(false)
const list = ref([])
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}

async function load() {
  loading.value = true
  try {
    const res = await pageMyOrders({ pageNum: pagination.current, pageSize: pagination.pageSize })
    list.value = res.data.result || []
    pagination.total = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function onCancel(o) {
  Modal.confirm({
    title: '取消订单',
    content: `确定取消订单 ${o.orderNo}？`,
    onOk: async () => {
      await cancelOrder(o.orderNo)
      message.success('已取消')
      load()
    },
  })
}

onMounted(() => {
  if (!localStorage.getItem('Access-Token')) {
    message.warning('请先登录')
    router.replace(`/login?redirect=${encodeURIComponent('/order')}`)
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
.order-page {
  background: #fff;
  border-radius: 4px;
  padding: 20px 24px 28px;
  min-height: 360px;
}
.order-page h2 {
  margin: 0 0 16px;
}
.order-card {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.head {
  display: flex;
  justify-content: space-between;
  color: #666;
  margin-bottom: 8px;
}
.status {
  font-weight: 600;
}
.status.s0 {
  color: #fa8c16;
}
.status.s1 {
  color: #52c41a;
}
.status.s2 {
  color: #999;
}
.status.s3 {
  color: #1677ff;
}
.status.s4 {
  color: #52c41a;
}
.status.s5 {
  color: #fa8c16;
}
.freight {
  color: #999;
  font-size: 12px;
  margin-left: 4px;
}
.addr {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
}
.item {
  display: grid;
  grid-template-columns: 64px 1fr 100px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #fafafa;
}
.item img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  background: #f5f5f5;
}
.sub {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
.amt {
  text-align: right;
  color: #e1251b;
}
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}
.total {
  color: #e1251b;
  font-size: 18px;
  font-weight: 700;
  margin-left: 4px;
}
.ops {
  display: flex;
  gap: 8px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
</style>
