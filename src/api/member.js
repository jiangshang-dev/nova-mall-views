import request from '@/utils/request'

export function getProfile() {
  return request.get('/member/profile')
}

export function updateProfile(data) {
  return request.put('/member/profile', data)
}
