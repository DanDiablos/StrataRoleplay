import React, { useState } from 'react';
import { getItemUrl, isSlotWithItem } from '../../helpers';
import useNuiEvent from '../../hooks/useNuiEvent';
import { Items } from '../../store/items';
import WeightBar from '../utils/WeightBar';
import { useAppSelector } from '../../store';
import { selectLeftInventory } from '../../store/inventory';
import { SlotWithItem } from '../../typings';
import SlideUp from '../utils/transitions/SlideUp';
import { Pistol } from '../utils/icons/IconDefinitions';
import { isEnvBrowser } from '../../utils/misc';
const InventoryHotbar: React.FC = () => {
  const [hotbarVisible, setHotbarVisible] = useState(isEnvBrowser());
  const items = useAppSelector(selectLeftInventory).items.slice(0, 5);

  //stupid fix for timeout
  const [handle, setHandle] = useState<NodeJS.Timeout>();
  useNuiEvent('toggleHotbar', () => {
    if (hotbarVisible) {
      setHotbarVisible(false);
    } else {
      if (handle) clearTimeout(handle);
      setHotbarVisible(true);
      setHandle(setTimeout(() => setHotbarVisible(false), 3000));
    }
  });

  const getSlotLabel = (slot: number) => {
    if (slot === 1 || slot === 2) return 'WEAPON';
    if (slot >= 3 && slot <= 5) return 'HOTKEY';
    return 'SLOT';
  };

  const getSlotIcon = (slot: number): React.ReactNode | null => {
    if (slot === 1 || slot == 2) {
      return <Pistol />;
    }
    return null;
  };

  const getRarityClass = (item: SlotWithItem) => {
    const rarity = item.metadata?.rarity || item.rarity || Items[item.name]?.rarity;
    return rarity ? `rarity-${rarity}` : '';
  };

  return (
    <SlideUp in={hotbarVisible}>
      <div className="hotbar-container">
        {items.map((item) => (
          <div className="hotbar-slot-wrapper" key={`hotbar-${item.slot}`}>
            <div className="hotbar-slot-label-above">
              <span className="hotbar-keycap">{item.slot}</span>
              <span className="hotbar-slot-type">{getSlotLabel(item.slot)}</span>
            </div>
            <div
              className={`hotbar-item-slot ${isSlotWithItem(item) ? getRarityClass(item as SlotWithItem) : 'is-empty'}`}
              data-durability={isSlotWithItem(item) ? item.durability : undefined}
            >
              {isSlotWithItem(item) && (
                <div className="item-slot-wrapper">
                  <picture>
                    <source srcSet={getItemUrl(item as SlotWithItem, 'webp')} type="image/webp" />
                    <img
                      src={getItemUrl(item as SlotWithItem, 'png')}
                      alt={item.name}
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                  </picture>
                  <div className="hotbar-slot-header-wrapper">
                    <div className="inventory-slot-number">{item.slot}</div>
                    <div className="item-slot-info-wrapper">
                      <p>
                        {item.weight > 0
                          ? item.weight >= 1000
                            ? `${(item.weight / 1000).toLocaleString('en-us', {
                                minimumFractionDigits: 2,
                              })}kg `
                            : `${item.weight.toLocaleString('en-us', {
                                minimumFractionDigits: 0,
                              })}g `
                          : ''}
                      </p>
                      <p>{item.count ? item.count.toLocaleString('en-us') + `x` : ''}</p>
                    </div>
                  </div>
                  <div>
                    {item?.durability !== undefined && (
                      <WeightBar percent={item.durability} durability />
                    )}
                    <div className="inventory-slot-label-box">
                      <div className="inventory-slot-label-text">
                        {item.metadata?.label ? item.metadata.label : Items[item.name]?.label || item.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!isSlotWithItem(item) && getSlotIcon(item.slot) && (
                <div className="hotbar-empty-slot">
                  <div className="hotbar-slot-icon">{getSlotIcon(item.slot)}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </SlideUp>
  );
};

export default InventoryHotbar;
