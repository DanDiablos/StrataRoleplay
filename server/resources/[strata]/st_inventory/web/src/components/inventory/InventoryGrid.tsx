import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inventory } from '../../typings';
import InventorySlot from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useAppSelector } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';

const PAGE_SIZE = 30;

const InventoryGrid: React.FC<{
  inventory: Inventory;
  isCollapsed?: boolean;
  collapseButton?: React.ReactNode;
}> = ({ inventory, isCollapsed = false, collapseButton }) => {
  const weight = useMemo(
    () => (inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );
  const [page, setPage] = useState(0);
  const containerRef = useRef(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => ++prev);
    }
  }, [entry]);
  return (
    <>
      <div
        className={`inventory-grid-wrapper ${isCollapsed ? 'collapsed' : ''}`}
        style={{ pointerEvents: isBusy ? 'none' : 'auto' }}
      >
        <div>
          <div className="inventory-grid-header-wrapper">
            <div className="inventory-header-content">
              <p>
                {inventory.type === 'newdrop'
                  ? inventory.label ? `New Drop — ${inventory.label}` : 'New Drop'
                  : inventory.label}
              </p>
              <div className="inventory-header-right">
                {inventory.maxWeight && (
                  <div className="inv-header-weight">
                    <div className="inv-weight-mini-bar">
                      <div
                        className="inv-weight-mini-fill"
                        style={{ width: `${Math.min(100, (weight / inventory.maxWeight) * 100)}%` }}
                      />
                    </div>
                    <p>
                      {Math.round((weight / 1000) * 10) / 10}/{Math.round((inventory.maxWeight / 1000) * 10) / 10}kg
                    </p>
                  </div>
                )}
                {collapseButton}
              </div>
            </div>
          </div>
        </div>
        <div className={`inventory-grid-container ${isCollapsed ? 'collapsed' : ''}`} ref={containerRef}>
          <>
            {inventory.items.slice(0, (page + 1) * PAGE_SIZE).map((item, index) => (
              <InventorySlot
                key={`${inventory.type}-${inventory.id}-${item.slot}`}
                item={item}
                ref={index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
                inventoryType={inventory.type}
                inventoryGroups={inventory.groups}
                inventoryId={inventory.id}
              />
            ))}
          </>
        </div>
      </div>
    </>
  );
};

export default InventoryGrid;
