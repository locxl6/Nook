import { useState, useEffect, useRef } from 'react'
import { Input, Button, Radio, Typography, Empty, Spin } from 'antd'
import {
  SearchOutlined,
  ArrowLeftOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { useConversationStore } from '@/stores/conversationStore'
import { useChatStore } from '@/stores/chatStore'
import { useStreamChat } from '@/hooks/useStreamChat'
import { Conversation } from '@/types'

const { Text } = Typography

interface Props {
  open: boolean
  onClose: () => void
}

type SearchScope = 'title' | 'content'

interface SearchItem {
  conversation: Conversation
  snippet?: string
  matchMessageId?: string
}

function getSnippet(content: string, keyword: string, maxLen = 100): string {
  const lower = content.toLowerCase()
  const kw = keyword.toLowerCase()
  const idx = lower.indexOf(kw)
  if (idx === -1) return content.slice(0, maxLen) + (content.length > maxLen ? '...' : '')

  const half = Math.floor((maxLen - kw.length) / 2)
  const start = Math.max(0, idx - half)
  const end = Math.min(content.length, idx + kw.length + half)

  let snippet = content.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet += '...'
  return snippet
}

export default function SearchPanel({ open, onClose }: Props) {
  const { conversations, fetchConversations, fetchMessages } = useConversationStore()
  const { selectConversation } = useStreamChat()
  const { setSelectedMessageId } = useChatStore()

  const [keyword, setKeyword] = useState('')
  const [scope, setScope] = useState<SearchScope>('title')
  const [results, setResults] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      clearTimeout(timerRef.current)
      setVisible(true)
      fetchConversations()
    } else {
      setAnimating(false)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setKeyword('')
        setResults([])
        setSearched(false)
      }, 250)
    }
  }, [open])

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => setAnimating(true))
    }
  }, [visible])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!keyword.trim()) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }

    setLoading(true)
    const kw = keyword.trim().toLowerCase()

    debounceRef.current = setTimeout(async () => {
      try {
        if (scope === 'title') {
          const filtered = conversations
            .filter((c) => c.title.toLowerCase().includes(kw))
            .map((c) => ({ conversation: c }))
          setResults(filtered)
        } else {
          const matched: SearchItem[] = []
          for (const conv of conversations) {
            try {
              const msgs = await fetchMessages(conv.id)
              for (const m of msgs) {
                if (m.content.toLowerCase().includes(kw)) {
                  matched.push({
                    conversation: conv,
                    snippet: getSnippet(m.content, kw),
                    matchMessageId: m.id
                  })
                  break
                }
              }
            } catch {
              // skip failed fetches
            }
          }
          setResults(matched)
        }
        setSearched(true)
      } finally {
        setLoading(false)
      }
    }, 1000)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [keyword, scope, conversations])

  const handleSelect = (item: SearchItem) => {
    if (item.matchMessageId) {
      setSelectedMessageId(item.matchMessageId)
    }
    selectConversation(item.conversation.id)
    onClose()
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        opacity: animating ? 1 : 0,
        transition: 'opacity 0.2s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: 560,
          maxHeight: '80vh',
          background: 'var(--ds-surface)',
          borderRadius: 16,
          border: '1px solid var(--ds-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          opacity: animating ? 1 : 0,
          transform: animating ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(-8px)',
          transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div
          style={{
            padding: '16px 20px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--ds-border)'
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onClose}
            style={{ color: 'var(--ds-text-secondary)', borderRadius: 8, flexShrink: 0 }}
          />
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--ds-text-tertiary)' }} />}
            placeholder="搜索对话..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            autoFocus
            style={{
              flex: 1,
              borderRadius: 10,
              background: 'var(--ds-bg)',
              borderColor: 'var(--ds-border)',
              color: 'var(--ds-text-primary)'
            }}
          />
        </div>

        <div style={{ padding: '8px 20px 0', borderBottom: '1px solid var(--ds-border)' }}>
          <Radio.Group
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            size="small"
            buttonStyle="solid"
            style={{ marginBottom: 8 }}
          >
            <Radio.Button value="title">标题搜索</Radio.Button>
            <Radio.Button value="content">全量搜索</Radio.Button>
          </Radio.Group>
        </div>

        <div style={{ flex: 1, overflow: 'hidden auto', padding: '12px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Spin size="small" />
            </div>
          ) : searched && results.length === 0 ? (
            <Empty
              description={
                <span style={{ color: 'var(--ds-text-tertiary)', marginBottom: 20 }}>未找到相关对话</span>
              }
              style={{ marginTop: 32 }}
            />
          ) : results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {results.map((item) => (
                <div
                  key={item.conversation.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: 'transparent',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      'var(--ds-sidebar-hover)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  }}
                >
                  <MessageOutlined style={{ color: 'var(--ds-text-tertiary)', fontSize: 13, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ color: 'var(--ds-text-primary)', fontSize: 13 }} ellipsis>
                      {item.conversation.title}
                    </Text>
                    {item.snippet ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--ds-text-tertiary)',
                          marginTop: 4,
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all'
                        }}
                      >
                        {item.snippet}
                      </div>
                    ) : (
                      item.conversation.updated_at && (
                        <div
                          style={{ fontSize: 11, color: 'var(--ds-text-tertiary)', marginTop: 2 }}
                        >
                          {new Date(item.conversation.updated_at).toLocaleDateString()}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
