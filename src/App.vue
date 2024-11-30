<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        :title="currentUser?.username || 'Гость'"
        :subtitle="currentUser?.email || ''"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :value="item.title"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}

      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const authStore = useAuthStore()
const appStore = useAppStore()

const drawer = ref(true)
const rail = ref(false)

const currentUser = computed(() => authStore.user)
const snackbar = computed(() => appStore.snackbar)

const menuItems = computed(() => {
  const items = []

  if (authStore.isAuthenticated) {
    items.push(
      { title: 'Чаты', icon: 'mdi-chat', to: '/chats' },
      { title: 'Контакты', icon: 'mdi-account-multiple', to: '/contacts' },
      { title: 'Настройки', icon: 'mdi-cog', to: '/settings' },
      { title: 'Выход', icon: 'mdi-logout', to: '/logout' }
    )
  } else {
    items.push(
      { title: 'Вход', icon: 'mdi-login', to: '/login' },
      { title: 'Регистрация', icon: 'mdi-account-plus', to: '/register' }
    )
  }

  return items
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 