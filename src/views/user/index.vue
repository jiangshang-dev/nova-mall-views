<template>
  <MallShell>
    <div class="inner user-page">
      <aside class="side">
        <div class="side-title">个人中心</div>
        <router-link
          v-for="m in menus"
          :key="m.path"
          class="side-item"
          :class="{ active: isActive(m.path) }"
          :to="m.path"
        >
          {{ m.label }}
        </router-link>
      </aside>
      <section class="content">
        <router-view />
      </section>
    </div>
  </MallShell>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MallShell from '@/layouts/MallShell.vue'

const route = useRoute()
const router = useRouter()

const menus = [
  { path: '/user/profile', label: '账户设置' },
  { path: '/user/address', label: '收货地址' },
  { path: '/order', label: '我的订单' },
]

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

onMounted(() => {
  if (!localStorage.getItem('Access-Token')) {
    message.warning('请先登录')
    router.replace(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
  }
})
</script>

<style scoped>
.inner {
  width: 1190px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}
.user-page {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  min-height: 480px;
}
.side {
  background: #fff;
  border-radius: 4px;
  padding: 16px 0;
}
.side-title {
  padding: 0 20px 12px;
  font-weight: 700;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}
.side-item {
  display: block;
  padding: 10px 20px;
  color: #666;
  text-decoration: none;
}
.side-item:hover,
.side-item.active {
  color: #e1251b;
  background: #fff1f0;
}
.content {
  background: #fff;
  border-radius: 4px;
  padding: 20px 24px 28px;
  min-height: 420px;
}
@media (max-width: 800px) {
  .user-page {
    grid-template-columns: 1fr;
  }
}
</style>
