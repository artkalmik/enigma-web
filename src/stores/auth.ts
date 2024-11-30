import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAppStore } from './app'
import { api } from '@/utils/api'
import { useRouter } from 'vue-router'

export interface User {
  id: number
  email: string
  username: string
  wallet_address: string
  public_key: string
  two_factor_enabled: boolean
  status: string
  unread_messages_count: number
  settings: Record<string, any>
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const appStore = useAppStore()
  
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const tempToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function register(credentials: {
    email: string
    username: string
    password: string
    password_confirmation: string
  }) {
    try {
      const response = await api.post('/api/v1/auth/register', { user: credentials })
      const { token: newToken, user: userData } = response.data

      token.value = newToken
      user.value = userData
      localStorage.setItem('token', newToken)

      appStore.showSnackbar({
        text: 'Регистрация успешна',
        color: 'success'
      })

      router.push('/chats')
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка регистрации',
        color: 'error'
      })
      throw error
    }
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      const response = await api.post('/api/v1/auth/login', credentials)
      
      if (response.data.requires_2fa) {
        tempToken.value = response.data.temp_token
        return { requires2FA: true }
      }

      const { token: newToken, user: userData } = response.data

      token.value = newToken
      user.value = userData
      localStorage.setItem('token', newToken)

      appStore.showSnackbar({
        text: 'Вход выполнен успешно',
        color: 'success'
      })

      router.push('/chats')
      return { requires2FA: false }
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка входа',
        color: 'error'
      })
      throw error
    }
  }

  async function verify2FA(code: string) {
    try {
      const response = await api.post('/api/v1/auth/verify_two_factor', {
        temp_token: tempToken.value,
        code
      })

      const { token: newToken, user: userData } = response.data

      token.value = newToken
      user.value = userData
      tempToken.value = null
      localStorage.setItem('token', newToken)

      appStore.showSnackbar({
        text: 'Вход выполнен успешно',
        color: 'success'
      })

      router.push('/chats')
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Неверный код',
        color: 'error'
      })
      throw error
    }
  }

  async function logout() {
    try {
      await api.delete('/api/v1/auth/logout')
      
      token.value = null
      user.value = null
      localStorage.removeItem('token')

      appStore.showSnackbar({
        text: 'Выход выполнен успешно',
        color: 'success'
      })

      router.push('/login')
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка выхода',
        color: 'error'
      })
    }
  }

  async function fetchProfile() {
    try {
      const response = await api.get('/api/v1/profile')
      user.value = response.data.data.attributes
    } catch (error: any) {
      if (error.response?.status === 401) {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        router.push('/login')
      }
      throw error
    }
  }

  return {
    user,
    token,
    tempToken,
    isAuthenticated,
    register,
    login,
    verify2FA,
    logout,
    fetchProfile
  }
}) 