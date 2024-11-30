<template>
  <div class="chat-list">
    <div class="chat-list-header">
      <h2>Чаты</h2>
      <button @click="openNewChatDialog">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <div class="search-bar">
      <i class="fas fa-search"></i>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск чатов..."
      />
    </div>

    <div class="chats-container">
      <template v-if="filteredChats.length">
        <div
          v-for="chat in filteredChats"
          :key="chat.id"
          :class="['chat-item', { active: currentChatId === chat.id }]"
          @click="selectChat(chat)"
        >
          <div class="chat-avatar">
            <img :src="chat.avatar || '/default-avatar.png'" :alt="chat.name">
            <span class="online-status" :class="{ online: chat.isOnline }"></span>
          </div>
          
          <div class="chat-info">
            <div class="chat-header">
              <h3>{{ chat.name }}</h3>
              <span class="last-message-time">{{ formatTime(chat.lastMessageTime) }}</span>
            </div>
            
            <div class="chat-preview">
              <p>{{ chat.lastMessage }}</p>
              <div class="chat-badges">
                <span v-if="chat.unreadCount" class="unread-badge">
                  {{ chat.unreadCount }}
                </span>
                <i v-if="chat.encrypted" class="fas fa-lock"></i>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <div v-else class="no-chats">
        <i class="fas fa-comments"></i>
        <p>{{ searchQuery ? 'Чаты не найдены' : 'Нет активных чатов' }}</p>
      </div>
    </div>

    <dialog ref="newChatDialog" class="new-chat-dialog">
      <h3>Новый чат</h3>
      <form @submit.prevent="createNewChat">
        <input
          type="text"
          v-model="newChatName"
          placeholder="Имя чата"
          required
        />
        <div class="dialog-actions">
          <button type="button" @click="closeNewChatDialog">Отмена</button>
          <button type="submit" :disabled="!newChatName.trim()">Создать</button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from '@vue/runtime-core'
import { useMessagesStore } from '@/stores/messages'
import type { Chat } from '@/types/index'

const messagesStore = useMessagesStore()
const searchQuery = ref('')
const newChatDialog = ref<HTMLDialogElement | null>(null)
const newChatName = ref('')

const currentChatId = computed(() => messagesStore.currentChat?.id)
const chats = computed(() => messagesStore.chats)

const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value
  
  const query = searchQuery.value.toLowerCase()
  return chats.value.filter((chat: Chat) => 
    chat.name.toLowerCase().includes(query) ||
    chat.lastMessage?.toLowerCase().includes(query)
  )
})

const selectChat = (chat: Chat) => {
  messagesStore.setCurrentChat(chat)
}

const formatTime = (timestamp?: number): string => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return date.toLocaleDateString()
}

const openNewChatDialog = () => {
  if (newChatDialog.value) {
    newChatDialog.value.showModal()
  }
}

const closeNewChatDialog = () => {
  if (newChatDialog.value) {
    newChatDialog.value.close()
    newChatName.value = ''
  }
}

const createNewChat = async () => {
  if (!newChatName.value.trim()) return
  
  try {
    await messagesStore.createChat({ name: newChatName.value })
    closeNewChatDialog()
  } catch (error) {
    console.error('Error creating chat:', error)
  }
}
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e5e7eb;
}

.chat-list-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.chat-list-header button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.chat-list-header button:hover {
  color: #4b5563;
}

.search-bar {
  padding: 1rem;
  position: relative;
}

.search-bar i {
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  outline: none;
}

.search-bar input:focus {
  border-color: #3b82f6;
}

.chats-container {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 1rem;
}

.chat-item:hover {
  background-color: #f9fafb;
}

.chat-item.active {
  background-color: #eff6ff;
}

.chat-avatar {
  position: relative;
  width: 48px;
  height: 48px;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #9ca3af;
  border: 2px solid #fff;
}

.online-status.online {
  background-color: #10b981;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
}

.last-message-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-preview p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unread-badge {
  background-color: #3b82f6;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
}

.no-chats {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  padding: 2rem;
}

.no-chats i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.new-chat-dialog {
  border: none;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.new-chat-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.new-chat-dialog h3 {
  margin: 0 0 1rem 0;
}

.new-chat-dialog form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.new-chat-dialog input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  outline: none;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.dialog-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-actions button[type="button"] {
  background-color: #f3f4f6;
  color: #4b5563;
}

.dialog-actions button[type="submit"] {
  background-color: #3b82f6;
  color: white;
}

.dialog-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 