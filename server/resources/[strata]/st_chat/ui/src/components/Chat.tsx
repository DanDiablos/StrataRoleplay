import React, { useRef, useEffect, useState } from 'react'
import { useStore } from '../store'
import Message from './Message'
import Input from './Input'

export default function Chat(): React.ReactElement {
  const open     = useStore(s => s.open)
  const messages = useStore(s => s.messages)
  const listRef  = useRef<HTMLDivElement>(null)

  // `showing`   — true while chat is open; lingers 2.5s after close
  // `previewing`— true for 6s when a new message arrives while closed
  const [showing,    setShowing]    = useState(false)
  const [previewing, setPreviewing] = useState(false)

  const showingTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // React to chat open/close
  useEffect(() => {
    if (open) {
      clearTimeout(showingTimer.current ?? undefined)
      setShowing(true)
    } else {
      // Linger for 2.5s then hide
      showingTimer.current = setTimeout(() => setShowing(false), 2500)
    }
    return () => clearTimeout(showingTimer.current ?? undefined)
  }, [open])

  // Preview for 6s on every new message when chat is closed
  useEffect(() => {
    if (open || messages.length === 0) return
    setPreviewing(true)
    clearTimeout(previewingTimer.current ?? undefined)
    previewingTimer.current = setTimeout(() => setPreviewing(false), 6000)
    return () => clearTimeout(previewingTimer.current ?? undefined)
  }, [messages])

  // Auto-scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const visible = showing || previewing

  return (
    <>
      {/* Message list */}
      <div
        ref={listRef}
        className="fixed top-[25px] left-[25px] h-[25vh] w-[30vw] overflow-y-auto overflow-x-hidden pointer-events-none transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {messages.map(msg => (
          <Message key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Input — directly below message area */}
      {open && (
        <div className="fixed top-[calc(25vh+25px)] left-[25px] w-[30vw]">
          <Input />
        </div>
      )}
    </>
  )
}
