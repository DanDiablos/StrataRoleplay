import React, { useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { X } from 'lucide-react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'
import { renderItem } from './items/index.tsx'

export default function Menu(): React.ReactElement | null {
  const hidden   = useStore(s => s.hidden)
  const menu     = useStore(s => s.menu)
  const dispatch = useStore(s => s.dispatch)
  const nodeRef  = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 20, y: 72 })

  useEffect(() => {
    setPos({ x: 20, y: 72 })
  }, [hidden])

  const onClose = () => {
    sendNui('Close')
    dispatch('CLEAR_MENU')
  }

  if (hidden) return null

  return (
    <>
      {/* ── Top navbar ─────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-[1001] flex items-stretch"
        style={{
          height: 52,
          background: 'rgba(10,10,10,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Wordmark */}
        <div
          className="flex items-center gap-2 px-6 shrink-0"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span
            className="font-display font-black tracking-[0.1em] text-[1rem]"
            style={{
              background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            STRATA
          </span>
          <span className="font-mono text-[0.85rem]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            /
          </span>
          <span className="font-mono text-[0.68rem] tracking-[0.02em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {menu.label?.toLowerCase() ?? 'menu'}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: hint + close */}
        <div
          className="flex items-center gap-4 px-5 shrink-0"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span
            className="font-mono uppercase tracking-[0.06em] text-[0.58rem] select-none"
            style={{ color: 'rgba(255,255,255,0.18)' }}
          >
            ESC to close
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer transition-colors duration-150"
            style={{
              width: 30,
              height: 30,
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Floating menu card ─────────────────────────────────────────── */}
      <Draggable
        handle=".drag-handle"
        bounds="#root"
        position={pos}
        onDrag={(_, p) => setPos({ x: p.x, y: p.y })}
        nodeRef={nodeRef}
      >
        <div
          ref={nodeRef}
          className="absolute w-[360px] text-white overflow-hidden z-[1000] select-none"
          style={{
            maxHeight: 'calc(100vh - 92px)',
            background: 'rgba(10,10,10,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}
        >
          {/* Drag handle */}
          <div
            className="drag-handle w-full cursor-move transition-colors duration-150"
            style={{ height: 3, background: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,92,58,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          />

          {/* Items */}
          <div
            className="overflow-y-auto overflow-x-hidden p-2.5"
            style={{ maxHeight: 'calc(100vh - 110px)' }}
          >
            {menu.items.length > 0 ? (
              menu.items.map((item, i) => (
                <React.Fragment key={`${menu.id}-${i}`}>
                  {renderItem(item, i, menu.id ?? '')}
                </React.Fragment>
              ))
            ) : (
              <div
                className="text-white text-center px-4 py-2.5 text-[12px] font-medium tracking-wide uppercase"
                style={{
                  background: 'rgba(110,22,22,0.8)',
                  border: '1px solid rgba(161,52,52,0.3)',
                }}
              >
                Menu Has No Content
              </div>
            )}
          </div>
        </div>
      </Draggable>
    </>
  )
}
