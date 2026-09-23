<template>
  <MallShell>
    <div class="inner detail-page">
      <a-button type="link" class="back" preIcon="ant-design:arrow-left-outlined" @click="$router.push('/')">
        返回首页
      </a-button>

      <a-spin :spinning="loading">
        <template v-if="goods">
          <div class="panel">
            <div class="gallery">
              <img :src="goods.cover || placeholder" :alt="goods.name" />
            </div>
            <div class="info">
              <h1>{{ goods.name }}</h1>
              <p class="sub">{{ goods.subTitle || '自营正品' }}</p>

              <div class="rate-row" v-if="commentSummary">
                <a-rate :value="commentSummary.avgStar" allow-half disabled />
                <span class="rate-text">{{ commentSummary.avgStar }} 分 · {{ commentSummary.total }} 条评价</span>
              </div>

              <div class="price-box">
                <span class="label">优惠价</span>
                <span class="price">¥{{ formatPrice(goods.price) }}</span>
                <span v-if="showOrigin(goods)" class="origin">¥{{ formatPrice(goods.originalPrice) }}</span>
              </div>

              <div class="meta">
                <span><Icon icon="ant-design:database-outlined" :size="14" /> 库存 {{ goods.stock }}</span>
                <span><Icon icon="ant-design:fire-outlined" :size="14" /> 销量 {{ goods.sales || 0 }}</span>
              </div>

              <div class="qty-row">
                <span>数量</span>
                <a-input-number v-model:value="quantity" :min="1" :max="Math.max(goods.stock || 1, 1)" />
              </div>

              <div class="actions">
                <a-button
                  size="large"
                  class="cart-outline"
                  :loading="adding"
                  preIcon="ant-design:shopping-cart-outlined"
                  @click="onAddCart"
                >
                  加入购物车
                </a-button>
                <a-button
                  type="primary"
                  size="large"
                  class="jd-btn"
                  :loading="buying"
                  preIcon="ant-design:thunderbolt-outlined"
                  @click="onBuyNow"
                >
                  立即购买
                </a-button>
              </div>
            </div>
          </div>

          <div class="tabs-card">
            <a-tabs v-model:activeKey="tab">
              <a-tab-pane key="detail" tab="商品详情">
                <div class="rich" v-if="goods.detail" v-html="goods.detail"></div>
                <a-empty v-else description="暂无图文详情" />
              </a-tab-pane>
              <a-tab-pane key="comment" :tab="`商品评价(${commentSummary?.total || 0})`">
                <div class="comment-head">
                  <div class="avg">
                    <div class="avg-num">{{ commentSummary?.avgStar || 5 }}</div>
                    <a-rate :value="commentSummary?.avgStar || 5" allow-half disabled />
                    <div class="avg-tip">综合评分</div>
                  </div>
                  <div class="write" v-if="token && commentSummary?.canComment">
                    <div class="write-title">写评价</div>
                    <a-rate v-model:value="form.star" />
                    <a-textarea
                      v-model:value="form.content"
                      :rows="3"
                      maxlength="200"
                      show-count
                      placeholder="分享你的使用体验"
                      style="margin-top: 8px"
                    />
                    <a-button
                      type="primary"
                      class="jd-btn"
                      style="margin-top: 10px"
                      :loading="commenting"
                      @click="onSubmitComment"
                    >
                      提交评价
                    </a-button>
                  </div>
                  <div v-else class="login-tip">
                    <template v-if="!token">
                      <a-button type="link" @click="$router.push(`/login?redirect=${encodeURIComponent($route.fullPath)}`)">
                        登录后可评价
                      </a-button>
                    </template>
                    <template v-else>
                      <a-alert
                        type="info"
                        show-icon
                        :message="commentSummary?.commentTip || '购买并完成支付后才可以评价'"
                      />
                    </template>
                  </div>
                </div>

                <a-list
                  item-layout="horizontal"
                  :data-source="commentSummary?.list || []"
                  :locale="{ emptyText: '暂无评价，来抢沙发吧' }"
                >
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-list-item-meta>
                        <template #avatar>
                          <a-avatar style="background:#e1251b">{{ (item.userName || '用')[0] }}</a-avatar>
                        </template>
                        <template #title>
                          <span>{{ item.userName || '匿名用户' }}</span>
                          <a-rate :value="item.star" disabled style="margin-left: 8px; font-size: 12px" />
                        </template>
                        <template #description>
                          <div class="c-content">{{ item.content }}</div>
                          <div class="c-time">{{ formatTime(item.createTime) }}</div>
                        </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </template>
                </a-list>
              </a-tab-pane>
            </a-tabs>
          </div>
        </template>
      </a-spin>
    </div>
  </MallShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MallShell from '@/layouts/MallShell.vue'
