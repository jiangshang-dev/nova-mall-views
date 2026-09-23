import request from '@/utils/request'

export function login(data) {
  return request.post('/auth/login', { ...data, clientType: 'app' })
}

export function register(data) {
  return request.post('/auth/register', { ...data, clientType: 'app' })
}

export function logout() {
  return request.post('/auth/logout')
}

export function getInfo() {
  return request.get('/auth/info')
}
