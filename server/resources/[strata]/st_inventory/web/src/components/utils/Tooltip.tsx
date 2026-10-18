import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../store';
import SlotTooltip from '../inventory/SlotTooltip';

const Tooltip: React.FC = () => {
  const hoverData = useAppSelector((state) => state.tooltip);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      pendingRef.current = { x: event.clientX, y: event.clientY };

      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        if (pendingRef.current) {
          setMousePosition(pendingRef.current);
        }
        rafRef.current = null;
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (!hoverData.open || !hoverData.item || !hoverData.inventoryType) {
    return null;
  }

  const offset = 14;
  const viewportPadding = 8;
  const anchorX = mousePosition.x || hoverData.coords?.x || 0;
  const anchorY = mousePosition.y || hoverData.coords?.y || 0;
  const x = Math.min(anchorX + offset, window.innerWidth - viewportPadding);
  const y = Math.min(anchorY + offset, window.innerHeight - viewportPadding);

  return (
    <div
      className="inventory-tooltip-layer"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(0, 0)',
      }}
    >
      <SlotTooltip item={hoverData.item} inventoryType={hoverData.inventoryType} style={{}} />
    </div>
  );
};

export default Tooltip;
