import React, { useCallback, useRef } from 'react';
import { DragSource, Inventory, InventoryType, Slot, SlotWithItem } from '../../typings';
import { useDrag, useDragDropManager, useDrop } from 'react-dnd';
import { useAppDispatch } from '../../store';
import WeightBar from '../utils/WeightBar';
import { onDrop } from '../../dnd/onDrop';
import { onBuy } from '../../dnd/onBuy';
import { Items } from '../../store/items';
import { canCraftItem, canPurchaseItem, getItemUrl, isSlotWithItem } from '../../helpers';
import { onUse } from '../../dnd/onUse';
import { Locale } from '../../store/locale';
import { onCraft } from '../../dnd/onCraft';
import useNuiEvent from '../../hooks/useNuiEvent';
import { ItemsPayload } from '../../reducers/refreshSlots';
import { closeTooltip, openTooltip } from '../../store/tooltip';
import { openContextMenu } from '../../store/contextMenu';
import { useMergeRefs } from '@floating-ui/react';

interface SlotProps {
  inventoryId: Inventory['id'];
  inventoryType: Inventory['type'];
  inventoryGroups: Inventory['groups'];
  item: Slot;
}




const InventorySlot: React.ForwardRefRenderFunction<HTMLDivElement, SlotProps> = (
  { item, inventoryId, inventoryType, inventoryGroups },
  ref
) => {
  const manager = useDragDropManager();
  const dispatch = useAppDispatch();
  const timerRef = useRef<number | null>(null);

  const canDrag = useCallback(() => {
    return canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) && canCraftItem(item, inventoryType);
  }, [item, inventoryType, inventoryGroups]);

  const [{ isDragging }, drag] = useDrag<DragSource, void, { isDragging: boolean }>(
    () => ({
      type: 'SLOT',
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: () =>
        isSlotWithItem(item, inventoryType !== InventoryType.SHOP)
          ? {
              inventory: inventoryType,
              item: {
                name: item.name,
                slot: item.slot,
              },
              image: item?.name && `url(${getItemUrl(item) || 'none'}`,
            }
          : null,
      canDrag,
    }),
    [inventoryType, item]
  );

  const [{ isOver }, drop] = useDrop<DragSource, void, { isOver: boolean }>(
    () => ({
      accept: 'SLOT',
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      drop: (source) => {
        switch (source.inventory) {
          case InventoryType.SHOP:
            onBuy(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
          case InventoryType.CRAFTING:
            onCraft(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
          default:
            onDrop(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
        }
      },
      canDrop: (source) =>
        (source.item.slot !== item.slot || source.inventory !== inventoryType) &&
        inventoryType !== InventoryType.SHOP &&
        inventoryType !== InventoryType.CRAFTING,
    }),
    [inventoryType, item]
  );

  useNuiEvent('refreshSlots', (data: { items?: ItemsPayload | ItemsPayload[] }) => {
    if (!isDragging && !data.items) return;
    if (!Array.isArray(data.items)) return;

    const itemSlot = data.items.find(
      (dataItem) => dataItem.item.slot === item.slot && dataItem.inventory === inventoryId
    );

    if (!itemSlot) return;

    manager.dispatch({ type: 'dnd-core/END_DRAG' });
  });

  const connectRef = (element: HTMLDivElement) => drag(drop(element));

  const handleContext = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if ((inventoryType !== 'player' && inventoryType !== 'utility') || !isSlotWithItem(item)) return;

    dispatch(openContextMenu({ item, coords: { x: event.clientX, y: event.clientY } }));
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    dispatch(closeTooltip());
    if (timerRef.current) clearTimeout(timerRef.current);
    if (event.shiftKey && isSlotWithItem(item) && inventoryType !== 'shop' && inventoryType !== 'crafting') {
      onDrop({ item: item, inventory: inventoryType });
    } else if (event.altKey && isSlotWithItem(item) && (inventoryType === 'player' || inventoryType === 'utility')) {
      onUse(item);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1 && isSlotWithItem(item) && (inventoryType === 'player' || inventoryType === 'utility')) {
      event.preventDefault();
      onUse(item);
    }
  };

  const refs = useMergeRefs([connectRef, ref]);

  const getRarityClass = () => {
    if (!isSlotWithItem(item)) return '';
    const rarity = item.metadata?.rarity || item.rarity || Items[item.name]?.rarity;
    return rarity ? `rarity-${rarity}` : '';
  };

  return (
    <div
      ref={refs}
      onContextMenu={handleContext}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className={`inventory-slot ${getRarityClass()}`}
      data-durability={isSlotWithItem(item) ? item.durability : undefined}
      style={{
        filter:
          !canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) || !canCraftItem(item, inventoryType)
            ? 'brightness(80%) grayscale(100%)'
            : undefined,
        opacity: isDragging ? 0.4 : 1.0,
        backgroundImage: item?.name
          ? `image-set(url(${getItemUrl(item as SlotWithItem, 'webp')}) type('image/webp'), url(${getItemUrl(item as SlotWithItem, 'png')}) type('image/png'))`
          : 'none',
        border: isOver ? '2px dashed rgba(255,255,255,0.4)' : '',
      }}
    >
      {isSlotWithItem(item) && (
        <div
          className="item-slot-wrapper"
          onMouseEnter={(event) => {
            timerRef.current = window.setTimeout(() => {
              dispatch(openTooltip({ item, inventoryType, coords: { x: event.clientX, y: event.clientY } }));
            }, 200) as unknown as number;
          }}
          onMouseLeave={() => {
            dispatch(closeTooltip());
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }}
        >
          {/* Item image/icon */}
          <picture>
            <source srcSet={item ? getItemUrl(item as SlotWithItem, 'webp') : 'none'} type="image/webp" />
            <img
              src={item ? getItemUrl(item as SlotWithItem, 'png') : 'none'}
              alt="item-image"
              style={{
                imageRendering: '-webkit-optimize-contrast',
              }}
            />
          </picture>
          <div
            className={
              inventoryType === 'player' && item.slot <= 5 ? 'item-hotslot-header-wrapper' : 'item-slot-header-wrapper'
            }
            style={{ zIndex: 2 }}
          >
            {inventoryType === 'player' && item.slot <= 5 && <div className="inventory-slot-number">{item.slot}</div>}
          </div>
          <div className="item-slot-info-wrapper">
            <p>
              {item.weight
                ? item.weight >= 1000
                  ? `${(item.weight / 1000).toLocaleString('en-us', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}kg `
                  : `${item.weight.toLocaleString('en-us', {
                      minimumFractionDigits: 0,
                    })}g `
                : '0g'}
            </p>
            <p>{item.count ? item.count.toLocaleString('en-us') + `x` : ''}</p>
          </div>
          <div>
            {inventoryType !== 'shop' && item?.durability !== undefined && (
              <WeightBar percent={item.durability} durability />
            )}
            {inventoryType === 'shop' && item?.price !== undefined && (
              <>
                {item?.currency !== 'money' && item.currency !== 'black_money' && item.price > 0 && item.currency ? (
                  <div className="item-slot-currency-wrapper">
                    <img
                      src={item.currency ? getItemUrl(item.currency) : 'none'}
                      alt="item-image"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        height: 'auto',
                        width: '2vh',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                      }}
                    />
                    <p>{item.price.toLocaleString('en-us')}</p>
                  </div>
                ) : (
                  <>
                    {item.price > 0 && (
                      <div
                        className="item-slot-price-wrapper"
                        style={{ color: item.currency === 'money' || !item.currency ? '#2ECC71' : '#E74C3C' }}
                      >
                        <p>
                          {Locale.$ || '$'}
                          {item.price.toLocaleString('en-us')}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            <div className="inventory-slot-label-box">
              <div className="inventory-slot-label-text">
                {item.metadata?.label ? item.metadata.label : Items[item.name]?.label || item.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(React.forwardRef(InventorySlot));
