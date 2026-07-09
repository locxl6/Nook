export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ConversationListResponse extends Conversation {}

export interface ChatStreamChunk {
  type: string
  content: string
  finish_reason: string | null
}

export interface GeneralResponse {
  ok: boolean
  message: string
}

export interface AppSettings {
  apiKey: string
  baseUrl: string
  model: string
}

export interface Model {
  id : string
  name : string 
  provider : string
  local : boolean
}