export interface EncryptedPayload {
  content: string
  isSecret: boolean
  timestamp: string
}

export interface HistoryItem {
  id: string
  content: string
  preview: string
  timestamp: string
  isSecret?: boolean
  encryptedContent?: string
}

export interface AppState {
  encryptionKey: string
  history: HistoryItem[]
  isXRDevice: boolean | null
}
