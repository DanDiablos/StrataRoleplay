import InventoryComponent from './components/inventory';
import useNuiEvent from './hooks/useNuiEvent';
import { Items } from './store/items';
import { Locale } from './store/locale';
import { setImagePath } from './store/imagepath';
import { setupInventory } from './store/inventory';
import { Inventory } from './typings';
import { useAppDispatch } from './store';
import { debugData } from './utils/debugData';
import DragPreview from './components/utils/DragPreview';
import { fetchNui } from './utils/fetchNui';
import { useDragDropManager } from 'react-dnd';
import KeyPress from './components/utils/KeyPress';
import { setUtilitySlotRestrictions } from './utils/utilitySlotValidation';

debugData([
  // Item notify start //
  {
    action: 'itemNotify',
    data: [{ slot: 1, name: 'water', weight: 3000, count: 5, metadata: {} }, 'ui_added', 5],
  },
  {
    action: 'itemNotify',
    data: [{ slot: 2, name: 'water', weight: 0, count: 1, metadata: { durability: 75 } }, 'ui_removed', 1],
  },
  {
    action: 'itemNotify',
    data: [
      { slot: 3, name: 'weapon_pistol', weight: 1000, count: 1, metadata: { durability: 100 } },
      'ui_holstered',
      1,
    ],
  },
  // Item notify end //

  // Toggle hotbar start //
  {
    action: 'toggleHotbar',
    data: {},
  },
  // Toggle hotbar end //

  // Setup inventory start //
  {
    action: 'setupInventory',
    data: {
      leftInventory: {
        id: 'test',
        type: 'player',
        slots: 50,
        label: 'Strata FW',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 1,
            name: 'weapon_pistolxm3',
            weight: 3000,
            metadata: {
              description: `Name: Svetozar Miletic  \n Gender: Male`,
              durability: 92,
            },
            count: 1,
          },
          {
            slot: 2,
            name: 'weapon_advancedrifle',
            weight: 0,
            count: 1,
            rarity: 2,
            metadata: { durability: 64 },
          },
          { slot: 3, name: 'Rum', weight: 100, count: 12, rarity: 3, metadata: { type: 'Special' } },
          {
            slot: 4,
            name: 'water',
            weight: 100,
            count: 5,
            rarity: 4,
          },
          {
            slot: 5,
            name: 'lockpick',
            weight: 100,
            count: 1,
            rarity: 5,
            metadata: { durability: 38 },
          },
          {
            slot: 6,
            name: 'military_backpack',
            weight: 100,
            count: 1,
            rarity: 6,
          },
          {
            slot: 7,
            name: 'Armor',
            weight: 100,
            count: 1,
            rarity: 7,
            metadata: { durability: 12 },
          },
          {
            slot: 8,
            name: 'Phone',
            weight: 100,
            count: 1,
            rarity: 7,
          },
          {
            slot: 9,
            name: 'parachute',
            weight: 100,
            count: 1,
            metadata: { durability: 0 },
          },
          {
            slot: 10,
            name: 'backwoods',
            weight: 100,
            count: 1,
            metadata: {
              label: 'Russian Cream',
              imageurl: 'https://i.imgur.com/2xHhTTz.webp',
              rarity: 6,
            },
          },
        ],
      },
      rightInventory: {
        id: 'shop',
        type: 'crafting',
        slots: 5000,
        label: 'Strata FW',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 1,
            name: 'lockpick',
            weight: 500,
            price: 300,
            ingredients: {
              ironbar: 5,
              recycledgoods: 10,
            },
            metadata: {
              description: 'Simple lockpick that breaks easily and can pick basic door locks',
            },
          },
        ],
      },
    },
  },
  // Setup inventory end //
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const manager = useDragDropManager();

  useNuiEvent<{
    locale: { [key: string]: string };
    items: typeof Items;
    leftInventory: Inventory;
    imagepath: string;
  }>('init', ({ locale, items, leftInventory, imagepath }) => {
    for (const name in locale) Locale[name] = locale[name];
    for (const name in items) Items[name] = items[name];

    setImagePath(imagepath);
    dispatch(setupInventory({ leftInventory }));

    fetchNui('uiLoaded', {}).catch((error) => {
      console.warn('Failed to call uiLoaded:', error);
    });

    fetchNui('fetchSlotRestrictions', {})
      .then((restrictions: any) => {
        if (restrictions && typeof restrictions === 'object') {
          setUtilitySlotRestrictions(restrictions);
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch slot restrictions:', error);
      });
  });

  useNuiEvent('closeInventory', () => {
    manager.dispatch({ type: 'dnd-core/END_DRAG' });
  });

  return (
    <div className="app-wrapper">
      <InventoryComponent />
      <DragPreview />
      <KeyPress />
    </div>
  );
};

addEventListener('dragstart', function (event) {
  event.preventDefault();
});

export default App;
