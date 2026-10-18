import React, { useState, useEffect } from 'react';
import InventorySlot from './InventorySlot';
import { useAppSelector } from '../../store';
import { selectLeftInventory } from '../../store/inventory';
import { Grid, Person, Backpack, Phone, Parachute, BodyArmor, Pistol } from '../utils/icons/IconDefinitions';
import { fetchNui } from '../../utils/fetchNui';
import { isEnvBrowser } from '../../utils/misc';

const UtilityInventory: React.FC = () => {
  const leftInventory = useAppSelector(selectLeftInventory);
  const [phoneKey, setPhoneKey] = useState<string>('M');

  useEffect(() => {
    const fetchPhoneKey = async () => {
      if (isEnvBrowser()) {
        setPhoneKey('M');
        return;
      }

      try {
        const key = await fetchNui<string>('getPhoneKey');
        setPhoneKey(key);
      } catch (error) {
        console.error('Failed to fetch phone key:', error);
        setPhoneKey('M');
      }
    };

    fetchPhoneKey();
  }, []);

  return (
    <div className="utility-inventory-wrapper">
      <div className="utility-inventory-container">
        <div className="utility-person-container">
          <div className="utility-grid-background">
            <div className="utility-grid-svg">
              <Grid />
            </div>
          </div>

          <div className="utility-person-svg">
            <Person />
          </div>
        </div>

        <div className="utility-slots-container">
          <div className="utility-slots-left">
            {[6, 7, 8].map((slotNumber, index) => {
              const item = leftInventory.items.find((item) => item.slot === slotNumber);
              const labels = ['BACKPACK', 'BODY ARMOR', 'PHONE'];
              const icons = [<Backpack />, <BodyArmor />, <Phone />];
              return (
                <div key={`utility-left-${slotNumber}`} className="utility-slot-with-label">
                  <div className="utility-slot-label">{labels[index]}</div>
                  <div className="utility-slot-wrapper">
                    {slotNumber === 8 && <div className="inventory-slot-number">{phoneKey}</div>}
                    {item ? (
                      <InventorySlot
                        item={item}
                        inventoryType="utility"
                        inventoryGroups={leftInventory.groups}
                        inventoryId={leftInventory.id}
                      />
                    ) : (
                      <div className="utility-empty-slot"></div>
                    )}
                    {(!item || !item.name) && <div className="utility-slot-icon">{icons[index]}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="utility-slots-right">
            {[9].map((slotNumber, index) => {
              const item = leftInventory.items.find((item) => item.slot === slotNumber);
              return (
                <div key={`utility-right-parachute-${slotNumber}`} className="utility-slot-with-label">
                  <div className="utility-slot-label">PARACHUTE</div>
                  <div className="utility-slot-wrapper">
                    {item ? (
                      <InventorySlot
                        item={item}
                        inventoryType="utility"
                        inventoryGroups={leftInventory.groups}
                        inventoryId={leftInventory.id}
                      />
                    ) : (
                      <div className="utility-empty-slot"></div>
                    )}
                    {(!item || !item.name) && (
                      <div className="utility-slot-icon">
                        <Parachute />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {[1, 2].map((slotNumber, index) => {
              const item = leftInventory.items.find((item) => item.slot === slotNumber);
              const labels = ['WEAPON SLOT 1', 'WEAPON SLOT 2'];
              const icons = [<Pistol />, <Pistol />];
              return (
                <div key={`utility-right-${slotNumber}`} className="utility-slot-with-label">
                  <div className="utility-slot-label">{labels[index]}</div>
                  <div className="utility-slot-wrapper">
                    <div className="inventory-slot-number">{slotNumber}</div>
                    {item ? (
                      <InventorySlot
                        item={item}
                        inventoryType="utility"
                        inventoryGroups={leftInventory.groups}
                        inventoryId={leftInventory.id}
                      />
                    ) : (
                      <div className="utility-empty-slot"></div>
                    )}
                    {(!item || !item.name) && <div className="utility-slot-icon">{icons[index]}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="utility-hotbar-container">
          <div className="utility-hotbar-slots">
            {[3, 4, 5].map((slotNumber, index) => {
              const item = leftInventory.items.find((item) => item.slot === slotNumber);
              const labels = ['HOTKEY SLOT 3', 'HOTKEY SLOT 4', 'HOTKEY SLOT 5'];
              return (
                <div key={`utility-hotkey-${slotNumber}`} className="utility-slot-with-label">
                  <div className="utility-slot-label">{labels[index]}</div>
                  <div className="utility-slot-wrapper">
                    <div className="inventory-slot-number">{slotNumber}</div>
                    {item ? (
                      <InventorySlot
                        item={item}
                        inventoryType="utility"
                        inventoryGroups={leftInventory.groups}
                        inventoryId={leftInventory.id}
                      />
                    ) : (
                      <div className="utility-empty-slot"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilityInventory;
