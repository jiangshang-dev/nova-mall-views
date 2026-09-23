import request from '@/utils/request'

export function listGoods(params) {
  return request.get('/goods/list', { params })
}

export function getGoods(id) {
  return request.get(`/goods/${id}`)
}

export function listCategories() {
  return request.get('/goods/category/list')
}
