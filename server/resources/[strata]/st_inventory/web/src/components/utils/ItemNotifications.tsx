import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import { TransitionGroup } from 'react-transition-group';
import useNuiEvent from '../../hooks/useNuiEvent';
import useQueue from '../../hooks/useQueue';
import { Locale } from '../../store/locale';
import { getItemUrl } from '../../helpers';
import { SlotWithItem } from '../../typings';
import { Items } from '../../store/items';
import Fade from './transitions/Fade';

interface ItemNotificationProps {
  item: SlotWithItem;
  text: string;
}

export const ItemNotificationsContext = React.createContext<{
  add: (item: ItemNotificationProps) => void;
} | null>(null);

export const useItemNotifications = () => {
  const itemNotificationsContext = useContext(ItemNotificationsContext);
  if (!itemNotificationsContext) throw new Error(`ItemNotificationsContext undefined`);
  return itemNotificationsContext;
};

const ItemNotification = React.forwardRef(
  (props: { item: ItemNotificationProps; style?: React.CSSProperties }, ref: React.ForwardedRef<HTMLDivElement>) => {
    const slotItem = props.item.item;

    const getNotificationType = (text: string) => {
      if (text.toLowerCase().includes('added')) return 'added';
      if (text.toLowerCase().includes('removed')) return 'removed';
      return 'neutral';
    };

    const getRarityClass = () => {
      const rarity = slotItem.metadata?.rarity || slotItem.rarity || Items[slotItem.name]?.rarity;
      return rarity ? `rarity-${rarity}` : '';
    };

    return (
      <div
        className={`item-notification-item-box ${getRarityClass()}`}
        data-notification-type={getNotificationType(props.item.text)}
        data-durability={slotItem.durability}
        style={{
          backgroundImage: `url(${getItemUrl(slotItem) || 'none'}`,
          ...props.style,
        }}
        ref={ref}
      >
        <div className="item-slot-wrapper">
          <div className="item-notification-action-box">
            <p>{props.item.text}</p>
          </div>
          <div className="inventory-slot-label-box">
            <div className="inventory-slot-label-text">{slotItem.metadata?.label || Items[slotItem.name]?.label}</div>
          </div>
        </div>
      </div>
    );
  }
);

export const ItemNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const queue = useQueue<{
    id: number;
    item: ItemNotificationProps;
    ref: React.RefObject<HTMLDivElement>;
  }>();

  const add = (item: ItemNotificationProps) => {
    const ref = React.createRef<HTMLDivElement>();
    const notification = { id: Date.now(), item, ref: ref };

    queue.add(notification);

    const timeout = setTimeout(() => {
      queue.remove();
      clearTimeout(timeout);
    }, 2500);
  };

  useNuiEvent<[item: SlotWithItem, text: string, count?: number]>('itemNotify', ([item, text, count]) => {
    // Fallback text for notifications, so they can be tested / used in web dev
    const fallbackText: { [key: string]: string } = {
      ui_added: 'Added',
      ui_removed: 'Removed',
      ui_equipped: 'Equipped',
      ui_unequipped: 'Unequipped',
      ui_holstered: 'Holstered',
      ui_used: 'Used',
      ui_broken: 'Broken',
      added: 'Added',
      removed: 'Removed',
      equipped: 'Equipped',
      unequipped: 'Unequipped',
      holstered: 'Holstered',
      used: 'Used',
      broken: 'Broken',
    };

    const displayText = Locale[text] || fallbackText[text] || text;
    add({ item: item, text: count ? `${displayText} ${count}x` : `${displayText}` });
  });

  return (
    <ItemNotificationsContext.Provider value={{ add }}>
      {children}
      {createPortal(
        <TransitionGroup className="item-notification-container">
          {queue.values.map((notification, index) => (
            <Fade key={`item-notification-${index}`}>
              <ItemNotification item={notification.item} ref={notification.ref} />
            </Fade>
          ))}
        </TransitionGroup>,
        document.body
      )}
    </ItemNotificationsContext.Provider>
  );
};
