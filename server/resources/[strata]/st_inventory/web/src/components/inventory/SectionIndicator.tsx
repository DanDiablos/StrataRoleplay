import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectCurrentView, selectRightInventory, setView } from '../../store/inventory';
import { closeTooltip } from '../../store/tooltip';

const SectionIndicator: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(selectCurrentView);
  const rightInventory = useAppSelector(selectRightInventory);
  const tooltipState = useAppSelector((state) => state.tooltip);

  const handleViewSwitch = (view: 'normal' | 'utility') => {
    if (tooltipState.open) {
      dispatch(closeTooltip());
    }
    dispatch(setView(view));
  };

  const getRightInventoryName = () => {
    if (rightInventory.type === 'crafting') {
      return currentView === 'normal' ? 'Crafting' : 'Utility';
    }
    if (rightInventory.type === 'newdrop') {
      return rightInventory.label ? `New Drop — ${rightInventory.label}` : 'New Drop';
    }
    return rightInventory.label || rightInventory.type || 'Trunk';
  };

  return (
    <div className="section-indicator-content">
      <div
        className={`section-option ${currentView === 'normal' ? 'active' : ''}`}
        onClick={() => handleViewSwitch('normal')}
      >
        <span className="section-key">Q</span>
        <span className="section-name">
          {rightInventory.type === 'crafting' ? 'Crafting' : getRightInventoryName()}
        </span>
      </div>
      <div
        className={`section-option ${currentView === 'utility' ? 'active' : ''}`}
        onClick={() => handleViewSwitch('utility')}
      >
        <span className="section-name">Utility</span>
        <span className="section-key">E</span>
      </div>
    </div>
  );
};

export default SectionIndicator;
