import request from '@/utils/request'

export function getFreightOptions(goodsAmount) {
  return request.get('/freight/options', {
    params: goodsAmount != null ? { goodsAmount } : {},
  })
}
