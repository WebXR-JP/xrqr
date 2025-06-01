export interface EncryptedPayload {
  content: string;
  isSecret: boolean;
  timestamp: string;
}

export interface HistoryItem {
  id: string;
  content: string;
  preview: string;
  timestamp: string;
}

export interface AppState {
  encryptionKey: string;
  history: HistoryItem[];
  isXRDevice: boolean | null;
}
