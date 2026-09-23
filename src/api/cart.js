import request from '@/utils/request'

export function listCart() {
  return request.get('/cart/list')
}

export function addCart(data) {
  return request.post('/cart/add', data)
}

export function updateCartQty(id, quantity) {
  return request.put(`/cart/${id}`, { quantity })
}

export function removeCart(id) {
  return request.delete(`/cart/${id}`)
}
