import request from '@/utils/request'

export function listAddress() {
  return request.get('/address/list')
}

export function saveAddress(data) {
  return request.post('/address/save', data)
}

export function removeAddress(id) {
  return request.delete(`/address/${id}`)
}

export function setDefaultAddress(id) {
  return request.put(`/address/${id}/default`)
}
