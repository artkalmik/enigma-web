<template>
  <div :class="['message-item', { 'own-message': isOwn }]">
    <div class="message-content">
      <div class="message-header">
        <span class="sender-name">{{ message.senderName }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      
      <div class="message-body">
        <template v-if="message.encrypted">
          <i class="fas fa-lock encrypted-icon"></i>
        </template>
        <p>{{ message.content }}</p>
      </div>

      <div class="message-footer">
        <span class="message-status" v-if="isOwn">
          <i :class="['fas', message.delivered ? 'fa-check-double' : 'fa-check']"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { Message } from '@/types'

const props = defineProps<{
  message: Message
  isOwn: boolean
}>()

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 1rem;
  justify-content: flex-start;
}

.own-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 0.75rem;
  position: relative;
}

.own-message .message-content {
  background: #dbeafe;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.sender-name {
  font-weight: 500;
  color: #4b5563;
}

.message-time {
  color: #6b7280;
  font-size: 0.75rem;
}

.message-body {
  position: relative;
}

.encrypted-icon {
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 0.875rem;
}

.message-body p {
  margin: 0;
  word-break: break-word;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.message-status {
  color: #6b7280;
  font-size: 0.75rem;
}

.fa-check-double {
  color: #3b82f6;
}
</style> 