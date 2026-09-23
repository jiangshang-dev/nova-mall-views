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
    {
      path: '/user',
      name: 'UserCenter',
      component: () => import('@/views/user/index.vue'),
      redirect: '/user/profile',
      children: [
        { path: 'profile', name: 'UserProfile', component: () => import('@/views/user/profile.vue') },
        { path: 'address', name: 'UserAddress', component: () => import('@/views/user/address.vue') },
        { path: 'orders', name: 'UserOrders', redirect: '/order' },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
