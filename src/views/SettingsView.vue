<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="6" class="mx-auto">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Настройки</v-toolbar-title>
          </v-toolbar>

          <v-tabs v-model="activeTab">
            <v-tab value="profile">Профиль</v-tab>
            <v-tab value="security">Безопасность</v-tab>
            <v-tab value="appearance">Внешний вид</v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              <!-- Настройки профиля -->
              <v-window-item value="profile">
                <v-form ref="profileForm" v-model="isProfileValid" @submit.prevent="updateProfile">
                  <v-text-field
                    v-model="profile.username"
                    label="Имя пользователя"
                    :rules="usernameRules"
                    required
                  />

                  <v-text-field
                    v-model="profile.email"
                    label="Email"
                    type="email"
                    :rules="emailRules"
                    required
                  />

                  <v-text-field
                    v-model="profile.wallet_address"
                    label="Адрес кошелька"
                    readonly
                  />

                  <v-text-field
                    v-model="profile.public_key"
                    label="Публичный ключ"
                    readonly
                  />

                  <v-btn
                    color="primary"
                    :loading="loading"
                    :disabled="!isProfileValid || loading"
                    @click="updateProfile"
                  >
                    Сохранить изменения
                  </v-btn>
                </v-form>
              </v-window-item>

              <!-- Настройки безопасности -->
              <v-window-item value="security">
                <v-card flat>
                  <v-card-title>Двухфакторная аутентификация</v-card-title>
                  <v-card-text>
                    <template v-if="!profile.two_factor_enabled">
                      <v-alert
                        type="warning"
                        text="Рекомендуется включить двухфакторную аутентификацию для повышения безопасности вашего аккаунта"
                      />
                      <v-btn
                        color="primary"
                        :loading="loading"
                        @click="enable2FA"
                      >
                        Включить 2FA
                      </v-btn>
                    </template>

                    <template v-else>
                      <v-alert
                        type="success"
                        text="Двухфакторная аутентификация включена"
                      />
                      <v-btn
                        color="error"
                        :loading="loading"
                        @click="showDisable2FADialog = true"
                      >
                        Отключить 2FA
                      </v-btn>
                    </template>
                  </v-card-text>

                  <v-divider class="my-4" />

                  <v-card-title>Изменение пароля</v-card-title>
                  <v-card-text>
                    <v-form ref="passwordForm" v-model="isPasswordValid">
                      <v-text-field
                        v-model="passwords.current"
                        label="Текущий пароль"
                        type="password"
                        :rules="passwordRules"
                        required
                      />

                      <v-text-field
                        v-model="passwords.new"
                        label="Новый пароль"
                        type="password"
                        :rules="passwordRules"
                        required
                      />

                      <v-text-field
                        v-model="passwords.confirmation"
                        label="Подтверждение пароля"
                        type="password"
                        :rules="[...passwordRules, passwordMatch]"
                        required
                      />

                      <v-btn
                        color="primary"
                        :loading="loading"
                        :disabled="!isPasswordValid || loading"
                        @click="changePassword"
                      >
                        Изменить пароль
                      </v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <!-- Настройки внешнего вида -->
              <v-window-item value="appearance">
                <v-card flat>
                  <v-card-title>Тема</v-card-title>
                  <v-card-text>
                    <v-radio-group
                      v-model="appearance.theme"
                      @change="updateAppearance"
                    >
                      <v-radio
                        label="Светлая"
                        value="light"
                      />
                      <v-radio
                        label="Тёмная"
                        value="dark"
                      />
                      <v-radio
                        label="Системная"
                        value="system"
                      />
                    </v-radio-group>
                  </v-card-text>

                  <v-divider class="my-4" />

                  <v-card-title>Уведомления</v-card-title>
                  <v-card-text>
                    <v-switch
                      v-model="appearance.notifications.sound"
                      label="Звуковые уведомления"
                      @change="updateAppearance"
                    />
                    <v-switch
                      v-model="appearance.notifications.desktop"
                      label="Уведомления на рабочем столе"
                      @change="updateAppearance"
                    />
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог отключения 2FA -->
    <v-dialog
      v-model="showDisable2FADialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>Отключение двухфакторной аутентификации</v-card-title>
        <v-card-text>
          <v-alert
            type="warning"
            text="Отключение двухфакторной аутентификации снизит безопасность вашего аккаунта"
            class="mb-4"
          />
          <v-text-field
            v-model="disable2FACode"
            label="Код подтверждения"
            type="text"
            :rules="code2FARules"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            :loading="loading"
            :disabled="!disable2FACode"
            @click="disable2FA"
          >
            Отключить
          </v-btn>
          <v-btn
            text
            @click="showDisable2FADialog = false"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог включения 2FA -->
    <v-dialog
      v-model="show2FASetupDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>Настройка двухфакторной аутентификации</v-card-title>
        <v-card-text>
          <div class="text-center mb-4">
            <img
              :src="twoFactorQR"
              alt="QR код для 2FA"
              class="mb-2"
            />
            <div class="text-caption">
              Отсканируйте QR-код с помощью приложения аутентификации
            </div>
          </div>

          <v-text-field
            v-model="setup2FACode"
            label="Код подтверждения"
            type="text"
            :rules="code2FARules"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!setup2FACode"
            @click="verify2FASetup"
          >
            Подтвердить
          </v-btn>
          <v-btn
            text
            @click="show2FASetupDialog = false"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { api } from '@/utils/api'

