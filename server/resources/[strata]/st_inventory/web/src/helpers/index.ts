import { Inventory, InventoryType, ItemData, Slot, SlotWithItem, State } from '../typings';
import { isEqual } from 'lodash';
import { store } from '../store';
import { Items } from '../store/items';
import { imagepath } from '../store/imagepath';
import { fetchNui } from '../utils/fetchNui';

export const canPurchaseItem = (item: Slot, inventory: { type: Inventory['type']; groups: Inventory['groups'] }) => {
  if (inventory.type !== 'shop' || !isSlotWithItem(item)) return true;

  if (item.count !== undefined && item.count === 0) return false;

  if (item.grade === undefined || !inventory.groups) return true;

  const leftInventory = store.getState().inventory.leftInventory;

  // Shop requires groups but player has none
  if (!leftInventory.groups) return false;

  const reqGroups = Object.keys(inventory.groups);

  if (Array.isArray(item.grade)) {
    for (let i = 0; i < reqGroups.length; i++) {
      const reqGroup = reqGroups[i];

      if (leftInventory.groups[reqGroup] !== undefined) {
        const playerGrade = leftInventory.groups[reqGroup];
        for (let j = 0; j < item.grade.length; j++) {
          const reqGrade = item.grade[j];

          if (playerGrade === reqGrade) return true;
        }
      }
    }

    return false;
  } else {
    for (let i = 0; i < reqGroups.length; i++) {
      const reqGroup = reqGroups[i];
      if (leftInventory.groups[reqGroup] !== undefined) {
        const playerGrade = leftInventory.groups[reqGroup];

        if (playerGrade >= item.grade) return true;
      }
    }

    return false;
  }
};

export const canCraftItem = (item: Slot, inventoryType: string) => {
  if (!isSlotWithItem(item) || inventoryType !== 'crafting') return true;
  if (!item.ingredients) return true;
  const leftInventory = store.getState().inventory.leftInventory;
  const ingredientItems = Object.entries(item.ingredients);

  const remainingItems = ingredientItems.filter((ingredient) => {
    const [item, count] = [ingredient[0], ingredient[1]];
    const globalItem = Items[item];

    if (count >= 1) {
      if (globalItem && globalItem.count >= count) return false;
    }

    const totalCount = leftInventory.items.reduce((total, playerItem) => {
      if (isSlotWithItem(playerItem) && playerItem.name === item) {
        if (count < 1) {
          const durability = playerItem.metadata?.durability || 0;
          return durability >= count * 100 ? 1 : 0;
        } else {
          return total + (playerItem.count || 0);
        }
      }
      return total;
    }, 0);

    const hasItem = count < 1 ? totalCount > 0 : totalCount >= count;

    return !hasItem;
  });

  return remainingItems.length === 0;
};

export const isSlotWithItem = (slot: Slot, strict: boolean = false): slot is SlotWithItem =>
  (slot.name !== undefined && slot.weight !== undefined) ||
  (strict && slot.name !== undefined && slot.count !== undefined && slot.weight !== undefined);

export const canStack = (sourceSlot: Slot, targetSlot: Slot) =>
  sourceSlot.name === targetSlot.name && isEqual(sourceSlot.metadata, targetSlot.metadata);

export const findAvailableSlot = (item: Slot, data: ItemData, items: Slot[], inventoryType?: string) => {
  const isPlayerInventory = inventoryType === 'player';
  const startSlot = isPlayerInventory ? 9 : 0;

  if (!data.stack) {
    for (let i = startSlot; i < items.length; i++) {
      if (items[i]?.name === undefined) {
        return items[i];
      }
    }
    if (isPlayerInventory) {
      return items.find((target) => target.name === undefined);
    }
    return undefined;
  }

  const stackableSlot = items.find((target) => target.name === item.name && isEqual(target.metadata, item.metadata));

  if (stackableSlot) return stackableSlot;

  for (let i = startSlot; i < items.length; i++) {
    if (items[i]?.name === undefined) {
      return items[i];
    }
  }
  if (isPlayerInventory) {
    return items.find((target) => target.name === undefined);
  }
  return undefined;
};

export const getTargetInventory = (
  state: State,
  sourceType: Inventory['type'],
  targetType?: Inventory['type']
): { sourceInventory: Inventory; targetInventory: Inventory } => {
  const getInventoryByType = (inventoryType?: string): Inventory => {
    if (inventoryType === InventoryType.PLAYER || inventoryType === 'utility') return state.leftInventory;
    if (inventoryType === InventoryType.BACKPACK || inventoryType === 'backpack') return state.backpackInventory;
    return state.rightInventory;
  };

  const sourceInventory = getInventoryByType(sourceType);
  const targetInventory = targetType ? getInventoryByType(targetType) : sourceInventory === state.leftInventory ? state.rightInventory : state.leftInventory;

  return {
    sourceInventory,
    targetInventory,
  };
};

export const itemDurability = (metadata: any, curTime: number) => {
  // sorry dunak
  // it's ok linden i fix inventory
  if (metadata?.durability === undefined) return;

  let durability = metadata.durability;

  if (durability > 100 && metadata.degrade)
    durability = ((metadata.durability - curTime) / (60 * metadata.degrade)) * 100;

  if (durability < 0) durability = 0;

  return durability;
};

export const getTotalWeight = (items: Inventory['items']) =>
  items.reduce((totalWeight, slot) => (isSlotWithItem(slot) ? totalWeight + slot.weight : totalWeight), 0);

export const isContainer = (inventory: Inventory) => inventory.type === InventoryType.CONTAINER;

export const getItemData = async (itemName: string) => {
  const resp: ItemData | null = await fetchNui('getItemData', itemName);

  if (resp?.name) {
    Items[itemName] = resp;
    return resp;
  }
};

export const getItemUrl = (item: string | SlotWithItem, ext: 'webp' | 'png' = 'webp') => {
  // DEBUG: Log the generated image path
  let url;
  const isObj = typeof item === 'object';

  if (isObj) {
    if (!item.name) return;

    const metadata = item.metadata;

    if (metadata?.imageurl) {
      url = `${metadata.imageurl}`;
      // Debugging removed
      return url;
    }
    if (metadata?.image) {
      url = `${imagepath}/${metadata.image}.${ext}`;
      // Debugging removed
      return url;
    }
  }

  const itemName = isObj ? (item.name as string) : item;
  const itemData = Items[itemName];

  if (!itemData) {
    url = `${imagepath}/${itemName}.${ext}`;
    // Debugging removed
    return url;
  }
  if (itemData.image) {
    // Debugging removed
    return itemData.image;
  }

  itemData.image = `${imagepath}/${itemName}.${ext}`;
  // Debugging removed
  return itemData.image;
};
