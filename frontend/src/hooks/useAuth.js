import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: user, isLoading: loading } = useQuery(
    ['auth', 'me'],
    () => authAPI.getMe(),
    {
      enabled: !!token,
      retry: false,
      onError: () => {
        logout()
      }
    }
  )

  const loginMutation = useMutation(authAPI.login, {
    onSuccess: (data) => {
      setToken(data.token)
      localStorage.setItem('token', data.token)
      queryClient.setQueryData(['auth', 'me'], data.user)
      toast.success('Добро пожаловать!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка входа')
    }
  })

  const registerMutation = useMutation(authAPI.register, {
    onSuccess: (data) => {
      setToken(data.token)
      localStorage.setItem('token', data.token)
      queryClient.setQueryData(['auth', 'me'], data.user)
      toast.success('Регистрация успешна!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка регистрации')
    }
  })

  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
    queryClient.clear()
    toast.success('Вы вышли из системы')
    navigate('/')
  }

  useEffect(() => {
    if (token) {
      authAPI.setAuthToken(token)
    }
  }, [token])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginLoading: loginMutation.isLoading,
    registerLoading: registerMutation.isLoading,
    updateUser: (userData) => {
      queryClient.setQueryData(['auth', 'me'], userData)
    }
  }
} 