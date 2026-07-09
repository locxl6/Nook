import { Layout, Typography, ConfigProvider, theme, Button } from 'antd'
import { CommentOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import Sidebar from '@/components/Sidebar'
import ChatInput from '@/components/ChatInput'
import ChatMessageItem from '@/components/ChatMessage'
import { useChatStore } from '@/stores/chatStore'
import { useConversationStore } from '@/stores/conversationStore'
import { useEffect, useRef, useState, useCallback } from 'react'

const { Header, Content } = Layout
const { Text } = Typography

const MOBILE_WIDTH = 768

export default function App() {
  const { messages, isLoading } = useChatStore()
  const { conversations, currentId } = useConversationStore()
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [collapsed, setCollapsed] = useState(() => window.innerWidth < MOBILE_WIDTH)
  const [manualToggle, setManualToggle] = useState(false)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleResize = useCallback(() => {
    if (!manualToggle) {
      setCollapsed(window.innerWidth < MOBILE_WIDTH)
    }
  }, [manualToggle])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  const currentConv = conversations.find((c) => c.id === currentId)

  const toggleSidebar = () => {
    setManualToggle(true)
    setCollapsed((v) => !v)
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          colorBgContainer: 'var(--ds-bg)',
          colorBgElevated: 'var(--ds-surface)',
          borderRadius: 10,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }
      }}
    >
      <Layout style={{ height: '100vh' }}>
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

        <Layout style={{ background: 'var(--ds-bg)' }}>
          <Header
            style={{
              background: 'var(--ds-bg)',
              borderBottom: '1px solid var(--ds-border)',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 56
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              style={{ color: 'var(--ds-text-secondary)', fontSize: 16, borderRadius: 8 }}
            />
            <Text style={{ color: 'var(--ds-text-primary)', fontSize: 14, fontWeight: 500 }}>
              {currentConv ? currentConv.title : '新对话'}
            </Text>
          </Header>

          <Content style={{ flex: 1, overflow: 'hidden auto', padding: '24px 24px 0' }}>
            {messages.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--ds-text-tertiary)'
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: 'var(--ds-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    border: '1px solid var(--ds-border)'
                  }}
                >
                  <CommentOutlined style={{ fontSize: 26, color: 'var(--ds-accent)' }} />
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'var(--ds-text-secondary)',
                    marginBottom: 6
                  }}
                >
                  开始一段新对话
                </div>
                <div style={{ fontSize: 13 }}>
                  在下方输入您的问题，AI 将实时回复
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 768, margin: '0 auto', paddingBottom: 8 }}>
                {messages.map((msg) => (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    isStreaming={
                      isLoading &&
                      msg.role === 'assistant' &&
                      msg.id === messages[messages.length - 1]?.id
                    }
                  />
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </Content>

          <ChatInput />
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}
