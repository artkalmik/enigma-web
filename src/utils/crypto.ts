import { box, randomBytes } from 'tweetnacl'
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from 'tweetnacl-util'
import { useAuthStore } from '@/stores/auth'
import { useContactsStore } from '@/stores/contacts'

export async function encryptMessage(message: string, recipientId: number): Promise<string> {
  const authStore = useAuthStore()
  const contactsStore = useContactsStore()

  if (!authStore.user) {
    throw new Error('Пользователь не авторизован')
  }

  const recipient = await contactsStore.getUserDetails(recipientId)
  if (!recipient) {
    throw new Error('Получатель не найден')
  }

  const ephemeralKeyPair = box.keyPair()
  const nonce = randomBytes(box.nonceLength)
  
  const messageUint8 = decodeUTF8(message)
  const recipientPublicKeyUint8 = decodeBase64(recipient.public_key)
  const senderPrivateKeyUint8 = decodeBase64(authStore.user.private_key)

  const encryptedMessage = box(
    messageUint8,
    nonce,
    recipientPublicKeyUint8,
    senderPrivateKeyUint8
  )

  return JSON.stringify({
    encrypted: encodeBase64(encryptedMessage),
    nonce: encodeBase64(nonce),
    ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey)
  })
}

export async function decryptMessage(encryptedData: string): Promise<string> {
  const authStore = useAuthStore()

  if (!authStore.user) {
    throw new Error('Пользователь не авторизован')
  }

  const { encrypted, nonce, ephemeralPublicKey } = JSON.parse(encryptedData)

  const encryptedMessageUint8 = decodeBase64(encrypted)
  const nonceUint8 = decodeBase64(nonce)
  const ephemeralPublicKeyUint8 = decodeBase64(ephemeralPublicKey)
  const recipientPrivateKeyUint8 = decodeBase64(authStore.user.private_key)

  const decryptedMessage = box.open(
    encryptedMessageUint8,
    nonceUint8,
    ephemeralPublicKeyUint8,
    recipientPrivateKeyUint8
  )

  if (!decryptedMessage) {
    throw new Error('Не удалось расшифровать сообщение')
  }

  return encodeUTF8(decryptedMessage)
}

export async function generateMessageHash(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyMessageIntegrity(message: string, hash: string): Promise<boolean> {
  const calculatedHash = await generateMessageHash(message)
  return calculatedHash === hash
} 