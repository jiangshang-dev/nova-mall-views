<template>
  <div class="mall-shell">
    <header class="topbar">
      <div class="inner">
        <div class="left">
          <span>你好，欢迎来到 Nova Mall</span>
          <template v-if="token">
            <router-link class="link accent" to="/user">{{ displayName }}</router-link>
            <a class="link" @click.prevent="onLogout">退出</a>
          </template>
          <template v-else>
            <router-link class="link accent" to="/login">请登录</router-link>
            <router-link class="link" to="/login?tab=register">免费注册</router-link>
          </template>
        </div>
        <div class="right">
          <router-link class="link" to="/">商城首页</router-link>
          <span class="sep">|</span>
          <router-link class="link" to="/order">我的订单</router-link>
          <span class="sep">|</span>
          <router-link class="link" to="/user">个人中心</router-link>
          <span class="sep">|</span>
          <a class="link" @click.prevent>客户服务</a>
        </div>
      </div>
    </header>

    <div class="header-row">
      <div class="inner header-inner">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-mark">N</span>
          <div class="logo-text">
            <strong>Nova Mall</strong>
            <em>自营优选</em>
          </div>
        </div>
        <div class="search-box">
          <a-input
            v-model:value="keyword"
            size="large"
            class="search-input"
            placeholder="搜索商品名称"
            @pressEnter="onSearch"
          />
          <a-button type="primary" size="large" class="search-btn" preIcon="ant-design:search-outlined" @click="onSearch">
            搜索
          </a-button>
        </div>
        <a-button class="cart-btn" size="large" preIcon="ant-design:shopping-cart-outlined" @click="$router.push('/cart')">
          我的购物车
          <span v-if="cartCount > 0" class="badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
        </a-button>
      </div>
    </div>

    <main class="main">
      <slot />
    </main>

    <CsWidget />

    <footer class="footer">
      <div class="inner">
        <p>© {{ year }} Nova Mall · 自营 B2C 商城</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { logout as logoutApi } from '@/api/auth'
import { useCartBadge } from '@/composables/useCartBadge'
import CsWidget from '@/components/CsWidget.vue'

const props = defineProps({
  modelKeyword: { type: String, default: '' },
})
const emit = defineEmits(['search', 'update:modelKeyword'])

const route = useRoute()
const router = useRouter()
const keyword = ref(props.modelKeyword || route.query.q || '')
const token = ref(localStorage.getItem('Access-Token') || '')
const displayName = ref(localStorage.getItem('Nova-UserName') || '会员')
const year = new Date().getFullYear()
const { cartCount, refreshCartCount } = useCartBadge()

onMounted(() => {
  refreshCartCount()
})

watch(
  () => route.fullPath,
  () => {
    token.value = localStorage.getItem('Access-Token') || ''
    displayName.value = localStorage.getItem('Nova-UserName') || '会员'
  }
)

watch(
  () => props.modelKeyword,
  (v) => {
    if (v !== undefined) keyword.value = v
  }
)

function onSearch() {
  emit('update:modelKeyword', keyword.value)
  emit('search', keyword.value)
  if (route.path !== '/') {
    router.push({ path: '/', query: keyword.value ? { q: keyword.value } : {} })
  }
}

async function onLogout() {
  try {
    await logoutApi()
  } catch (_) {
    /* ignore */
  }
  localStorage.removeItem('Access-Token')
  localStorage.removeItem('Nova-UserName')
  token.value = ''
  message.success('已退出')
  router.push('/')
}
</script>

<style scoped>
.mall-shell {
  --jd-red: #e1251b;
  --jd-red-dark: #c81623;
  --ink: #222;
  --muted: #999;
  --line: #eee;
  --bg: #f4f4f4;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: "JDZhengHei", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}
.inner {
  width: 1190px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}
.topbar {
  background: #e3e4e5;
  font-size: 12px;
  color: #999;
  height: 30px;
  line-height: 30px;
}
.topbar .inner {
  display: flex;
  justify-content: space-between;
}
.link {
  color: #999;
  margin-left: 10px;
  cursor: pointer;
  text-decoration: none;
}
.link:hover,
.link.accent {
  color: var(--jd-red);
}
.sep {
  margin: 0 4px;
  color: #ccc;
}
.header-row {
  background: #fff;
  padding: 18px 0 12px;
  border-bottom: 2px solid var(--jd-red);
}
.header-inner {
  display: grid;
  grid-template-columns: 180px 1fr 160px;
  gap: 24px;
  align-items: center;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.logo-mark {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(145deg, #ff4d3a, #c81623);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 18px rgba(225, 37, 27, 0.28);
}
.logo-text strong {
  display: block;
  font-size: 22px;
  line-height: 1.1;
  color: #1a1a1a;
}
.logo-text em {
  font-style: normal;
  font-size: 12px;
  color: var(--jd-red);
}
.search-box {
  display: flex;
  border: 2px solid var(--jd-red);
  border-radius: 4px;
  overflow: hidden;
  height: 40px;
}
.search-input :deep(.ant-input) {
  border: none !important;
  box-shadow: none !important;
  height: 36px;
}
.search-btn {
  border-radius: 0 !important;
  background: var(--jd-red) !important;
  border-color: var(--jd-red) !important;
  min-width: 88px;
  height: 40px !important;
}
.cart-btn {
  border-color: #e3e4e5 !important;
  color: var(--jd-red) !important;
  height: 40px !important;
  position: relative;
}
.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--jd-red);
  color: #fff;
  font-size: 12px;
  line-height: 18px;
}
.main {
  padding: 12px 0 40px;
}
.footer {
  background: #fff;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
  padding: 24px 0;
  text-align: center;
}
@media (max-width: 900px) {
  .header-inner {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .cart-btn {
    width: 100%;
  }
  .topbar .right {
    display: none;
  }
}
</style>
