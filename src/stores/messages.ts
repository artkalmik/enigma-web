import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAppStore } from './app'
import { api } from '@/utils/api'
import { encryptMessage, decryptMessage } from '@/utils/crypto'
import { useWebSocket } from '@/composables/useWebSocket'

export interface Message {
  id: number
  sender_id: number
  recipient_id: number
  content_type: string
  size: number
  blockchain_hash: string
  ipfs_hash: string
  blockchain_status: string
  status: string
  is_read: boolean
  read_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  metadata: Record<string, any>
  encrypted_content?: string
  decrypted_content?: string
}

export const useMessagesStore = defineStore('messages', () => {
  const appStore = useAppStore()
  const { subscribe } = useWebSocket()
  
  const messages = ref<Message[]>([])
  const activeChat = ref<number | null>(null)

  const chatMessages = computed(() => 
    messages.value.filter(m => 
      (m.sender_id === activeChat.value) || 
      (m.recipient_id === activeChat.value)
    ).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  )

  const unreadCount = computed(() =>
    messages.value.filter(m => !m.is_read).length
  )

  async function fetchMessages() {
    try {
      appStore.setLoading(true)
      const response = await api.get('/api/v1/messages')
      messages.value = await Promise.all(
        response.data.data.map(async (message: any) => {
          const msg = message.attributes
          if (msg.encrypted_content) {
            msg.decrypted_content = await decryptMessage(msg.encrypted_content)
          }
          return msg
        })
      )
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка загрузки сообщений',
        color: 'error'
      })
    } finally {
      appStore.setLoading(false)
    }
  }

  async function sendMessage(recipientId: number, content: string) {
    try {
      appStore.setLoading(true)
      const encryptedContent = await encryptMessage(content, recipientId)
      
      const response = await api.post('/api/v1/messages', {
        message: {
          recipient_id: recipientId,
          content: encryptedContent,
          content_type: 'text'
        }
      })

      const message = response.data.data.attributes
      message.decrypted_content = content
      messages.value.push(message)

      appStore.showSnackbar({
        text: 'Сообщение отправлено',
        color: 'success'
      })
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка отправки сообщения',
        color: 'error'
      })
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  async function markAsRead(messageId: number) {
    try {
      const response = await api.post(`/api/v1/messages/${messageId}/mark_as_read`)
      const updatedMessage = response.data.data.attributes
      
      const index = messages.value.findIndex(m => m.id === messageId)
      if (index !== -1) {
        messages.value[index] = {
          ...messages.value[index],
          is_read: true,
          read_at: updatedMessage.read_at
        }
      }
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка отметки сообщения',
        color: 'error'
      })
    }
  }

  async function revokeMessage(messageId: number) {
    try {
      await api.post(`/api/v1/messages/${messageId}/revoke`)
      
      const index = messages.value.findIndex(m => m.id === messageId)
      if (index !== -1) {
        messages.value[index].status = 'revoked'
      }

      appStore.showSnackbar({
        text: 'Сообщение отозвано',
        color: 'success'
      })
    } catch (error: any) {
      appStore.showSnackbar({
        text: error.response?.data?.error || 'Ошибка отзыва сообщения',
        color: 'error'
      })
    }
  }

  // Подписка на WebSocket события
  subscribe('message', 'created', async (data: any) => {
    const message = data.data.attributes
    if (message.encrypted_content) {
      message.decrypted_content = await decryptMessage(message.encrypted_content)
    }
    messages.value.push(message)
  })

  subscribe('message', 'updated', (data: any) => {
    const index = messages.value.findIndex(m => m.id === data.id)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...data }
    }
  })

  return {
    messages,
    activeChat,
    chatMessages,
    unreadCount,
    fetchMessages,
    sendMessage,
    markAsRead,
    revokeMessage
  }
}) 