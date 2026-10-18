import { Inventory } from './inventory';

export type State = {
  leftInventory: Inventory;
  rightInventory: Inventory;
  backpackInventory: Inventory;
  utilityInventory: Inventory;
  currentView: 'normal' | 'utility';
  itemAmount: number;
  shiftPressed: boolean;
  isBusy: boolean;
  leftInventoryCollapsed: boolean;
  rightInventoryCollapsed: boolean;
  additionalMetadata: Array<{ metadata: string; value: string }>;
  history?: {
    leftInventory: Inventory;
    rightInventory: Inventory;
    backpackInventory: Inventory;
  };
};
