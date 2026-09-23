<template>
  <MallShell v-model:model-keyword="keyword" @search="loadGoods">
    <div class="page inner">
      <section class="hero">
        <aside class="cate">
          <div class="cate-title">
            <Icon icon="ant-design:appstore-outlined" :size="16" />
            全部商品分类
          </div>
          <ul>
            <li
              v-for="c in categories"
              :key="c.id"
              :class="{ active: activeCategory === c.id }"
              @click="selectCategory(c.id)"
            >
              <span>{{ c.name }}</span>
              <Icon icon="ant-design:right-outlined" :size="12" />
            </li>
            <li v-if="categories.length === 0" class="empty">暂无分类</li>
          </ul>
        </aside>

        <div class="banner">
          <a-carousel autoplay>
            <div v-for="(b, i) in banners" :key="i" class="banner-slide" :style="{ backgroundImage: `url(${b.img})` }">
              <div class="banner-cap">
                <h2>{{ b.title }}</h2>
                <p>{{ b.desc }}</p>
              </div>
            </div>
          </a-carousel>
        </div>

        <aside class="user-panel">
          <div class="avatar-row">
            <div class="avatar">
              <Icon icon="ant-design:user-outlined" :size="28" />
            </div>
            <div>
              <div class="hi">{{ token ? `Hi，${userName}` : 'Hi，欢迎来到 Nova' }}</div>
              <div class="sub">自营商城 · 正品保障</div>
            </div>
          </div>
          <div class="auth-btns" v-if="!token">
            <a-button type="primary" class="jd-btn" block preIcon="ant-design:login-outlined" @click="$router.push('/login')">
              登录
            </a-button>
            <a-button block class="jd-ghost" preIcon="ant-design:mail-outlined" @click="$router.push('/login?tab=register')">
              邮箱注册
            </a-button>
          </div>
          <div class="auth-btns" v-else>
            <a-button block disabled>我的订单（二期）</a-button>
          </div>
          <ul class="tips">
            <li><Icon icon="ant-design:safety-certificate-outlined" :size="14" /> 正品保障</li>
            <li><Icon icon="ant-design:thunderbolt-outlined" :size="14" /> 极速发货</li>
            <li><Icon icon="ant-design:customer-service-outlined" :size="14" /> 售后无忧</li>
          </ul>
        </aside>
      </section>

      <section class="floor">
        <div class="floor-hd">
          <h3>
            <i></i>
            {{ activeCategory ? '分类精选' : '为你推荐' }}
          </h3>
          <a class="more" @click.prevent="clearCategory" v-if="activeCategory">查看全部</a>
        </div>
        <a-spin :spinning="loading">
          <a-empty v-if="!loading && goods.length === 0" description="暂无商品" />
          <div v-else class="goods-grid">
            <article
              v-for="item in goods"
              :key="item.id"
              class="goods-card"
              @click="$router.push(`/goods/${item.id}`)"
            >
              <div class="cover">
                <img :src="item.cover || placeholder" :alt="item.name" />
              </div>
              <div class="price-row">
                <div class="price">¥{{ formatPrice(item.price) }}</div>
                <div v-if="showOrigin(item)" class="origin">¥{{ formatPrice(item.originalPrice) }}</div>
              </div>
              <div class="name">{{ item.name }}</div>
              <div class="desc">{{ item.subTitle || '自营好物' }}</div>
            </article>
          </div>
        </a-spin>
      </section>

      <section class="floor" v-if="!activeCategory && categoryFloors.length">
        <div v-for="floor in categoryFloors" :key="floor.id" class="cate-floor">
          <div class="floor-hd">
            <h3><i></i>{{ floor.name }}</h3>
            <a class="more" @click.prevent="selectCategory(floor.id)">更多</a>
          </div>
          <div class="goods-grid compact">
            <article
              v-for="item in floor.items"
              :key="item.id"
              class="goods-card"
              @click="$router.push(`/goods/${item.id}`)"
            >
              <div class="cover">
                <img :src="item.cover || placeholder" :alt="item.name" />
              </div>
              <div class="price-row">
                <div class="price">¥{{ formatPrice(item.price) }}</div>
                <div v-if="showOrigin(item)" class="origin">¥{{ formatPrice(item.originalPrice) }}</div>
              </div>
              <div class="name">{{ item.name }}</div>
            </article>
          </div>
        </div>
      </section>
    </div>
  </MallShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MallShell from '@/layouts/MallShell.vue'
import { listCategories, listGoods } from '@/api/goods'

const placeholder = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'
const route = useRoute()
const keyword = ref(route.query.q || '')
const loading = ref(false)
const goods = ref([])
const categories = ref([])
const activeCategory = ref(null)
const token = ref(localStorage.getItem('Access-Token') || '')
const userName = ref(localStorage.getItem('Nova-UserName') || '会员')

