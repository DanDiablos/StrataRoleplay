import React from 'react'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import { cn } from '../../utils.ts'
import type { TextOptions } from '../../types.ts'

interface TextItem {
  id: string
  label: string
  options: TextOptions
}

interface Props { data: TextItem }

const CLASS_MAP: Record<string, string> = {
  heading:        'font-display font-bold text-[18px] tracking-[1.5px] uppercase pb-3 border-b border-white/[0.08] mb-1',
  textSmall:      'text-[9px]',
  textMedium:     'text-[12px]',
  textLarge:      'text-[15px]',
  textExtraLarge: 'text-[20px]',
  code:           'font-mono text-primary',
  center:         'text-center',
  left:           'text-left',
  right:          'text-right',
  bold:           'font-semibold',
  pad:            'px-4 py-3',
  colorPrimary:   'text-primary',
  colorError:     'text-menu-error-lt',
  colorWarning:   'text-menu-warning',
  colorSuccess:   'text-menu-success-lt',
}

export default function Text({ data }: Props): React.ReactElement {
  const extra = (data.options.classes ?? [])
    .map(c => CLASS_MAP[c])
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cn('text-left text-[12px] text-white/70 mb-1', extra)}>
      {parse(DOMPurify.sanitize(data.label ?? ''))}
    </div>
  )
}
