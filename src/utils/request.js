import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'
import { getAppEnvConfig } from '@/utils/env'

const { apiUrl } = getAppEnvConfig()

const service = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
})

service.interceptors.request.use((config) => {
  const token = localStorage.getItem('Access-Token')
  if (token) {
    config.headers['Access-Token'] = token
  }
  return config
})

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      message.error(res.msg || '请求失败')
      if (res.code === 401) {
        localStorage.removeItem('Access-Token')
        router.replace('/login')
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  (error) => {
    message.error(error.response?.data?.msg || error.message || '网络异常')
    return Promise.reject(error)
  }
)

export default service
