import React, { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { getCodeList } from 'country-list'
import { useStore, STATES } from '../store'
import type { Country } from '../store'
import { sendNui } from '../nui'
import Navbar from '../components/Navbar'

function getDefaultDob(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
}

function getMaxDob(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
}

const inputCls = 'w-full bg-transparent border border-white/10 text-white/90 text-[0.85rem] font-sans px-3 py-2 placeholder-white/20 focus:border-white/30 transition-colors'
const labelCls = 'block font-mono text-[0.68rem] uppercase tracking-[0.06em] text-white/40 mb-1.5'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownSelectProps {
  options:     DropdownOption[]
  value:       string
  onChange:    (val: string) => void
  placeholder: string
}

function DropdownSelect({ options, value, onChange, placeholder }: DropdownSelectProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = options.find(o => String(o.value) === String(value))

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-transparent border border-white/10 text-[0.85rem] px-3 py-2 flex items-center justify-between hover:border-white/20 transition-colors"
        style={{ color: selected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)' }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} className="text-white/30 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 bg-[#1a1a1a] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false) }}
              className="px-3 py-[7px] text-[0.85rem] text-white/80 cursor-pointer hover:bg-white/[0.06] hover:text-white transition-colors"
              style={String(value) === String(o.value) ? { color: '#FF5C3A', background: 'rgba(255,92,58,0.06)' } : {}}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CountrySelectProps {
  value:    Country | null
  onChange: (c: Country) => void
}

function CountrySelect({ value, onChange }: CountrySelectProps): React.ReactElement {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  const countries = useMemo<Country[]>(() => {
    const codes = getCodeList() as Record<string, string>
    return Object.entries(codes)
      .map(([code, name]) => ({ value: code, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const filtered = useMemo(
    () => countries.filter(c => c.label.toLowerCase().includes(search.toLowerCase())),
    [countries, search]
  )

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-transparent border border-white/10 text-[0.85rem] px-3 py-2 flex items-center justify-between hover:border-white/20 transition-colors"
        style={{ color: value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)' }}
      >
        <span>{value ? value.label : 'Country of Origin'}</span>
        <ChevronDown size={14} className="text-white/30 shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 bg-[#1a1a1a] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <input
            autoFocus
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 text-white/90 text-[0.82rem] font-sans px-3 py-2 placeholder-white/20"
          />
          <div className="max-h-[200px] overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-white/30 font-mono text-[0.75rem]">No results</div>
            )}
            {filtered.map(c => (
              <div
                key={c.value}
                onClick={() => { onChange(c); setOpen(false); setSearch('') }}
                className="px-3 py-[7px] text-[0.85rem] text-white/80 cursor-pointer hover:bg-white/[0.06] hover:text-white transition-colors"
                style={value?.value === c.value ? { color: '#FF5C3A', background: 'rgba(255,92,58,0.06)' } : {}}
              >
                {c.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FormState {
  first:  string
  last:   string
  gender: string
  dob:    string
  origin: Country | null
  bio:    string
}

export default function CreateScreen(): React.ReactElement {
  const dispatch = useStore(s => s.dispatch)

  const [form, setForm] = useState<FormState>({
    first:  '',
    last:   '',
    gender: '0',
    dob:    getDefaultDob(),
    origin: null,
    bio:    '',
  })

  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendNui('CreateCharacter', {
      first:      form.first,
      last:       form.last,
      gender:     Number(form.gender),
      dob:        new Date(form.dob).toISOString(),
      lastPlayed: -1,
      origin:     form.origin as unknown as Record<string, unknown>,
    })
    dispatch('LOADING_SHOW', { message: 'Creating Character' })
  }

  const onCancel = () => dispatch('SET_STATE', { state: STATES.CHARACTERS })

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
      <Navbar subLabel="create character" />

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,92,58,0.08) 0%, transparent 65%)' }}
      />

      <div className="relative z-[1] w-[560px] bg-[rgba(26,26,26,0.92)] border border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="flex items-baseline gap-2 px-6 py-5 border-b border-white/[0.07]">
          <span className="font-display font-bold text-[1.15rem] text-white tracking-[-0.02em]">New Character</span>
          <span className="font-mono text-[0.72rem] text-primary tracking-[0.05em]">/ fill in details below</span>
        </div>

        <form id="createForm" autoComplete="off" onSubmit={onSubmit} className="flex flex-wrap gap-3 px-6 py-5">
          <div className="w-[calc(50%-6px)]">
            <label className={labelCls}>First Name</label>
            <input
              required
              type="text"
              placeholder="First"
              value={form.first}
              onChange={e => setField('first', e.target.value.replace(/\s/g, ''))}
              className={inputCls}
            />
          </div>
          <div className="w-[calc(50%-6px)]">
            <label className={labelCls}>Last Name</label>
            <input
              required
              type="text"
              placeholder="Last"
              value={form.last}
              onChange={e => setField('last', e.target.value.replace(/\s/g, ''))}
              className={inputCls}
            />
          </div>
          <div className="w-[calc(50%-6px)]">
            <label className={labelCls}>Gender</label>
            <DropdownSelect
              options={[{ value: '0', label: 'Male' }, { value: '1', label: 'Female' }]}
              value={form.gender}
              onChange={v => setField('gender', v)}
              placeholder="Select Gender"
            />
          </div>
          <div className="w-[calc(50%-6px)]">
            <label className={labelCls}>Date of Birth</label>
            <input
              required
              type="date"
              max={getMaxDob()}
              value={form.dob}
              onChange={e => setField('dob', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="w-full">
            <label className={labelCls}>Country of Origin</label>
            <CountrySelect value={form.origin} onChange={v => setField('origin', v)} />
          </div>
          <div className="w-full">
            <label className={labelCls}>Character Biography</label>
            <textarea
              required
              rows={4}
              placeholder="Write a short biography for your character..."
              value={form.bio}
              onChange={e => setField('bio', e.target.value)}
              className={inputCls + ' resize-none'}
            />
          </div>
        </form>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/[0.07]">
          <button
            type="button"
            onClick={onCancel}
            className="font-display font-bold text-[0.78rem] uppercase tracking-[0.03em] text-white/60 bg-white/[0.05] border border-white/[0.07] px-5 py-1.5 hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="createForm"
            className="font-display font-bold text-[0.78rem] uppercase tracking-[0.03em] text-white px-5 py-1.5 hover:opacity-85 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#FF5C3A,#FF8C42,#FFB347)' }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
