import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('@/views/home/index.vue') },
    { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue') },
    { path: '/goods/:id', name: 'GoodsDetail', component: () => import('@/views/goods/detail.vue') },
    { path: '/cart', name: 'Cart', component: () => import('@/views/cart/index.vue') },
    { path: '/checkout', name: 'Checkout', component: () => import('@/views/order/checkout.vue') },
    { path: '/order', name: 'MyOrders', component: () => import('@/views/order/index.vue') },
    { path: '/order/pay/:orderNo', name: 'OrderPay', component: () => import('@/views/order/pay.vue') },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
