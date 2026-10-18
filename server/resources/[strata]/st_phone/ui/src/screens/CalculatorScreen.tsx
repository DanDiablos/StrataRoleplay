import React, { useState } from 'react'
import { Delete } from 'lucide-react'

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
]

function evaluate(expression: string): string {
  try {
    const sanitised = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
    if (!/^[\d+\-*/().  ]+$/.test(sanitised)) return 'Error'
    const result = Function(`"use strict"; return (${sanitised})`)()
    if (!isFinite(result)) return 'Error'
    return String(Math.round(result * 1e10) / 1e10)
  } catch {
    return 'Error'
  }
}

export default function CalculatorScreen(): React.ReactElement {
  const [display, setDisplay] = useState('0')
  const [hasResult, setHasResult] = useState(false)

  const handlePress = (key: string) => {
    switch (key) {
      case 'C':
        setDisplay('0')
        setHasResult(false)
        break
      case '⌫':
        setDisplay((d) => (d.length <= 1 ? '0' : d.slice(0, -1)))
        break
      case '±':
        setDisplay((d) => (d.startsWith('-') ? d.slice(1) : d === '0' ? '0' : '-' + d))
        break
      case '%':
        setDisplay((d) => {
          const num = parseFloat(d)
          return isNaN(num) ? '0' : String(num / 100)
        })
        break
      case '=': {
        const result = evaluate(display)
        setDisplay(result)
        setHasResult(true)
        break
      }
      default: {
        const isOp = ['+', '−', '×', '÷'].includes(key)
        if (hasResult && !isOp) {
          setDisplay(key)
          setHasResult(false)
        } else {
          setDisplay((d) => (d === '0' && !isOp && key !== '.' ? key : d + key))
          setHasResult(false)
        }
      }
    }
  }

  const isOp = (key: string) => ['+', '−', '×', '÷'].includes(key)

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
          Calculator
        </span>
      </div>

      {/* Display */}
      <div className="px-4 py-6 flex flex-col items-end justify-end min-h-[80px]">
        <span className="font-mono text-[1.8rem] font-bold text-white/90 leading-none break-all text-right max-w-full">
          {display}
        </span>
      </div>

      {/* Button grid */}
      <div className="flex-1 flex flex-col gap-[1px] px-2 pb-2">
        {BUTTONS.map((row, ri) => (
          <div key={ri} className="flex-1 flex gap-[1px]">
            {row.map((key) => {
              const accent = key === '=' || isOp(key)
              const clear = key === 'C' || key === '±' || key === '%'
              return (
                <button
                  key={key}
                  onClick={() => handlePress(key)}
                  className={`flex-1 flex items-center justify-center rounded-lg text-[1rem] font-medium transition-colors ${
                    accent
                      ? 'bg-primary/20 text-primary hover:bg-primary/30'
                      : clear
                        ? 'bg-white/[0.08] text-white/60 hover:bg-white/[0.12]'
                        : 'bg-white/[0.04] text-white/80 hover:bg-white/[0.08]'
                  }`}
                >
                  {key === '⌫' ? <Delete size={16} /> : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
