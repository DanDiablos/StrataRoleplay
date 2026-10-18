import React, { useMemo } from 'react';
import InventorySlot from './InventorySlot';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  selectLeftInventory,
  selectBackpackInventory,
  selectItemAmount,
  setItemAmount,
  selectLeftInventoryCollapsed,
  toggleLeftInventory,
} from '../../store/inventory';
import { getTotalWeight } from '../../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const LeftInventory: React.FC = () => {
  const leftInventory = useAppSelector(selectLeftInventory);
  const backpackInventory = useAppSelector(selectBackpackInventory);
  const itemAmount = useAppSelector(selectItemAmount);
  const isCollapsed = useAppSelector(selectLeftInventoryCollapsed);
  const dispatch = useAppDispatch();

  const totalWeight = useMemo(
    () => (leftInventory.maxWeight !== undefined ? Math.floor(getTotalWeight(leftInventory.items) * 1000) / 1000 : 0),
    [leftInventory.maxWeight, leftInventory.items]
  );

  const mainInventoryItems = leftInventory.items.slice(9);
  const backpackInventoryItems = backpackInventory.items || [];

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.valueAsNumber =
      isNaN(event.target.valueAsNumber) || event.target.valueAsNumber < 0 ? 0 : Math.floor(event.target.valueAsNumber);
    dispatch(setItemAmount(event.target.valueAsNumber));
  };

  const collapseButton = (
    <button className="inventory-collapse-button" onClick={() => dispatch(toggleLeftInventory())}>
      <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} size="lg" />
    </button>
  );

  return (
    <div className={`inventory-grid-wrapper left-inventory ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="inventory-header-row">
        {backpackInventory.id && (
          <div className="inventory-backpack-header-cell">
            <div className="inventory-grid-header-wrapper inventory-backpack-header-wrapper">
              <div className="inventory-header-content">
                <p>Backpack</p>
                <div className="inventory-header-right">
                  <p>{backpackInventory.slots} Slots</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="inventory-main-header-cell">
          <div className="inventory-grid-header-wrapper">
            <div className="inventory-header-content">
              <p>{leftInventory.label}</p>
              <div className="inventory-header-right">
                {leftInventory.maxWeight && (
                  <p>
                    {Math.round((totalWeight / 1000) * 10) / 10}/{Math.round((leftInventory.maxWeight / 1000) * 10) / 10}
                    kg
                  </p>
                )}
                <input
                  className="inventory-control-input"
                  type="number"
                  defaultValue={itemAmount}
                  onChange={inputHandler}
                  min={0}
                  placeholder="Qty"
                />
                {collapseButton}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="inventory-body-row">
        {backpackInventory.id && (
          <div className={`inventory-grid-container inventory-backpack-grid ${isCollapsed ? 'collapsed' : ''}`}>
            {backpackInventoryItems.map((item) => (
              <InventorySlot
                key={`backpack-${item.slot}`}
                item={item}
                inventoryType={backpackInventory.type}
                inventoryGroups={leftInventory.groups}
                inventoryId={backpackInventory.id}
              />
            ))}
          </div>
        )}
        <div className={`inventory-grid-container ${isCollapsed ? 'collapsed' : ''}`}>
          {mainInventoryItems.map((item) => (
            <InventorySlot
              key={`left-${item.slot}`}
              item={item}
              inventoryType={leftInventory.type}
              inventoryGroups={leftInventory.groups}
              inventoryId={leftInventory.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftInventory;
