import { Select, Badge, message } from 'antd'
import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

interface ModelInfo {
  id: string
  name: string
  provider: string
  local: boolean
}

export default function ModelSelectorHeader() {
  const { settings, updateSettings } = useSettingsStore()
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`${settings.baseUrl}/api/models`, {
      headers: { Accept: 'application/json' }
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setModels(data)
          if (!settings.model && data.length > 0) {
            updateSettings({ model: data[0].id || data[0].name })
          }
        }
      })
      .catch(() => {
        // backend not available, keep default
      })
      .finally(() => setLoading(false))
  }, [])

  const options = models.map((m) => ({
    value: m.id || m.name,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge status={m.local ? 'success' : 'processing'} />
        <span>{m.name}</span>
      </span>
    )
  }))

  return (
    <Select
      value={settings.model || undefined}
      onChange={(v) => updateSettings({ model: v })}
      loading={loading}
      placeholder="选择模型"
      popupMatchSelectWidth={false}
      style={{ minWidth: 150 }}
      options={options}
      variant="borderless"
      styles={{
        selector: {
          color: 'var(--ds-text-secondary) !important'
        }
      }}
    />
  )
}
