import { computed, ref } from 'vue'
import { listCart } from '@/api/cart'

const count = ref(0)

export function useCartBadge() {
  const cartCount = computed(() => count.value)

  async function refreshCartCount() {
    if (!localStorage.getItem('Access-Token')) {
      count.value = 0
      return
    }
    try {
      const res = await listCart()
      const list = res.data || []
      count.value = list.reduce((sum, i) => sum + (i.quantity || 0), 0)
    } catch (_) {
      count.value = 0
    }
  }

  function bumpCartCount(n = 1) {
    count.value += n
  }

  return { cartCount, refreshCartCount, bumpCartCount }
}
