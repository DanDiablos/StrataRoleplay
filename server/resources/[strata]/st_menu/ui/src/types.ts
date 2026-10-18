export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface SelectOption {
  label: string
  value: string | number
}

export interface ColorOption {
  label: string
  rgb?: RgbColor
  hex?: string
}

export interface ButtonOptions {
  disabled?: boolean
  error?: boolean
  success?: boolean
}

export interface AdvancedOptions {
  disabled?: boolean
  secondaryLabel?: string
}

export interface CheckboxOptions {
  disabled?: boolean
  selected?: boolean
}

export interface SliderOptions {
  disabled?: boolean
  min: number
  max: number
  current: number
  step?: number
}

export interface TickerOptions {
  disabled?: boolean
  min?: number
  max: number
  current: number
}

export interface InputOptions {
  disabled?: boolean
  max?: number
  current?: string
}

export interface NumberOptions {
  disabled?: boolean
  current?: string | number
}

export interface SelectOptions {
  disabled?: boolean
  current: string | number
  list: SelectOption[]
}

export interface ColorPickerOptions {
  disabled?: boolean
  current: RgbColor
}

export interface ColorListOptions {
  disabled?: boolean
  current: number
  colors: ColorOption[]
}

export interface TextOptions {
  classes?: string[]
}

export interface SubmenuOptions {
  disabled?: boolean
}

export interface GoBackOptions {
  disabled?: boolean
}

export type ItemType =
  | 'BUTTON'
  | 'ADVANCED'
  | 'CHECKBOX'
  | 'SLIDER'
  | 'TICKER'
  | 'INPUT'
  | 'NUMBER'
  | 'SELECT'
  | 'COLORPICKER'
  | 'COLORLIST'
  | 'TEXT'
  | 'SUBMENU'
  | 'GOBACK'

export interface MenuItem {
  id: string
  label: string
  type: ItemType
  options: Record<string, unknown>
}

export interface MenuData {
  id: string | null
  label: string | null
  items: MenuItem[]
}
