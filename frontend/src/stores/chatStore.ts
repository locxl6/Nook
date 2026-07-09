import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { Message } from '@/types'

interface ChatState {
  currentConversationId: string | null
  messages: Message[]
  input: string
  isLoading: boolean

  setCurrentConversationId: (id: string | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateLastAssistantMessage: (content: string) => void
  setInput: (input: string) => void
  setIsLoading: (loading: boolean) => void
  clearChat: () => void
  removeMessage: (id: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  currentConversationId: null,
  messages: [],
  input: '',
  isLoading: false,

  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  updateLastAssistantMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant') msgs[msgs.length - 1] = { ...last, content }
      return { messages: msgs }
    }),
  setInput: (input) => set({ input }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  clearChat: () =>
    set({ currentConversationId: null, messages: [], input: '', isLoading: false }),
  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }))
}))
