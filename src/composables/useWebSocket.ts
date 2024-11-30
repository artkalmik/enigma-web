import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Subscription {
  channel: string
  action: string
  callback: (data: any) => void
}

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null)
  const subscriptions = ref<Subscription[]>([])
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    const authStore = useAuthStore()
    if (!authStore.token) return

    socket.value = new WebSocket(import.meta.env.VITE_WS_URL)

    socket.value.onopen = () => {
      isConnected.value = true
      reconnectAttempts.value = 0
      resubscribe()
    }

    socket.value.onclose = () => {
      isConnected.value = false
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        setTimeout(connect, 1000 * Math.pow(2, reconnectAttempts.value))
      }
    }

    socket.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
    subscriptions.value = []
  }

  const subscribe = (channel: string, action: string, callback: (data: any) => void) => {
    subscriptions.value.push({ channel, action, callback })
    
    if (isConnected.value) {
      sendSubscription(channel)
    }
  }

  const unsubscribe = (channel: string, action: string) => {
    subscriptions.value = subscriptions.value.filter(
      sub => !(sub.channel === channel && sub.action === action)
    )
    
    if (isConnected.value) {
      sendUnsubscription(channel)
    }
  }

  const resubscribe = () => {
    const channels = new Set(subscriptions.value.map(sub => sub.channel))
    channels.forEach(channel => sendSubscription(channel))
  }

  const sendSubscription = (channel: string) => {
    if (!socket.value || !isConnected.value) return

    const authStore = useAuthStore()
    socket.value.send(JSON.stringify({
      command: 'subscribe',
      identifier: JSON.stringify({
        channel,
        token: authStore.token
      })
    }))
  }

  const sendUnsubscription = (channel: string) => {
    if (!socket.value || !isConnected.value) return

    const authStore = useAuthStore()
    socket.value.send(JSON.stringify({
      command: 'unsubscribe',
      identifier: JSON.stringify({
        channel,
        token: authStore.token
      })
    }))
  }

  const handleMessage = (data: any) => {
    if (data.type === 'ping') return

    const { channel, action, data: messageData } = data
    subscriptions.value
      .filter(sub => sub.channel === channel && sub.action === action)
      .forEach(sub => sub.callback(messageData))
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    subscribe,
    unsubscribe
  }
} 