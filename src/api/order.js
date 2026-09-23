import request from '@/utils/request'

export function createOrder(data) {
  return request.post('/order/create', data)
}

export function pageMyOrders(params) {
  return request.get('/order/mine', { params })
}

export function getOrder(orderNo) {
  return request.get(`/order/${orderNo}`)
}

export function preparePay(orderNo, payType) {
  return request.post(`/order/${orderNo}/pay`, { payType })
}

export function mockPaySuccess(orderNo) {
  return request.post(`/order/${orderNo}/pay/mock-success`)
}

export function cancelOrder(orderNo) {
  return request.post(`/order/${orderNo}/cancel`)
}
