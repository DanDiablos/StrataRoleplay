import { onUse } from '../../dnd/onUse';
import { onGive } from '../../dnd/onGive';
import { onDrop } from '../../dnd/onDrop';
import { Items } from '../../store/items';
import { fetchNui } from '../../utils/fetchNui';
import { Locale } from '../../store/locale';
import { isSlotWithItem, findAvailableSlot } from '../../helpers';
import { setClipboard } from '../../utils/setClipboard';
import { useAppSelector } from '../../store';
import React from 'react';
import { Menu, MenuItem } from '../utils/menu/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faHammer, faHandHolding, faTrash, faHandPointUp } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface DataProps {
  action: string;
  component?: string;
  slot?: number;
  serial?: string;
  id?: number;
}

interface Button {
  label: string;
  index: number;
  group?: string;
  icon?: IconProp;
}

interface Group {
  groupName: string | null;
  buttons: ButtonWithIndex[];
}

interface ButtonWithIndex extends Button {
  index: number;
}

interface GroupedButtons extends Array<Group> {}

const InventoryContext: React.FC = () => {
  const contextMenu = useAppSelector((state) => state.contextMenu);
  const item = contextMenu.item;
  const leftInventory = useAppSelector((state) => state.inventory.leftInventory);

  const canDropItem = () => {
    if (!item || !isSlotWithItem(item)) return false;

    const itemData = Items[item.name];
    if (!itemData) return false;

    try {
      const availableSlot = findAvailableSlot(item, itemData, leftInventory.items, 'player');
      return availableSlot !== undefined;
    } catch (error) {
      console.log('Error checking available slots:', error);
      return false;
    }
  };

  const handleClick = (data: DataProps) => {
    if (!item) return;

    switch (data && data.action) {
      case 'use':
        onUse({ name: item.name, slot: item.slot });
        break;
      case 'give':
        onGive({ name: item.name, slot: item.slot });
        break;
      case 'drop':
        if (isSlotWithItem(item) && canDropItem()) {
          onDrop({ item: item, inventory: 'player' });
        }
        break;
      case 'remove':
        fetchNui('removeComponent', { component: data?.component, slot: data?.slot });
        break;
      case 'removeAmmo':
        fetchNui('removeAmmo', item.slot);
        break;
      case 'copy':
        setClipboard(data.serial || '');
        break;
      case 'custom':
        fetchNui('useButton', { id: (data?.id || 0) + 1, slot: item.slot });
        break;
    }
  };

  const groupButtons = (buttons: any): GroupedButtons => {
    return buttons.reduce((groups: Group[], button: Button, index: number) => {
      if (button.group) {
        const groupIndex = groups.findIndex((group) => group.groupName === button.group);
        if (groupIndex !== -1) {
          groups[groupIndex].buttons.push({ ...button, index });
        } else {
          groups.push({
            groupName: button.group,
            buttons: [{ ...button, index }],
          });
        }
      } else {
        groups.push({
          groupName: null,
          buttons: [{ ...button, index }],
        });
      }
      return groups;
    }, []);
  };

  return (
    <>
      <Menu>
        <MenuItem
          onClick={() => handleClick({ action: 'use' })}
          label={item?.name === 'phone' ? 'Open SIM Slot' : (Locale.ui_use || 'Use')}
          icon={<FontAwesomeIcon icon={faHandPointUp} />}
        />
        <MenuItem
          onClick={() => handleClick({ action: 'give' })}
          label={Locale.ui_give || 'Give'}
          icon={<FontAwesomeIcon icon={faHandHolding} />}
        />
        <MenuItem
          onClick={() => handleClick({ action: 'drop' })}
          label={Locale.ui_drop || 'Drop'}
          icon={<FontAwesomeIcon icon={faTrash} />}
          disabled={!canDropItem()}
        />
        {item && item.metadata?.ammo > 0 && (
          <MenuItem
            onClick={() => handleClick({ action: 'removeAmmo' })}
            label={Locale.ui_remove_ammo}
            icon={<FontAwesomeIcon icon={faTrash} />}
          />
        )}
        {item && item.metadata?.serial && (
          <MenuItem
            onClick={() => handleClick({ action: 'copy', serial: item.metadata?.serial })}
            label={Locale.ui_copy}
            icon={<FontAwesomeIcon icon={faCopy} />}
          />
        )}
        {item && item.metadata?.components && item.metadata?.components.length > 0 && (
          <Menu label={Locale.ui_removeattachments}>
            {item &&
              item.metadata?.components.map((component: string, index: number) => (
                <MenuItem
                  key={index}
                  onClick={() => handleClick({ action: 'remove', component, slot: item.slot })}
                  label={Items[component]?.label || ''}
                  icon={<FontAwesomeIcon icon={faHammer} />}
                />
              ))}
          </Menu>
        )}
        {((item && item.name && Items[item.name]?.buttons?.length) || 0) > 0 && (
          <>
            {item &&
              item.name &&
              groupButtons(Items[item.name]?.buttons).map((group: Group, index: number) => (
                <React.Fragment key={index}>
                  {group.groupName ? (
                    <Menu label={group.groupName}>
                      {group.buttons.map((button: Button) => (
                        <MenuItem
                          key={button.index}
                          onClick={() => handleClick({ action: 'custom', id: button.index })}
                          label={button.label}
                          icon={<FontAwesomeIcon icon={button.icon as IconProp} />}
                        />
                      ))}
                    </Menu>
                  ) : (
                    group.buttons.map((button: Button) => (
                      <MenuItem
                        key={button.index}
                        onClick={() => handleClick({ action: 'custom', id: button.index })}
                        label={button.label}
                        icon={<FontAwesomeIcon icon={button.icon as IconProp} />}
                      />
                    ))
                  )}
                </React.Fragment>
              ))}
          </>
        )}
      </Menu>
    </>
  );
};

export default InventoryContext;
