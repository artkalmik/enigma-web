<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Контакты</v-toolbar-title>
            <v-spacer />
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск пользователей"
              single-line
              hide-details
              @input="searchUsers"
            />
          </v-toolbar>

          <v-card-text>
            <v-tabs v-model="activeTab">
              <v-tab value="contacts">Мои контакты</v-tab>
              <v-tab value="search">Поиск</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <!-- Список контактов -->
              <v-window-item value="contacts">
                <v-list>
                  <v-list-item
                    v-for="contact in contacts"
                    :key="contact.id"
                    :subtitle="contact.email"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="primary">
                        {{ contact.username.charAt(0).toUpperCase() }}
                      </v-avatar>
                    </template>

                    <v-list-item-title>{{ contact.username }}</v-list-item-title>

                    <template v-slot:append>
                      <v-btn
                        icon
                        variant="text"
                        @click="startChat(contact.id)"
                      >
                        <v-icon>mdi-chat</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        @click="showContactDetails(contact)"
                      >
                        <v-icon>mdi-information</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-window-item>

              <!-- Результаты поиска -->
              <v-window-item value="search">
                <v-list v-if="searchResults.length">
                  <v-list-item
                    v-for="user in searchResults"
                    :key="user.id"
                    :subtitle="user.email"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="primary">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </v-avatar>
                    </template>

                    <v-list-item-title>{{ user.username }}</v-list-item-title>

                    <template v-slot:append>
                      <v-btn
                        icon
                        variant="text"
                        @click="startChat(user.id)"
                      >
                        <v-icon>mdi-chat</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        @click="showContactDetails(user)"
                      >
                        <v-icon>mdi-information</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
                <v-alert
                  v-else-if="searchQuery"
                  type="info"
                  text="Пользователи не найдены"
                />
                <v-alert
                  v-else
                  type="info"
                  text="Введите имя пользователя или email для поиска"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог с информацией о контакте -->
    <v-dialog
      v-model="showContactInfo"
      max-width="500"
    >
      <v-card v-if="selectedContact">
        <v-card-title>Информация о контакте</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Имя пользователя</v-list-item-title>
              <v-list-item-subtitle>{{ selectedContact.username }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Email</v-list-item-title>
              <v-list-item-subtitle>{{ selectedContact.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Адрес кошелька</v-list-item-title>
              <v-list-item-subtitle>{{ selectedContact.wallet_address }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Публичный ключ</v-list-item-title>
              <v-list-item-subtitle class="text-truncate">{{ selectedContact.public_key }}</v-list-item-subtitle>
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
import { useRouter } from 'vue-router'
import { useContactsStore } from '@/stores/contacts'
import { useMessagesStore } from '@/stores/messages'
import type { Contact } from '@/stores/contacts'

const router = useRouter()
const contactsStore = useContactsStore()
const messagesStore = useMessagesStore()

const activeTab = ref('contacts')
const searchQuery = ref('')
const showContactInfo = ref(false)
const selectedContact = ref<Contact | null>(null)

const contacts = computed(() => contactsStore.contacts)
const searchResults = computed(() => contactsStore.searchResults)

async function searchUsers() {
  if (searchQuery.value.length >= 2) {
    await contactsStore.searchUsers(searchQuery.value)
  }
}

function startChat(userId: number) {
  messagesStore.activeChat = userId
  router.push('/chats')
}

function showContactDetails(contact: Contact) {
  selectedContact.value = contact
  showContactInfo.value = true
}

onMounted(async () => {
  await contactsStore.fetchContacts()
})
</script> 