import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Получить опубликованные новости (публичное API)
export const getPublishedNews = async (page = 1, limit = 10, tag = null) => {
  try {
    const params = { page, limit }
    if (tag) params.tag = tag
    
    const response = await axios.get(`${API_URL}/news`, { params })
    return response.data
  } catch (error) {
    console.error('Ошибка получения новостей:', error)
    throw error
  }
}

// Получить новость по slug (публичное API)
export const getNewsBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_URL}/news/${slug}`)
    return response.data
  } catch (error) {
    console.error('Ошибка получения новости:', error)
    throw error
  }
}

// Получить популярные теги (публичное API)
export const getPopularTags = async () => {
  try {
    const response = await axios.get(`${API_URL}/news/tags`)
    return response.data
  } catch (error) {
    console.error('Ошибка получения тегов:', error)
    throw error
  }
}

// === АДМИНСКИЕ ФУНКЦИИ (требуют авторизации) ===

// Получить все новости для админки
export const getAllNewsForAdmin = async (page = 1, limit = 20, status = null, search = null) => {
  try {
    const token = localStorage.getItem('token')
    const params = { page, limit }
    if (status) params.status = status
    if (search) params.search = search
    
    const response = await axios.get(`${API_URL}/news/admin/all`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Ошибка получения новостей для админки:', error)
    throw error
  }
}

// Получить новость по ID для редактирования
export const getNewsById = async (id) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/news/admin/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Ошибка получения новости по ID:', error)
    throw error
  }
}

// Создать новость
export const createNews = async (newsData) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post(`${API_URL}/news/admin`, newsData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Ошибка создания новости:', error)
    throw error
  }
}

// Обновить новость
export const updateNews = async (id, newsData) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/news/admin/${id}`, newsData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Ошибка обновления новости:', error)
    throw error
  }
}

// Удалить новость
export const deleteNews = async (id) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.delete(`${API_URL}/news/admin/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Ошибка удаления новости:', error)
    throw error
  }
} 