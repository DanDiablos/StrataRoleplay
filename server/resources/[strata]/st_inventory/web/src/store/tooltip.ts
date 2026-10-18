import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Inventory, SlotWithItem } from '../typings';

interface TooltipState {
  open: boolean;
  item: SlotWithItem | null;
  inventoryType: Inventory['type'] | null;
  coords: {
    x: number;
    y: number;
  } | null;
}

const initialState: TooltipState = {
  open: false,
  item: null,
  inventoryType: null,
  coords: null,
};

export const tooltipSlice = createSlice({
  name: 'tooltip',
  initialState,
  reducers: {
    openTooltip(
      state,
      action: PayloadAction<{ item: SlotWithItem; inventoryType: Inventory['type']; coords: { x: number; y: number } }>
    ) {
      state.open = true;
      state.item = action.payload.item;
      state.inventoryType = action.payload.inventoryType;
      state.coords = action.payload.coords;
    },
    moveTooltip(state, action: PayloadAction<{ x: number; y: number }>) {
      if (!state.open) return;
      state.coords = action.payload;
    },
    closeTooltip(state) {
      state.open = false;
      state.coords = null;
    },
  },
});

export const { openTooltip, moveTooltip, closeTooltip } = tooltipSlice.actions;

export default tooltipSlice.reducer;
