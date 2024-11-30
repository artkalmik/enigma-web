export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  publicKey: string
  isOnline: boolean
  lastSeen: number
}

export interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  chatId: string
  timestamp: number
  encrypted: boolean
  delivered: boolean
  transactionHash?: string
}

export interface Chat {
  id: string
  name: string
  avatar?: string
  participants: User[]
  lastMessage?: string
  lastMessageTime?: number
  unreadCount: number
  isOnline: boolean
  encrypted: boolean
}

export interface CreateChatPayload {
  name: string
  participantIds?: string[]
}

export interface SendMessagePayload {
  content: string
  chatId: string
  encrypted: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    currentPage: number
    totalPages: number
    totalCount: number
  }
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface MessagesState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  loading: boolean
  error: string | null
}

export interface AppState {
  darkMode: boolean
  language: string
  notifications: boolean
  encryptionEnabled: boolean
}

export interface ContactsState {
  contacts: User[]
  loading: boolean
  error: string | null
} 