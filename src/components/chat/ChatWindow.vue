<template>
  <div class="chat-window">
    <div class="chat-header">
      <h2>{{ currentChat?.name || 'Выберите чат' }}</h2>
      <div class="chat-actions" v-if="currentChat">
        <button @click="toggleEncryption">
          <i :class="['fas', isEncrypted ? 'fa-lock' : 'fa-lock-open']"></i>
        </button>
        <button @click="clearHistory">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <div class="messages-container" ref="messagesContainer">
      <template v-if="currentChat">
        <message-item
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :is-own="message.sender_id === currentUserId"
        />
      </template>
      <div v-else class="no-chat-selected">
        <i class="fas fa-comments"></i>
        <p>Выберите чат для начала общения</p>
      </div>
    </div>

    <div class="chat-input" v-if="currentChat">
      <textarea
        v-model="newMessage"
        @keyup.enter.exact.prevent="sendMessage"
        placeholder="Введите сообщение..."
      ></textarea>
      <div class="input-actions">
        <button @click="attachFile">
          <i class="fas fa-paperclip"></i>
        </button>
        <button @click="sendMessage" :disabled="!newMessage.trim()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue/dist/vue.runtime.esm-bundler'
import { useMessagesStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import MessageItem from '@/components/chat/MessageItem.vue'
import type { Message } from '@/stores/messages'

export default defineComponent({
  name: 'ChatWindow',
  components: { MessageItem },
  setup() {
    const messagesStore = useMessagesStore()
    const authStore = useAuthStore()

    const messagesContainer = ref<HTMLElement | null>(null)
    const newMessage = ref('')
    const isEncrypted = ref(true)

    const currentUserId = computed(() => authStore.user?.id || null)
    const currentChat = computed(() => messagesStore.currentChat)
    const messages = computed(() => messagesStore.messages)

    function toggleEncryption() {
      isEncrypted.value = !isEncrypted.value
    }

    function scrollToBottom() {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    async function sendMessage() {
      if (!newMessage.value.trim() || !currentChat.value) return
      
      try {
        await messagesStore.sendMessage({
          content: newMessage.value,
          chatId: Number(currentChat.value.id),
          encrypted: isEncrypted.value
        })
        newMessage.value = ''
        scrollToBottom()
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }

    async function clearHistory() {
      if (!currentChat.value) return
      if (confirm('Вы уверены, что хотите очистить историю чата?')) {
        await messagesStore.clearHistory(Number(currentChat.value.id))
      }
    }

    function attachFile() {
      // Реализация прикрепления файлов будет добавлена позже
    }

    watch(() => messages.value, scrollToBottom, { deep: true })

    onMounted(() => {
      scrollToBottom()
    })

    return {
      messagesContainer,
      newMessage,
      isEncrypted,
      currentUserId,
      currentChat,
      messages,
      toggleEncryption,
      sendMessage,
      clearHistory,
      attachFile
    }
  }
})
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-actions button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.chat-actions button:hover {
  color: #4b5563;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.no-chat-selected {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.no-chat-selected i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
}

.chat-input textarea {
  flex: 1;
  resize: none;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.5rem;
  min-height: 40px;
  max-height: 120px;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.input-actions button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.input-actions button:hover:not(:disabled) {
  color: #4b5563;
}

.input-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 