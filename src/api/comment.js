import request from '@/utils/request'

export function getComments(goodsId) {
  return request.get(`/goods/${goodsId}/comments`)
}

export function addComment(goodsId, data) {
  return request.post(`/goods/${goodsId}/comments`, data)
}
