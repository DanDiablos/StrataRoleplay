import { create } from 'zustand'
import { sendNui } from './nui.ts'
import type { MenuData, MenuItem } from './types.ts'

const isDev = import.meta.env.DEV

const DEV_ITEMS: MenuItem[] = [
  { type: 'TEXT',        id: 'dev-0',  label: 'Dev Menu',                         options: { classes: ['heading'] } },
  { type: 'TEXT',        id: 'dev-1',  label: 'Press SHIFT to toggle camera',     options: { classes: ['pad', 'code', 'center', 'textLarge'] } },
  { type: 'BUTTON',      id: 'dev-2',  label: 'Normal Button',                    options: {} },
  { type: 'BUTTON',      id: 'dev-3',  label: 'Success Button',                   options: { success: true } },
  { type: 'BUTTON',      id: 'dev-4',  label: 'Error / Disabled Button',          options: { error: true, disabled: true } },
  { type: 'ADVANCED',    id: 'dev-5',  label: 'Advanced Button',                  options: { secondaryLabel: 'SUB' } },
  { type: 'CHECKBOX',    id: 'dev-6',  label: 'Checkbox Item',                    options: { selected: false } },
  { type: 'SLIDER',      id: 'dev-7',  label: 'Slider',                           options: { min: 0, max: 100, current: 50, step: 1 } },
  { type: 'TICKER',      id: 'dev-8',  label: 'Ticker',                           options: { min: 0, max: 10, current: 3 } },
  { type: 'SELECT',      id: 'dev-9',  label: 'Select',                           options: { current: 1, list: [{ label: 'Option A', value: 1 }, { label: 'Option B', value: 2 }, { label: 'Option C', value: 3 }] } },
  { type: 'INPUT',       id: 'dev-10', label: 'Text Input',                       options: { max: 256, current: '' } },
  { type: 'NUMBER',      id: 'dev-11', label: 'Number Input',                     options: { current: '' } },
  { type: 'COLORPICKER', id: 'dev-12', label: 'Color Picker',                     options: { current: { r: 100, g: 150, b: 200 } } },
  { type: 'COLORLIST',   id: 'dev-13', label: 'Color List',                       options: { current: 0, colors: [{ label: 'Red', rgb: { r: 255, g: 0, b: 0 } }, { label: 'Green', rgb: { r: 0, g: 255, b: 0 } }, { label: 'Blue', rgb: { r: 0, g: 0, b: 255 } }] } },
  { type: 'GOBACK',      id: 'dev-14', label: 'Go Back',                          options: {} },
]

interface StoreState {
  hidden: boolean
  menu: MenuData
  prevMenu: MenuData[]
  dispatch: (type: string, payload?: Record<string, unknown>) => void
  subMenuBack: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  hidden: !isDev,
  menu: {
    id:    isDev ? 'root' : null,
    label: isDev ? 'Test Menu' : null,
    items: isDev ? DEV_ITEMS : [],
  },
  prevMenu: [],

  dispatch: (type, payload = {}) => {
    switch (type) {
      case 'APP_SHOW':
        set({ hidden: false })
        break
      case 'APP_HIDE':
        set({ hidden: true })
        break
      case 'SETUP_MENU':
        set({ menu: payload['data'] as MenuData, prevMenu: [] })
        break
      case 'UPDATE_MENU':
        set({ menu: payload['data'] as MenuData })
        break
      case 'SUBMENU_OPEN':
        if (payload['addHistroy']) {
          set(s => ({ prevMenu: [...s.prevMenu, s.menu], menu: payload['data'] as MenuData }))
        } else {
          set({ menu: payload['data'] as MenuData })
        }
        break
      case 'CLEAR_MENU':
        set({ menu: { id: null, label: null, items: [] }, prevMenu: [] })
        break
    }
  },

  subMenuBack: () => {
    const { menu, prevMenu } = get()
    sendNui('MenuClose', { id: menu.id as string })
    if (prevMenu.length > 0) {
      sendNui('MenuOpen', { id: prevMenu[prevMenu.length - 1].id as string, back: true })
      set({ prevMenu: prevMenu.slice(0, -1) })
    } else {
      sendNui('Close')
      set({ menu: { id: null, label: null, items: [] }, prevMenu: [] })
    }
  },
}))
