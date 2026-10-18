import React, { useState } from 'react';
import useNuiEvent from '../../hooks/useNuiEvent';
import InventoryControl from './InventoryControl';
import InventoryHotbar from './InventoryHotbar';
import { useAppDispatch } from '../../store';
import { refreshSlots, setAdditionalMetadata, setupInventory } from '../../store/inventory';
import { useExitListener } from '../../hooks/useExitListener';
import type { Inventory as InventoryProps } from '../../typings';
import RightInventory from './RightInventory';
import LeftInventory from './LeftInventory';
import UtilityInventory from './UtilityInventory';
import SectionIndicator from './SectionIndicator';
import CloseButton from './CloseButton';
import Tooltip from '../utils/Tooltip';
import { closeTooltip } from '../../store/tooltip';
import InventoryContext from './InventoryContext';
import { closeContextMenu } from '../../store/contextMenu';
import Fade from '../utils/transitions/Fade';
import { useAppSelector } from '../../store';
import { selectCurrentView, selectRightInventory } from '../../store/inventory';
import CraftingInventory from './CraftingInventory';

const Inventory: React.FC = () => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(selectCurrentView);
  const rightInventory = useAppSelector(selectRightInventory);

  useNuiEvent<boolean>('setInventoryVisible', setInventoryVisible);
  useNuiEvent<false>('closeInventory', () => {
    setInventoryVisible(false);
    dispatch(closeContextMenu());
    dispatch(closeTooltip());
  });
  useExitListener(setInventoryVisible);

  useNuiEvent<{
    leftInventory?: InventoryProps;
    rightInventory?: InventoryProps;
    backpackInventory?: InventoryProps | false;
  }>('setupInventory', (data) => {
    dispatch(setupInventory(data));
    dispatch(closeTooltip());
    !inventoryVisible && setInventoryVisible(true);
  });

  useNuiEvent('refreshSlots', (data) => dispatch(refreshSlots(data)));

  useNuiEvent('displayMetadata', (data: Array<{ metadata: string; value: string }>) => {
    dispatch(setAdditionalMetadata(data));
  });

  return (
    <>
      <Fade in={inventoryVisible}>
        <>
          <div className="inventory-shell">
            <div className="inv-header">
              <div className="inv-header-left">
                <span className="inv-brand">STRATA</span>
                <span className="inv-sub">/ inventory</span>
              </div>
              <SectionIndicator />
              <div className="inv-header-right">
                <InventoryControl />
                <CloseButton />
              </div>
            </div>
            <div className="inv-body">
              <LeftInventory />
              <div className="inv-divider" />
              {rightInventory.type === 'crafting' && currentView === 'normal' ? (
                <CraftingInventory />
              ) : rightInventory.type === 'crafting' && currentView === 'utility' ? (
                <UtilityInventory />
              ) : currentView === 'normal' ? (
                <RightInventory />
              ) : (
                <UtilityInventory />
              )}
            </div>
            <InventoryContext />
          </div>
          <Tooltip />
        </>
      </Fade>
      <InventoryHotbar />
    </>
  );
};

export default Inventory;
