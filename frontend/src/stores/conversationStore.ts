import { create } from 'zustand'
import { Conversation, GeneralResponse, ApiMessage } from '@/types'
import { useSettingsStore } from './settingsStore'

interface ConversationState {
  conversations: Conversation[]
  currentId: string | null
  loading: boolean

  setCurrentId: (id: string | null) => void
  fetchConversations: (keyword?: string) => Promise<void>
  createConversation: (title: string) => Promise<Conversation | null>
  deleteConversation: (id: string) => Promise<boolean>
  fetchMessages: (conversationId: string) => Promise<ApiMessage[]>
  renameTitle: (conversationId: string, newTitle: string) => Promise<boolean>
  searchConversations: (keyword: string) => Promise<Conversation[]>
}

function getBaseUrl(): string {
  return useSettingsStore.getState().settings.baseUrl
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentId: null,
  loading: false,

  setCurrentId: (id) => set({ currentId: id }),

  fetchConversations: async (keyword?: string) => {
    set({ loading: true })
    try {
      const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
      const data = await apiFetch<Conversation[]>(`/api/conversations${qs}`)
      set({ conversations: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createConversation: async (title) => {
    try {
      const conv = await apiFetch<Conversation>('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title })
      })
      set((s) => ({
        conversations: [conv, ...s.conversations],
        currentId: conv.id
      }))
      return conv
    } catch {
      return null
    }
  },

  deleteConversation: async (id) => {
    try {
      await apiFetch(`/api/conversations/${id}`, { method: 'DELETE' })
      set((s) => ({
        conversations: s.conversations.filter((c) => c.id !== id),
        currentId: s.currentId === id ? (s.conversations[0]?.id ?? null) : s.currentId
      }))
      return true
    } catch {
      return false
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      return await apiFetch<ApiMessage[]>(`/api/conversations/${conversationId}/messages`)
    } catch {
      return []
    }
  },

  renameTitle: async (conversationId, newTitle) => {
    try {
      await apiFetch<GeneralResponse>(`/api/conversations/${conversationId}/title`, {
        method: 'PUT',
        body: JSON.stringify({ new_title: newTitle })
      })
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === conversationId ? { ...c, title: newTitle, updated_at: new Date().toISOString() } : c
        )
      }))
      return true
    } catch {
      return false
    }
  },

  searchConversations: async (keyword) => {
    try {
      return await apiFetch<Conversation[]>(`/api/conversations?keyword=${encodeURIComponent(keyword)}`)
    } catch {
      return []
    }
  }
}))
