<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Регистрация</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="username"
                label="Имя пользователя"
                prepend-icon="mdi-account"
                :rules="usernameRules"
                required
              />

              <v-text-field
                v-model="email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                :rules="emailRules"
                required
              />

              <v-text-field
                v-model="password"
                label="Пароль"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                :rules="passwordRules"
                @click:append="showPassword = !showPassword"
                required
              />

              <v-text-field
                v-model="passwordConfirmation"
                label="Подтверждение пароля"
                prepend-icon="mdi-lock-check"
                :append-icon="showPasswordConfirmation ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                :rules="[...passwordRules, passwordMatch]"
                @click:append="showPasswordConfirmation = !showPasswordConfirmation"
                required
              />
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!isValid || loading"
              @click="handleSubmit"
            >
              Зарегистрироваться
            </v-btn>
          </v-card-actions>

          <v-card-text class="text-center">
            <router-link to="/login">
              Уже есть аккаунт? Войдите
            </router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const form = ref<any>(null)
const isValid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const usernameRules = [
  (v: string) => !!v || 'Имя пользователя обязательно',
  (v: string) => v.length >= 3 || 'Имя пользователя должно быть не менее 3 символов',
  (v: string) => v.length <= 50 || 'Имя пользователя должно быть не более 50 символов'
]

const emailRules = [
  (v: string) => !!v || 'Email обязателен',
  (v: string) => /.+@.+\..+/.test(v) || 'Email должен быть валидным'
]

const passwordRules = [
  (v: string) => !!v || 'Пароль обязателен',
  (v: string) => v.length >= 8 || 'Пароль должен быть не менее 8 символов',
  (v: string) => /[A-Z]/.test(v) || 'Пароль должен содержать х��тя бы одну заглавную букву',
  (v: string) => /[a-z]/.test(v) || 'Пароль должен содержать хотя бы одну строчную букву',
  (v: string) => /[0-9]/.test(v) || 'Пароль должен содержать хотя бы одну цифру'
]

const passwordMatch = computed(() => {
  return (v: string) => v === password.value || 'Пароли не совпадают'
})

async function handleSubmit() {
  if (!form.value?.validate()) return

  try {
    loading.value = true
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })
  } catch (error) {
    console.error('Registration error:', error)
  } finally {
    loading.value = false
  }
}
</script> 