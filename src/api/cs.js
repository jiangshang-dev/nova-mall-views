import request from '@/utils/request'

export function openCsSession() {
  return request.post('/cs/session/open')
}

export function csMessages(sessionNo, limit = 100) {
  return request.get(`/cs/session/${sessionNo}/messages`, { params: { limit } })
}

export function csWaiting() {
  return request.get('/cs/admin/waiting')
}

export function csMine() {
  return request.get('/cs/admin/mine')
}

export function csAssign(sessionNo) {
  return request.post('/cs/admin/assign', { sessionNo })
}
