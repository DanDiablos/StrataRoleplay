import { useEffect } from 'react';
import { setShiftPressed, toggleView, setView } from '../../store/inventory';
import { closeTooltip } from '../../store/tooltip';
import useKeyPress from '../../hooks/useKeyPress';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectCurrentView } from '../../store/inventory';

const KeyPress: React.FC = () => {
  const dispatch = useAppDispatch();
  const shiftPressed = useKeyPress('Shift');
  const currentView = useAppSelector(selectCurrentView);
  const tooltipState = useAppSelector((state) => state.tooltip);

  useEffect(() => {
    dispatch(setShiftPressed(shiftPressed));
  }, [shiftPressed, dispatch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'q' || event.key === 'Q') {
        event.preventDefault();
        if (currentView === 'utility' && tooltipState.open && tooltipState.inventoryType === 'utility') {
          dispatch(closeTooltip());
        }
        dispatch(setView('normal'));
      } else if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        if (
          currentView === 'normal' &&
          tooltipState.open &&
          tooltipState.inventoryType !== 'player' &&
          tooltipState.inventoryType !== 'utility'
        ) {
          dispatch(closeTooltip());
        }
        dispatch(setView('utility'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, currentView, tooltipState]);

  return <></>;
};

export default KeyPress;
