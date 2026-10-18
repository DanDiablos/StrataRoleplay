import { useState, useEffect } from 'react'
import { Settings, Save } from 'lucide-react'
import { sendNui } from '../../nui'
import ActionBtn from '../../components/ActionBtn.tsx'
import Loader from '../../components/Loader.tsx'

export default function PDMManageTab(): React.ReactElement {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [data, setData]         = useState<Record<string, unknown>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const r = await sendNui('PDMGetDealerData', {})
        const result = await r.json()
        if (result && typeof result === 'object') setData(result)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const doSave = async () => {
    setSaving(true)
    try {
      await sendNui('PDMSaveDealerData', data)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="h-full flex items-center justify-center"><Loader /></div>
  )

  return (
    <div className="h-full flex flex-col p-5 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-white/40" />
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/50">
            Manage Dealership
          </span>
        </div>
        <ActionBtn onClick={doSave} variant="primary" disabled={saving}>
          <Save size={11} className="inline mr-1" />
          {saving ? 'Saving…' : 'Save'}
        </ActionBtn>
      </div>

      <div className="border-l-[3px] border-l-primary bg-menu-surface">
        <div className="px-3 py-2 bg-menu-surface-lt border-b border-white/[0.06]">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/70">
            Dealership Info
          </span>
        </div>
        <div className="p-3 flex flex-col gap-3">
          {Object.entries(data).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">{key}</label>
              <input
                value={String(val ?? '')}
                onChange={e => setData(d => ({ ...d, [key]: e.target.value }))}
                className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.84rem] text-white/80 focus:border-primary/50 transition-colors"
              />
            </div>
          ))}
          {Object.keys(data).length === 0 && (
            <span className="font-mono text-[0.68rem] text-white/25">No configurable fields</span>
          )}
        </div>
      </div>
    </div>
  )
}
