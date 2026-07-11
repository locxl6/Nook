import { Input, Button } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { useChatStore } from '@/stores/chatStore'
import { useStreamChat } from '@/hooks/useStreamChat'
import { useRef, useEffect } from 'react'

const { TextArea } = Input

export default function ChatInputArea() {
  const { input, setInput, isLoading } = useChatStore()
  const { sendMessage } = useStreamChat()
  const ref = useRef<any>(null)

  useEffect(() => {
    if (!isLoading && ref.current) ref.current.focus()
  }, [isLoading])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--ds-border)',
        background: 'var(--ds-bg)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease' // ✅ 新增过渡
      }}
    >
      <div
        style={{
          maxWidth: 768,
          margin: '0 auto',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end'
        }}
      >
        <TextArea
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Enter 发送 / Shift+Enter 换行)"
          disabled={isLoading}
          autoSize={{ minRows: 1, maxRows: 6 }}
          style={{
            flex: 1,
            borderRadius: 14,
            background: 'var(--ds-surface)',
            borderColor: 'var(--ds-border)',
            color: 'var(--ds-text-primary)',
            fontSize: 14,
            padding: '10px 14px',
            resize: 'none',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          loading={isLoading}
          style={{
            borderRadius: 14,
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>
    </div>
  )
}