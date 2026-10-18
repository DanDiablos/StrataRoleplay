import InventoryGrid from './InventoryGrid';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectRightInventory, selectRightInventoryCollapsed, toggleRightInventory } from '../../store/inventory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const RightInventory: React.FC = () => {
  const rightInventory = useAppSelector(selectRightInventory);
  const isCollapsed = useAppSelector(selectRightInventoryCollapsed);
  const dispatch = useAppDispatch();

  const collapseButton = (
    <button className="inventory-collapse-button" onClick={() => dispatch(toggleRightInventory())}>
      <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} size="lg" />
    </button>
  );

  return <InventoryGrid inventory={rightInventory} isCollapsed={isCollapsed} collapseButton={collapseButton} />;
};

export default RightInventory;
