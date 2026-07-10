export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface ApiMessage {
  id: string
  conversation_id: string
  role: string
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatStreamChunk {
  type: string
  content: string
  finish_reason: string | null
}

export interface GeneralResponse {
  ok: boolean
  message: string
}

export interface RenameTitleRequest {
  new_title: string
}

export interface AppSettings {
  apiKey: string
  baseUrl: string
  model: string
}
