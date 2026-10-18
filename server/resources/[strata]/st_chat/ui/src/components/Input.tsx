import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore, type Suggestion } from '../store'
import { sendNui } from '../nui'

export default function Input(): React.ReactElement {
  const suggestions = useStore(s => s.suggestions)
  const history     = useStore(s => s.history)
  const pushHistory = useStore(s => s.pushHistory)
  const dispatch    = useStore(s => s.dispatch)

  const [value,    setValue]    = useState('')
  const [selected, setSelected] = useState(-1)
  const [histIdx,  setHistIdx]  = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered: Suggestion[] = useMemo(() => {
    const word = value.split(' ')[0]
    if (!word.startsWith('/')) return []
    const lower = word.toLowerCase()
    return suggestions
      .filter(s => s.name.toLowerCase().startsWith(lower))
      .slice(0, 8)
  }, [value, suggestions])

  // Index of the argument currently being typed (0 = first param, -1 = still on command name)
  const currentParamIndex = useMemo(() => {
    const matches = value.match(/(| )([^\s"]+|"([^"]*)"| $)/g)
    return matches ? matches.length - 2 : -1
  }, [value])

  useEffect(() => {
    setSelected(filtered.length > 0 ? 0 : -1)
  }, [filtered])

  function submit(msg: string) {
    pushHistory(msg)
    sendNui('chatResult', { cancelled: false, message: msg })
    dispatch('ON_SCREEN_STATE_CHANGE', { shouldHide: true })
  }

  function cancel() {
    sendNui('chatResult', { cancelled: true })
    dispatch('ON_SCREEN_STATE_CHANGE', { shouldHide: true })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      cancel()
      return
    }

    if (filtered.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(s => Math.max(0, s - 1))
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(s => Math.min(filtered.length - 1, s + 1))
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const idx = selected >= 0 ? selected : 0
        setValue(filtered[idx].name + ' ')
        setSelected(-1)
        return
      }
    }

    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault()
      const next = Math.min(history.length - 1, histIdx + 1)
      setHistIdx(next)
      setValue(history[history.length - 1 - next])
      return
    }
    if (e.key === 'ArrowDown' && histIdx >= 0) {
      e.preventDefault()
      const next = histIdx - 1
      setHistIdx(next)
      setValue(next < 0 ? '' : history[history.length - 1 - next])
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (value.trim()) submit(value.trim())
      else cancel()
    }
  }

  return (
    <div className="relative">
      {/* Input box */}
      <div className="flex items-center bg-[rgba(14,14,14,0.88)] border border-white/[0.07] border-l-[3px] border-l-primary overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <span className="font-mono text-[1.1vh] text-primary pl-[1vh] pr-[0.4vh] shrink-0 leading-none select-none">➤</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setHistIdx(-1) }}
          onKeyDown={handleKeyDown}
          maxLength={256}
          className="flex-1 bg-transparent text-[1.35vh] text-white/90 font-sans py-[1vh] pl-[0.4vh] pr-[1vh] border-none"
          autoComplete="off"
          spellCheck={false}
          onBlur={() => inputRef.current?.focus()}
        />
      </div>

      {/* Suggestions */}
      {filtered.length > 0 && (
        <div className="absolute top-full w-full bg-[rgba(14,14,14,0.88)] border border-white/[0.07] border-t-white/[0.05] border-l-[3px] border-l-primary overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          {filtered.map((s, i) => {
            const isSelected = i === selected
            const hasParams  = Array.isArray(s.params) && s.params.length > 0

            // Help text: show param-specific help when typing that param
            const helpText = isSelected && hasParams && currentParamIndex >= 0
              ? (s.params![Math.min(currentParamIndex, s.params!.length - 1)]?.help || s.help)
              : s.help

            return (
              <div
                key={s.name + i}
                className={`px-3 py-1.5 cursor-pointer ${isSelected ? 'bg-menu-surface-lt' : 'hover:bg-menu-surface'}`}
                onMouseDown={e => {
                  e.preventDefault()
                  setValue(s.name + ' ')
                  inputRef.current?.focus()
                }}
              >
                {/* Command name + param tokens */}
                <div className="flex items-baseline flex-wrap gap-x-1">
                  <span className={`font-mono text-[12px] ${isSelected && currentParamIndex >= 0 ? 'text-primary/50' : 'text-primary'}`}>
                    {s.name}
                  </span>
                  {isSelected && hasParams && s.params!.map((p, pi) => (
                    <span
                      key={pi}
                      className={`font-mono text-[11px] ${pi === currentParamIndex ? 'text-white/75' : 'text-white/30'}`}
                    >
                      [{p.name}]
                    </span>
                  ))}
                </div>
                {/* Help / param hint */}
                {helpText && (
                  <div className="text-white/40 text-[11px] truncate mt-px leading-tight">
                    {helpText}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
