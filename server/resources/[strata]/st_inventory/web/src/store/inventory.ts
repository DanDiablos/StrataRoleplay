import { createSlice, current, isFulfilled, isPending, isRejected, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';
import {
  moveSlotsReducer,
  refreshSlotsReducer,
  setupInventoryReducer,
  stackSlotsReducer,
  swapSlotsReducer,
} from '../reducers';
import { State } from '../typings';

const initialState: State = {
  leftInventory: {
    id: '',
    type: '',
    slots: 0,
    maxWeight: 0,
    items: [],
  },
  rightInventory: {
    id: '',
    type: '',
    slots: 0,
    maxWeight: 0,
    items: [],
  },
  utilityInventory: {
    id: '',
    type: '',
    slots: 9,
    maxWeight: 0,
    items: [],
  },
  backpackInventory: {
    id: '',
    type: 'backpack',
    slots: 0,
    maxWeight: 0,
    items: [],
  },
  currentView: 'utility', // 'normal' or 'utility'
  additionalMetadata: new Array(),
  itemAmount: 0,
  shiftPressed: false,
  isBusy: false,
  leftInventoryCollapsed: false,
  rightInventoryCollapsed: false,
};

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    stackSlots: stackSlotsReducer,
    swapSlots: swapSlotsReducer,
    setupInventory: setupInventoryReducer,
    moveSlots: moveSlotsReducer,
    refreshSlots: refreshSlotsReducer,
    setAdditionalMetadata: (state, action: PayloadAction<Array<{ metadata: string; value: string }>>) => {
      const metadata = [];

      for (let i = 0; i < action.payload.length; i++) {
        const entry = action.payload[i];
        if (!state.additionalMetadata.find((el) => el.value === entry.value)) metadata.push(entry);
      }

      state.additionalMetadata = [...state.additionalMetadata, ...metadata];
    },
    setItemAmount: (state, action: PayloadAction<number>) => {
      state.itemAmount = action.payload;
    },
    setShiftPressed: (state, action: PayloadAction<boolean>) => {
      state.shiftPressed = action.payload;
    },
    setContainerWeight: (state, action: PayloadAction<number>) => {
      const container = state.leftInventory.items.find((item) => item.metadata?.container === state.rightInventory.id);

      if (!container) return;

      container.weight = action.payload;
    },
    toggleView: (state) => {
      state.currentView = state.currentView === 'normal' ? 'utility' : 'normal';
    },
    setView: (state, action: PayloadAction<'normal' | 'utility'>) => {
      state.currentView = action.payload;
    },
    toggleLeftInventory: (state) => {
      state.leftInventoryCollapsed = !state.leftInventoryCollapsed;
    },
    toggleRightInventory: (state) => {
      state.rightInventoryCollapsed = !state.rightInventoryCollapsed;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isPending, (state) => {
      state.isBusy = true;

      state.history = {
        leftInventory: current(state.leftInventory),
        rightInventory: current(state.rightInventory),
        backpackInventory: current(state.backpackInventory),
      };
    });
    builder.addMatcher(isFulfilled, (state) => {
      state.isBusy = false;
    });
    builder.addMatcher(isRejected, (state) => {
      if (state.history && state.history.leftInventory && state.history.rightInventory) {
        state.leftInventory = state.history.leftInventory;
        state.rightInventory = state.history.rightInventory;
        state.backpackInventory = state.history.backpackInventory;
      }
      state.isBusy = false;
    });
  },
});

export const {
  setAdditionalMetadata,
  setItemAmount,
  setShiftPressed,
  setupInventory,
  swapSlots,
  moveSlots,
  stackSlots,
  refreshSlots,
  setContainerWeight,
  toggleView,
  setView,
  toggleLeftInventory,
  toggleRightInventory,
} = inventorySlice.actions;
export const selectLeftInventory = (state: RootState) => state.inventory.leftInventory;
export const selectRightInventory = (state: RootState) => state.inventory.rightInventory;
export const selectUtilityInventory = (state: RootState) => state.inventory.utilityInventory;
export const selectBackpackInventory = (state: RootState) => state.inventory.backpackInventory;
export const selectCurrentView = (state: RootState) => state.inventory.currentView;
export const selectItemAmount = (state: RootState) => state.inventory.itemAmount;
export const selectIsBusy = (state: RootState) => state.inventory.isBusy;
export const selectLeftInventoryCollapsed = (state: RootState) => state.inventory.leftInventoryCollapsed;
export const selectRightInventoryCollapsed = (state: RootState) => state.inventory.rightInventoryCollapsed;

export default inventorySlice.reducer;
