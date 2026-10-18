import React from 'react'
import type { MenuItem } from '../../types.ts'
import Button from './Button.tsx'
import AdvancedButton from './AdvancedButton.tsx'
import Checkbox from './Checkbox.tsx'
import ColorList from './ColorList.tsx'
import ColorPicker from './ColorPicker.tsx'
import Input from './Input.tsx'
import NumberInput from './Number.tsx'
import Select from './Select.tsx'
import Slider from './Slider.tsx'
import Submenu from './Submenu.tsx'
import SubmenuBack from './SubmenuBack.tsx'
import Text from './Text.tsx'
import Ticker from './Ticker.tsx'

export function renderItem(item: MenuItem, i: number, mId: string): React.ReactElement {
  const props = { data: item, id: i, mId }
  switch (item.type.toUpperCase()) {
    case 'ADVANCED':    return <AdvancedButton {...props} />
    case 'CHECKBOX':    return <Checkbox       {...props} />
    case 'SLIDER':      return <Slider         {...props} />
    case 'TICKER':      return <Ticker         {...props} />
    case 'COLORPICKER': return <ColorPicker    {...props} />
    case 'COLORLIST':   return <ColorList      {...props} />
    case 'INPUT':       return <Input          {...props} />
    case 'NUMBER':      return <NumberInput    {...props} />
    case 'SELECT':      return <Select         {...props} />
    case 'TEXT':        return <Text           {...props} />
    case 'SUBMENU':     return <Submenu        {...props} />
    case 'GOBACK':      return <SubmenuBack    {...props} />
    default:            return <Button         {...props} />
  }
}
