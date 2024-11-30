import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from './app'
import { api } from '@/utils/api'

export interface Contact {
  id: number
  email: string
  username: string
  wallet_address: string
  public_key: string
  status: string
}

export const useContactsStore = defineStore('contacts', () => {
  const appStore = useAppStore()
  
  const contacts = ref<Contact[]>([])
  const searchResults = ref<Contact[]>([])

  async function fetchContacts() {
    try {
      appStore.setLoading(true)
      const response = await api.get('/api/v1/users')
      contacts.value = response.data.data.map((user: any) => user.attributes)
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка загрузки контактов',
        color: 'error'
      })
    } finally {
      appStore.setLoading(false)
    }
  }

  async function searchUsers(query: string) {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    try {
      appStore.setLoading(true)
      const response = await api.get('/api/v1/users/search', {
        params: { q: query }
      })
      searchResults.value = response.data.data.map((user: any) => user.attributes)
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка поиска пользователей',
        color: 'error'
      })
    } finally {
      appStore.setLoading(false)
    }
  }

  async function getUserDetails(userId: number) {
    try {
      const response = await api.get(`/api/v1/users/${userId}`)
      return response.data.data.attributes
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка получения данных пользователя',
        color: 'error'
      })
      throw error
    }
  }

  return {
    contacts,
    searchResults,
    fetchContacts,
    searchUsers,
    getUserDetails
  }
}) 