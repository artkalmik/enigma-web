import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAppStore } from './app'
import { api } from '@/utils/api'
import { encryptMessage, decryptMessage } from '@/utils/crypto'
import { useWebSocket } from '@/composables/useWebSocket'
import type { Chat } from '@/types'

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

interface MessagesState {
  messages: Message[]
  chats: Chat[]
  currentChat: Chat | null
}

export const useMessagesStore = defineStore('messages', {
  state: (): MessagesState => ({
    messages: [],
    chats: [],
    currentChat: null
  }),
  getters: {
    chatMessages: (state) => state.messages.filter(m => 
      (m.sender_id === Number(state.currentChat?.id)) || 
      (m.recipient_id === Number(state.currentChat?.id))
    ).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
    unreadCount: (state) => state.messages.filter(m => !m.is_read).length
  },
  actions: {
    setCurrentChat(chat: Chat) {
      this.currentChat = chat
    },
    async createChat(data: { name: string }) {
      const response = await api.post('/api/v1/chats', { chat: data })
      const newChat = response.data.data.attributes
      this.chats.push(newChat)
      return newChat
    },
    async sendMessage(data: { content: string; chatId: number; encrypted: boolean }) {
      const response = await api.post('/api/v1/messages', { message: data })
      const newMessage = response.data.data.attributes
      this.messages.push(newMessage)
      return newMessage
    },
    async clearHistory(chatId: number) {
      await api.delete(`/api/v1/chats/${chatId}/messages`)
      this.messages = this.messages.filter(m => 
        m.sender_id !== chatId && m.recipient_id !== chatId
      )
    }
  }
}) 