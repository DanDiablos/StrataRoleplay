import { canStack, findAvailableSlot, getTargetInventory, isSlotWithItem } from '../helpers';
import { validateMove } from '../thunks/validateItems';
import { store } from '../store';
import { DragSource, DropTarget, InventoryType, SlotWithItem } from '../typings';
import { moveSlots, stackSlots, swapSlots } from '../store/inventory';
import { Items } from '../store/items';
import { canItemBePlacedInUtilitySlot, isUtilitySlot } from '../utils/utilitySlotValidation';
import { fetchNui } from '../utils/fetchNui';

export const onDrop = async (source: DragSource, target?: DropTarget) => {
  const { inventory: state } = store.getState();

  const { sourceInventory, targetInventory } = getTargetInventory(state, source.inventory, target?.inventory);

  const sourceSlot = sourceInventory.items[source.item.slot - 1] as SlotWithItem;

  const sourceData = Items[sourceSlot.name];

  if (sourceData === undefined) return console.error(`${sourceSlot.name} item data undefined!`);

  // If dragging from container slot
  if (sourceSlot.metadata?.container !== undefined) {
    // Prevent storing container in container
    if (targetInventory.type === InventoryType.CONTAINER)
      return console.log(`Cannot store container ${sourceSlot.name} inside another container`);

    // Prevent dragging of container slot when opened
    if (state.rightInventory.id === sourceSlot.metadata.container)
      return console.log(`Cannot move container ${sourceSlot.name} when opened`);
  }

  const targetSlot = target
    ? targetInventory.items[target.item.slot - 1]
    : findAvailableSlot(sourceSlot, sourceData, targetInventory.items, targetInventory.type);

  if (targetSlot === undefined) return console.error('Target slot undefined!');

  // If dropping on container slot when opened
  if (!target && targetInventory.type === 'player' && isUtilitySlot(targetSlot.slot)) {
    const canPlace = canItemBePlacedInUtilitySlot(sourceSlot.name, targetSlot.slot);
    if (!canPlace) {
      return;
    }
  }

  if (target && isUtilitySlot(target.item.slot) && target.inventory === 'utility') {
    const canPlace = canItemBePlacedInUtilitySlot(sourceSlot.name, target.item.slot);
    if (!canPlace) {
      const operation = isSlotWithItem(targetSlot, true) ? 'swap' : 'place';

      return;
    }

    if (isSlotWithItem(targetSlot, true) && isUtilitySlot(sourceSlot.slot)) {
      const canTargetGoToSource = canItemBePlacedInUtilitySlot(targetSlot.name, sourceSlot.slot);
      if (!canTargetGoToSource) {
        return;
      }
    }
  }

  if (target && isUtilitySlot(target.item.slot) && isSlotWithItem(targetSlot, true)) {
    const canSourceGoToTarget = canItemBePlacedInUtilitySlot(sourceSlot.name, target.item.slot);
    if (!canSourceGoToTarget) {
      return;
    }

    const isTargetItemAllowedInSlot = canItemBePlacedInUtilitySlot(targetSlot.name, target.item.slot);
    if (!isTargetItemAllowedInSlot) {
      return;
    }
  }

  if (isUtilitySlot(sourceSlot.slot) && source.inventory === 'utility') {
    const isSourceItemAllowed = canItemBePlacedInUtilitySlot(sourceSlot.name, sourceSlot.slot);
    if (!isSourceItemAllowed) {
      return;
    }

    if (target && isSlotWithItem(targetSlot, true) && !isUtilitySlot(target.item.slot)) {
      const canTargetGoToUtilitySlot = canItemBePlacedInUtilitySlot(targetSlot.name, sourceSlot.slot);
      if (!canTargetGoToUtilitySlot) {
        return;
      }
    }
  }
  if (isSlotWithItem(targetSlot, true) && target && isUtilitySlot(target.item.slot) && target.inventory === 'utility') {
    const isTargetItemAllowed = canItemBePlacedInUtilitySlot(targetSlot.name, target.item.slot);
    if (!isTargetItemAllowed) {
      return;
    }
  }

  if (targetSlot.metadata?.container !== undefined && state.rightInventory.id === targetSlot.metadata.container)
    return console.log(`Cannot swap item ${sourceSlot.name} with container ${targetSlot.name} when opened`);

  const count =
    state.shiftPressed && sourceSlot.count > 1 && sourceInventory.type !== 'shop'
      ? sourceSlot.count
      : state.itemAmount === 0 || state.itemAmount > sourceSlot.count
      ? sourceSlot.count
      : state.itemAmount;

  const data = {
    fromSlot: sourceSlot,
    toSlot: targetSlot,
    fromType: sourceInventory.type,
    fromInventoryId: sourceInventory.id,
    toType: targetInventory.type,
    toInventoryId: targetInventory.id,
    count: count,
  };

  store.dispatch(
    validateMove({
      ...data,
      fromSlot: sourceSlot.slot,
      toSlot: targetSlot.slot,
    })
  );

  isSlotWithItem(targetSlot, true)
    ? sourceData.stack && canStack(sourceSlot, targetSlot)
      ? store.dispatch(
          stackSlots({
            ...data,
            toSlot: targetSlot,
          })
        )
      : store.dispatch(
          swapSlots({
            ...data,
            toSlot: targetSlot,
          })
        )
    : store.dispatch(moveSlots(data));

  try {
    const settings = await fetchNui<{ screenBlur: boolean; audio: boolean }>('getSettings');
    if (settings.audio) {
      const audio = new Audio('./sounds/drag.ogg');
      audio.volume = 0.25;
      audio.play();
    }
  } catch (error) {
    console.log('Audio creation failed:', error);
  }
};