const authStore = useAuthStore()
const appStore = useAppStore()

const activeTab = ref('profile')
const loading = ref(false)
const isProfileValid = ref(false)
const isPasswordValid = ref(false)
const profileForm = ref<any>(null)
const passwordForm = ref<any>(null)

const showDisable2FADialog = ref(false)
const show2FASetupDialog = ref(false)
const disable2FACode = ref('')
const setup2FACode = ref('')
const twoFactorQR = ref('')

const profile = ref({
  username: '',
  email: '',
  wallet_address: '',
  public_key: '',
  two_factor_enabled: false
})

const passwords = ref({
  current: '',
  new: '',
  confirmation: ''
})

const appearance = ref({
  theme: 'system',
  notifications: {
    sound: true,
    desktop: true
  }
})

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
  (v: string) => /[A-Z]/.test(v) || 'Пароль должен содержать хотя бы одну заглавную букву',
  (v: string) => /[a-z]/.test(v) || 'Пароль должен содержать хотя бы одну строчную букву',
  (v: string) => /[0-9]/.test(v) || 'Пароль должен содержать хотя бы одну цифру'
]

const code2FARules = [
  (v: string) => !!v || 'Код обязателен',
  (v: string) => v.length === 6 || 'Код должен состоять из 6 цифр'
]

const passwordMatch = computed(() => {
  return (v: string) => v === passwords.value.new || 'Пароли не совпадают'
})

async function updateProfile() {
  if (!profileForm.value?.validate()) return

  try {
    loading.value = true
    await api.patch('/api/v1/profile', {
      user: {
        username: profile.value.username,
        email: profile.value.email
      }
    })

    appStore.showSnackbar({
      text: 'Профиль успешно обновлен',
      color: 'success'
    })

    await authStore.fetchProfile()
  } catch (error: any) {
    appStore.showSnackbar({
      text: error.response?.data?.error || 'Ошибка обновления профиля',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  if (!passwordForm.value?.validate()) return

  try {
    loading.value = true
    await api.patch('/api/v1/profile', {
      user: {
        current_password: passwords.value.current,
        password: passwords.value.new,
        password_confirmation: passwords.value.confirmation
      }
    })

    appStore.showSnackbar({
      text: 'Пароль успешно изменен',
      color: 'success'
    })

    passwords.value = {
      current: '',
      new: '',
      confirmation: ''
    }
  } catch (error: any) {
    appStore.showSnackbar({
      text: error.response?.data?.error || 'Ошибка изменения пароля',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function enable2FA() {
  try {
    loading.value = true
    const response = await api.post('/api/v1/profile/enable_two_factor')
    twoFactorQR.value = response.data.qr_code
    show2FASetupDialog.value = true
  } catch (error: any) {
    appStore.showSnackbar({
      text: error.response?.data?.error || 'Ошибка включения 2FA',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function verify2FASetup() {
  try {
    loading.value = true
    await api.post('/api/v1/profile/verify_two_factor', {
      code: setup2FACode.value
    })

    profile.value.two_factor_enabled = true
    show2FASetupDialog.value = false
    setup2FACode.value = ''

    appStore.showSnackbar({
      text: 'Двухфакторная аутентификация успешно включена',
      color: 'success'
    })
  } catch (error: any) {
    appStore.showSnackbar({
      text: error.response?.data?.error || 'Неверный код',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function disable2FA() {
  try {
    loading.value = true
    await api.post('/api/v1/profile/disable_two_factor', {
      code: disable2FACode.value
    })

    profile.value.two_factor_enabled = false
    showDisable2FADialog.value = false
    disable2FACode.value = ''

    appStore.showSnackbar({
      text: 'Двухфакторная аутентификация отключена',
      color: 'success'
    })
  } catch (error: any) {
    appStore.showSnackbar({
      text: error.response?.data?.error || 'Неверный код',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

function updateAppearance() {
  localStorage.setItem('appearance', JSON.stringify(appearance.value))
  appStore.showSnackbar({
    text: 'Настройки внешнего вида сохранены',
    color: 'success'
  })
}

onMounted(async () => {
  const user = authStore.user
  if (user) {
    profile.value = {
      username: user.username,
      email: user.email,
      wallet_address: user.wallet_address,
      public_key: user.public_key,
      two_factor_enabled: user.two_factor_enabled
    }
  }

  const savedAppearance = localStorage.getItem('appearance')
  if (savedAppearance) {
    appearance.value = JSON.parse(savedAppearance)
  }
})
</script> 