const banners = [
  {
    title: '自营爆款直降',
    desc: '精选好物，正品低价',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
  },
  {
    title: '数码电器专场',
    desc: '耳机手表一站购齐',
    img: 'https://images.unsplash.com/photo-1468495244123-6c6c332ee458?w=1200&q=80',
  },
  {
    title: '品质生活',
    desc: '服装食品每日上新',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  },
]

const categoryFloors = computed(() =>
  categories.value.map((c) => ({
    ...c,
    items: goods.value.filter((g) => g.categoryId === c.id).slice(0, 4),
  })).filter((f) => f.items.length)
)

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}

function showOrigin(item) {
  const origin = Number(item?.originalPrice || 0)
  const sale = Number(item?.price || 0)
  return origin > 0 && origin > sale
}

async function loadCategories() {
  const res = await listCategories()
  categories.value = res.data || []
}

async function loadGoods() {
  loading.value = true
  try {
    const res = await listGoods({
      pageNum: 1,
      pageSize: 24,
      name: keyword.value || undefined,
      categoryId: activeCategory.value || undefined,
    })
    goods.value = res.data?.result || []
  } catch (_) {
    goods.value = []
  } finally {
    loading.value = false
  }
}

function selectCategory(id) {
  activeCategory.value = id
  loadGoods()
}

function clearCategory() {
  activeCategory.value = null
  loadGoods()
}

watch(
  () => route.query.q,
  (q) => {
    keyword.value = q || ''
    loadGoods()
  }
)

onMounted(async () => {
  await loadCategories()
  await loadGoods()
})
</script>

<style scoped>
.inner {
  width: 1190px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}
.hero {
  display: grid;
  grid-template-columns: 210px 1fr 220px;
  gap: 10px;
  margin-bottom: 16px;
}
.cate {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  min-height: 340px;
}
.cate-title {
  background: #e1251b;
  color: #fff;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  font-weight: 600;
}
.cate ul {
  list-style: none;
  margin: 0;
  padding: 6px 0;
}
.cate li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  color: #333;
  font-size: 13px;
}
.cate li:hover,
.cate li.active {
  background: #fff1f0;
  color: #e1251b;
}
.cate .empty {
  color: #999;
  cursor: default;
}
.banner {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  min-height: 340px;
}
.banner :deep(.slick-slide) {
  height: 340px;
}
.banner-slide {
  height: 340px;
  background-size: cover;
  background-position: center;
  position: relative;
}
.banner-cap {
  position: absolute;
  left: 28px;
  bottom: 28px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
}
.banner-cap h2 {
  margin: 0 0 6px;
  font-size: 32px;
}
.banner-cap p {
  margin: 0;
  font-size: 14px;
  opacity: 0.92;
}
.user-panel {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.avatar-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #f5f5f5;
  display: grid;
  place-items: center;
  color: #999;
}
.hi {
  font-weight: 600;
}
.sub {
  font-size: 12px;
  color: #999;
}
.auth-btns {
  display: grid;
  gap: 8px;
}
.jd-btn {
  background: #e1251b !important;
  border-color: #e1251b !important;
}
.jd-ghost {
  border-color: #e1251b !important;
  color: #e1251b !important;
}
.tips {
  list-style: none;
  margin: auto 0 0;
  padding: 0;
  color: #666;
  font-size: 12px;
}
.tips li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border-top: 1px dashed #f0f0f0;
}
.floor {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}
.floor-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.floor-hd h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.floor-hd h3 i {
  width: 4px;
  height: 16px;
  background: #e1251b;
  display: inline-block;
}
.more {
  color: #999;
  font-size: 12px;
  cursor: pointer;
}
.more:hover {
  color: #e1251b;
}
.goods-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.goods-grid.compact {
  grid-template-columns: repeat(4, 1fr);
}
.cate-floor + .cate-floor {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #f0f0f0;
}
.goods-card {
  border: 1px solid transparent;
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.goods-card:hover {
  border-color: #e1251b;
  box-shadow: 0 8px 20px rgba(225, 37, 27, 0.08);
}
.cover {
  aspect-ratio: 1;
  background: #f7f7f7;
  overflow: hidden;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}
.goods-card:hover .cover img {
  transform: scale(1.04);
}
.price {
  color: #e1251b;
  font-size: 18px;
  font-weight: 700;
  margin-top: 8px;
}
.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 8px;
}
.price-row .price {
  margin-top: 0;
}
.origin {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}
.name {
  margin-top: 4px;
  font-size: 13px;
  color: #333;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.desc {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 1100px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .goods-grid,
  .goods-grid.compact {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
