import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data.user
  }
}

// Tasks API
export const tasksAPI = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params })
    return response.data
  },
  
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },
  
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData)
    return response.data
  },
  
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData)
    return response.data
  },
  
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  }
}

// Bids API
export const bidsAPI = {
  getBidsForTask: async (taskId) => {
    const response = await api.get(`/bids/task/${taskId}`)
    return response.data
  },
  
  createBid: async (bidData) => {
    const response = await api.post('/bids', bidData)
    return response.data
  },
  
  acceptBid: async (bidId) => {
    const response = await api.put(`/bids/${bidId}/accept`)
    return response.data
  },
  
  rejectBid: async (bidId) => {
    const response = await api.put(`/bids/${bidId}/reject`)
    return response.data
  }
}

// Messages API
export const messagesAPI = {
  getMessages: async (taskId) => {
    const response = await api.get(`/messages/task/${taskId}`)
    return response.data
  },
  
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData)
    return response.data
  },
  
  markAsRead: async (taskId) => {
    const response = await api.put(`/messages/read/${taskId}`)
    return response.data
  }
}

export default api 