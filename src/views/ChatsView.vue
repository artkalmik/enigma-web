<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Список чатов -->
      <v-col cols="12" sm="4" md="3" class="border-r">
        <v-card flat height="100%">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Чаты</v-toolbar-title>
            <v-spacer />
            <v-btn icon @click="showNewMessageDialog = true">
              <v-icon>mdi-message-plus</v-icon>
            </v-btn>
          </v-toolbar>

          <v-list lines="two">
            <v-list-item
              v-for="contact in contacts"
              :key="contact.id"
              :active="activeChat === contact.id"
              @click="selectChat(contact.id)"
            >
              <template v-slot:prepend>
                <v-avatar color="primary">
                  {{ contact.username.charAt(0).toUpperCase() }}
                </v-avatar>
              </template>

              <v-list-item-title>{{ contact.username }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ getLastMessage(contact.id)?.decrypted_content || 'Нет сообщений' }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-badge
                  v-if="getUnreadCount(contact.id)"
                  :content="getUnreadCount(contact.id)"
                  color="error"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Область сообщений -->
      <v-col cols="12" sm="8" md="9" class="d-flex flex-column">
        <template v-if="activeChat">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>
              {{ getActiveContact?.username }}
            </v-toolbar-title>
            <v-spacer />
            <v-btn icon @click="showContactInfo = true">
              <v-icon>mdi-information</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card
            flat
            class="flex-grow-1 overflow-y-auto"
            style="height: 0"
          >
            <v-container>
              <template v-if="chatMessages.length">
                <div
                  v-for="message in chatMessages"
                  :key="message.id"
                  class="mb-4"
                >
                  <div
                    class="d-flex"
                    :class="message.sender_id === currentUser?.id ? 'justify-end' : ''"
                  >
                    <v-card
                      :color="message.sender_id === currentUser?.id ? 'primary' : 'grey-lighten-3'"
                      :class="message.sender_id === currentUser?.id ? 'white--text' : ''"
                      max-width="70%"
                      elevation="2"
                      rounded="lg"
                    >
                      <v-card-text>
                        <div class="text-body-1">
                          {{ message.decrypted_content }}
                        </div>
                        <div
                          class="text-caption mt-1"
                          :class="message.sender_id === currentUser?.id ? 'text-white' : 'text-grey'"
                        >
                          {{ formatDate(message.created_at) }}
                          <v-icon
                            v-if="message.sender_id === currentUser?.id"
                            size="small"
                            :color="message.is_read ? 'success' : ''"
                          >
                            {{ message.is_read ? 'mdi-check-all' : 'mdi-check' }}
                          </v-icon>
                        </div>
                      </v-card-text>

                      <v-expand-transition>
                        <div v-if="message.sender_id === currentUser?.id">
                          <v-divider />
                          <v-card-actions>
                            <v-btn
                              variant="text"
                              size="small"
                              :disabled="message.status === 'revoked'"
                              @click="revokeMessage(message.id)"
                            >
                              Отозвать
                            </v-btn>
                          </v-card-actions>
                        </div>
                      </v-expand-transition>
                    </v-card>
                  </div>
                </div>
              </template>
              <v-alert
                v-else
                type="info"
                text="Нет сообщений"
              />
            </v-container>
          </v-card>

          <v-card flat class="pa-2">
            <v-form @submit.prevent="sendMessage">
              <v-row align="center">
                <v-col>
                  <v-text-field
                    v-model="newMessage"
                    placeholder="Введите сообщение"
                    hide-details
                    @keydown.enter.prevent="sendMessage"
                  />
                </v-col>
                <v-col cols="auto">
                  <v-btn
                    color="primary"
                    icon
                    :disabled="!newMessage.trim()"
                    @click="sendMessage"
                  >
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </template>

        <v-container
          v-else
          class="fill-height"
        >
          <v-row
            align="center"
            justify="center"
          >
            <v-col cols="12" class="text-center">
              <v-icon
                size="64"
                color="primary"
              >
                mdi-message-text
              </v-icon>
              <div class="text-h6 mt-4">
                Выберите чат для начала общения
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>

    <!-- Диалог нового сообщения -->
    <v-dialog
      v-model="showNewMessageDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>Новое сообщение</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedContact"
            :items="contacts"
            item-title="username"
            item-value="id"
            label="Выберите получателя"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="startNewChat"
          >
            Начать чат
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог информации о контакте -->
    <v-dialog
      v-model="showContactInfo"
      max-width="500"
    >
      <v-card>
        <v-card-title>Информация о контакте</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Имя пользователя</v-list-item-title>
              <v-list-item-subtitle>{{ getActiveContact?.username }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Email</v-list-item-title>
              <v-list-item-subtitle>{{ getActiveContact?.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Адрес кошелька</v-list-item-title>
              <v-list-item-subtitle>{{ getActiveContact?.wallet_address }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="showContactInfo = false"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useContactsStore } from '@/stores/contacts'
import { useMessagesStore } from '@/stores/messages'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

const authStore = useAuthStore()
const contactsStore = useContactsStore()
const messagesStore = useMessagesStore()

const showNewMessageDialog = ref(false)
const showContactInfo = ref(false)
const selectedContact = ref<number | null>(null)
const newMessage = ref('')

const currentUser = computed(() => authStore.user)
const contacts = computed(() => contactsStore.contacts)
const activeChat = computed(() => messagesStore.activeChat)
const chatMessages = computed(() => messagesStore.chatMessages)

const getActiveContact = computed(() => 
  contacts.value.find(c => c.id === activeChat.value)
)

function getLastMessage(contactId: number) {
  return messagesStore.messages
    .filter(m => 
      (m.sender_id === contactId && m.recipient_id === currentUser.value?.id) ||
      (m.sender_id === currentUser.value?.id && m.recipient_id === contactId)
    )
    .sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
}

function getUnreadCount(contactId: number) {
  return messagesStore.messages.filter(m => 
    m.sender_id === contactId &&
    m.recipient_id === currentUser.value?.id &&
    !m.is_read
  ).length
}

function formatDate(date: string) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ru
  })
}

function selectChat(contactId: number) {
  messagesStore.activeChat = contactId
  
  // Отмечаем сообщения как прочитанные
  messagesStore.messages
    .filter(m => 
      m.sender_id === contactId &&
      m.recipient_id === currentUser.value?.id &&
      !m.is_read
    )
    .forEach(m => messagesStore.markAsRead(m.id))
}

async function sendMessage() {
  if (!newMessage.value.trim() || !activeChat.value) return

  try {
    await messagesStore.sendMessage(activeChat.value, newMessage.value)
    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

async function revokeMessage(messageId: number) {
  try {
    await messagesStore.revokeMessage(messageId)
  } catch (error) {
    console.error('Error revoking message:', error)
  }
}

function startNewChat() {
  if (selectedContact.value) {
    messagesStore.activeChat = selectedContact.value
    showNewMessageDialog.value = false
    selectedContact.value = null
  }
}

onMounted(async () => {
  await Promise.all([
    contactsStore.fetchContacts(),
    messagesStore.fetchMessages()
  ])
})
</script>

<style scoped>
.border-r {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}
</style> 