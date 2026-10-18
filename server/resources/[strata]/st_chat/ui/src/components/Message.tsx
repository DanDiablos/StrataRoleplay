import React from 'react'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import { type ChatMessage, type OocAuthor, type EmergencyAuthor } from '../store'

interface TypeConfigEntry {
  label: string
  color: string
}

const TYPE_CONFIG: Record<string, TypeConfigEntry> = {
  system:    { label: 'SYSTEM',   color: '#f09348' },
  server:    { label: 'SERVER',   color: '#e74c3c' },
  ooc:       { label: 'OOC',      color: 'rgba(255,255,255,0.25)' },
  broadcast: { label: 'SERVER',   color: '#FF5C3A' },
  '911':     { label: '911',      color: '#247ba5' },
  '311':     { label: '311',      color: '#C274FC' },
  '411':     { label: '411',      color: '#81d455' },
  '411A':    { label: '411-A',    color: '#359fd4' },
  dispatch:  { label: 'DISPATCH', color: '#cef048' },
  tests:     { label: 'RESULTS',  color: '#B378DE' },
}

function safeHtml(str?: string): ReturnType<typeof parse> {
  if (!str) return ''
  return parse(DOMPurify.sanitize(String(str).replace(/~n~/g, '<br/>')))
}

interface AuthorInfoProps {
  author?: ChatMessage['author']
  type: string
}

function AuthorInfo({ author, type }: AuthorInfoProps): React.ReactElement | null {
  if (!author) return null

  if (type === 'ooc' && typeof author === 'object') {
    const a = author as OocAuthor
    return (
      <small className="ml-1 text-white/30">
        {a.First} {a.Last} <span className="text-white/20">({a.SID})</span>
      </small>
    )
  }

  if ((type === '911' || type === '311') && typeof author === 'object') {
    const a = author as EmergencyAuthor
    if (a.Anonymous) {
      return <small className="ml-1 text-white/30 italic">Anonymous</small>
    }
    if (a.Reply) {
      return (
        <small className="ml-1 text-white/30">
          {a.First} {a.Last} <span className="text-white/20">→ {a.Reply}</span>
        </small>
      )
    }
    return (
      <small className="ml-1 text-white/30">
        {a.First} {a.Last} <span className="text-white/20">({a.SID}) | {a.Phone}</span>
      </small>
    )
  }

  return null
}

interface LegacyMessageProps {
  msg: ChatMessage
}

function LegacyMessage({ msg }: LegacyMessageProps): React.ReactElement {
  const args  = msg.args  || []
  const color = msg.color || [255, 255, 255]
  const text  = args.length > 1 ? args.slice(1).join(' ') : args[0] || ''
  const name  = args.length > 1 ? args[0] : null

  return (
    <div
      className="mb-1 py-[6px] pr-[10px] pl-3 min-w-[160px] w-fit bg-[rgba(14,14,14,0.88)] border border-white/[0.07] border-l-[3px] border-l-white/25"
    >
      <div className="font-sans text-[0.82rem] text-white/85 leading-[1.4]">
        {name && (
          <span style={{ color: `rgb(${color[0]},${color[1]},${color[2]})` }} className="font-medium mr-1">
            {name}
          </span>
        )}
        {safeHtml(text)}
      </div>
    </div>
  )
}

interface MessageProps {
  msg: ChatMessage
}

export default function Message({ msg }: MessageProps): React.ReactElement {
  if (!msg.type || msg.args) {
    return <LegacyMessage msg={msg} />
  }

  const config = TYPE_CONFIG[msg.type]
  const borderColor = config?.color || '#FF5C3A'

  return (
    <div
      className="mb-1 py-[6px] pr-[10px] pl-3 min-w-[160px] w-fit bg-[rgba(14,14,14,0.88)] border border-white/[0.07] border-l-[3px]"
      style={{ borderLeftColor: borderColor }}
    >
      <div
        className="font-mono text-[0.68rem] tracking-[0.04em] leading-none mb-[3px]"
        style={{ color: borderColor }}
      >
        {config && <span>[{config.label}]</span>}
        <AuthorInfo author={msg.author} type={msg.type} />
      </div>
      <div className="font-sans text-[0.82rem] text-white/85 leading-[1.4]">
        {safeHtml(msg.message)}
      </div>
    </div>
  )
}
