import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000'
})

//Automatically attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const guestLogin  = ()           => api.post('/auth/guest')
export const signup      = (data)       => api.post('/auth/signup', data)
export const login       = (data)       => api.post('/auth/login', data)
export const getMe       = ()           => api.get('/auth/me')

// Files
export const uploadFile  = (formData)   => api.post('/files/upload', formData)
export const listFiles   = ()           => api.get('/files/list')
export const deleteFile  = (id)         => api.delete(`/files/${id}`)
export const getSchema   = (id)         => api.get(`/files/${id}/schema`)

// Query
export const runQuery    = (data)       => api.post('/query/run', data)
export const getHistory  = (fileId)     => api.get(`/query/history/${fileId}`)

// Insights
export const generateInsights = (data) => api.post('/insights/generate', data)
export const getInsights       = (fileId) => api.get(`/insights/${fileId}`)
export const saveInsight       = (id)  => api.patch(`/insights/${id}/save`)

export default api