import { getGoods } from '@/api/goods'
import { addComment, getComments } from '@/api/comment'
import { addCart } from '@/api/cart'
import { useCartBadge } from '@/composables/useCartBadge'

const placeholder = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'
const route = useRoute()
const router = useRouter()
const { bumpCartCount, refreshCartCount } = useCartBadge()

const loading = ref(true)
const goods = ref(null)
const quantity = ref(1)
const tab = ref('detail')
const adding = ref(false)
const buying = ref(false)
const commenting = ref(false)
const commentSummary = ref(null)
const token = ref(localStorage.getItem('Access-Token') || '')
const form = reactive({ star: 5, content: '' })

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}
function showOrigin(item) {
  const origin = Number(item?.originalPrice || 0)
  const sale = Number(item?.price || 0)
  return origin > 0 && origin > sale
}
function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(Number(ts))
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function ensureLogin() {
  if (localStorage.getItem('Access-Token')) return true
  message.warning('请先登录')
  router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
  return false
}

async function loadGoods() {
  loading.value = true
  try {
    const res = await getGoods(route.params.id)
    goods.value = res.data
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  const res = await getComments(route.params.id)
  commentSummary.value = res.data || { avgStar: 5, total: 0, list: [] }
}

async function onAddCart() {
  if (!ensureLogin()) return
  adding.value = true
  try {
    await addCart({ goodsId: Number(route.params.id), quantity: quantity.value })
    bumpCartCount(quantity.value)
    message.success('已加入购物车')
  } finally {
    adding.value = false
  }
}

async function onBuyNow() {
  if (!ensureLogin()) return
  buying.value = true
  try {
    await addCart({ goodsId: Number(route.params.id), quantity: quantity.value })
    await refreshCartCount()
    message.success('正在前往结算')
    router.push({ path: '/checkout', query: { goodsId: String(route.params.id) } })
  } finally {
    buying.value = false
  }
}

async function onSubmitComment() {
  if (!ensureLogin()) return
  if (!form.content.trim()) {
    message.warning('请填写评价内容')
    return
  }
  commenting.value = true
  try {
    await addComment(route.params.id, { star: form.star, content: form.content.trim() })
    message.success('评价成功')
    form.content = ''
    form.star = 5
    await loadComments()
    tab.value = 'comment'
  } finally {
    commenting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadGoods(), loadComments(), refreshCartCount()])
})
</script>

<style scoped>
.inner {
  width: 1190px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}
.back {
  margin-bottom: 8px;
  color: #666 !important;
}
.panel {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 28px;
  background: #fff;
  border-radius: 4px;
  padding: 24px;
}
.gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #f5f5f5;
}
.info h1 {
  margin: 0 0 8px;
  font-size: 22px;
}
.sub {
  color: #999;
}
.rate-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 4px;
}
.rate-text {
  color: #666;
  font-size: 12px;
}
.price-box {
  margin: 16px 0;
  background: #fff1f0;
  padding: 14px 16px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.label {
  color: #999;
  font-size: 12px;
}
.price {
  color: #e1251b;
  font-size: 32px;
  font-weight: 700;
}
.origin {
  color: #999;
  font-size: 16px;
  text-decoration: line-through;
}
.meta {
  display: flex;
  gap: 18px;
  color: #666;
  margin-bottom: 16px;
}
.meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.qty-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
.cart-outline {
  border-color: #e1251b !important;
  color: #e1251b !important;
}
.tabs-card {
  margin-top: 16px;
  background: #fff;
  border-radius: 4px;
  padding: 8px 20px 24px;
}
.rich {
  line-height: 1.8;
  color: #333;
  min-height: 120px;
}
.rich :deep(img) {
  max-width: 100%;
}
.comment-head {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 24px;
  padding: 12px 0 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}
.avg {
  text-align: center;
}
.avg-num {
  font-size: 36px;
  color: #e1251b;
  font-weight: 700;
  line-height: 1;
}
.avg-tip {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
.write-title {
  font-weight: 600;
  margin-bottom: 6px;
}
.c-content {
  color: #333;
  margin: 4px 0;
}
.c-time {
  color: #bbb;
  font-size: 12px;
}
@media (max-width: 800px) {
  .panel,
  .comment-head {
    grid-template-columns: 1fr;
  }
}
</style>
