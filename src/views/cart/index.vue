<template>
  <MallShell>
    <div class="inner cart-page">
      <h2>我的购物车</h2>
      <a-spin :spinning="loading">
        <a-empty v-if="!loading && list.length === 0" description="购物车还是空的">
          <a-button type="primary" class="jd-btn" @click="$router.push('/')">去逛逛</a-button>
        </a-empty>

        <template v-else>
          <div v-for="item in list" :key="item.id" class="cart-item">
            <img :src="item.cover || placeholder" :alt="item.name" @click="$router.push(`/goods/${item.goodsId}`)" />
            <div class="meta">
              <div class="name" @click="$router.push(`/goods/${item.goodsId}`)">{{ item.name }}</div>
              <div class="price">
                <span class="sale">¥{{ formatPrice(item.price) }}</span>
                <span v-if="item.originalPrice && Number(item.originalPrice) > Number(item.price)" class="origin">
                  ¥{{ formatPrice(item.originalPrice) }}
                </span>
              </div>
            </div>
            <a-input-number
              :value="item.quantity"
              :min="1"
              :max="Math.max(item.stock || 1, 1)"
              @change="(v) => onQty(item, v)"
            />
            <div class="subtotal">¥{{ formatPrice(Number(item.price) * item.quantity) }}</div>
            <a-button type="link" danger @click="onRemove(item)">删除</a-button>
          </div>

          <div class="footer-bar">
            <div>
              已选 {{ totalQty }} 件，合计：
              <span class="total">¥{{ formatPrice(totalAmount) }}</span>
            </div>
            <a-button type="primary" size="large" class="jd-btn" @click="onCheckout">
              {{ buyMode ? '立即结算' : '去结算' }}
            </a-button>
          </div>
        </template>
      </a-spin>
    </div>
  </MallShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MallShell from '@/layouts/MallShell.vue'
import { listCart, removeCart, updateCartQty } from '@/api/cart'
import { useCartBadge } from '@/composables/useCartBadge'

const placeholder = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'
const route = useRoute()
const router = useRouter()
const { refreshCartCount } = useCartBadge()
const loading = ref(false)
const list = ref([])
const buyMode = computed(() => route.query.buy === '1')

const totalQty = computed(() => list.value.reduce((s, i) => s + (i.quantity || 0), 0))
const totalAmount = computed(() =>
  list.value.reduce((s, i) => s + Number(i.price || 0) * (i.quantity || 0), 0)
)

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}

async function load() {
  if (!localStorage.getItem('Access-Token')) {
    message.warning('请先登录')
    router.replace(`/login?redirect=${encodeURIComponent('/cart')}`)
    return
  }
  loading.value = true
  try {
    const res = await listCart()
    let rows = res.data || []
    if (buyMode.value && route.query.goodsId) {
      const gid = Number(route.query.goodsId)
      const hit = rows.filter((i) => i.goodsId === gid)
      if (hit.length) rows = hit
    }
    list.value = rows
    await refreshCartCount()
  } finally {
    loading.value = false
  }
}

async function onQty(item, v) {
  if (!v) return
  await updateCartQty(item.id, v)
  item.quantity = v
  await refreshCartCount()
}

async function onRemove(item) {
  await removeCart(item.id)
  message.success('已删除')
  await load()
}

function onCheckout() {
  if (!list.value.length) return
  const query = {}
  if (buyMode.value && route.query.goodsId) {
    query.goodsId = String(route.query.goodsId)
  }
  router.push({ path: '/checkout', query })
}

onMounted(load)
</script>

<style scoped>
.inner {
  width: 1190px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}
.cart-page {
  background: #fff;
  border-radius: 4px;
  padding: 20px 24px 28px;
  min-height: 360px;
}
.cart-page h2 {
  margin: 0 0 16px;
}
.cart-item {
  display: grid;
  grid-template-columns: 88px 1fr 120px 120px 72px;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}
.cart-item img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  background: #f5f5f5;
  cursor: pointer;
}
.name {
  cursor: pointer;
  color: #333;
}
.name:hover {
  color: #e1251b;
}
.sale {
  color: #e1251b;
  font-weight: 600;
}
.origin {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}
.subtotal {
  color: #e1251b;
  font-weight: 600;
}
.footer-bar {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 18px;
}
.total {
  color: #e1251b;
  font-size: 22px;
  font-weight: 700;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
@media (max-width: 800px) {
  .cart-item {
    grid-template-columns: 72px 1fr;
  }
}
</style>
