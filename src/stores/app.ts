import { defineStore } from 'pinia'
import { ref } from 'vue'

interface SnackbarOptions {
  text: string
  color?: string
  timeout?: number
}

export const useAppStore = defineStore('app', () => {
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    timeout: 3000
  })

  const loading = ref(false)

  function showSnackbar({ text, color = 'success', timeout = 3000 }: SnackbarOptions) {
    snackbar.value = {
      show: true,
      text,
      color,
      timeout
    }
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return {
    snackbar,
    loading,
    showSnackbar,
    setLoading
  }
}) 