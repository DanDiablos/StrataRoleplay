import React, { useEffect, useRef, useState } from 'react';
import { createStyles } from '@mantine/core';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { useNuiEvent } from '../../hooks/useNuiEvent';

interface DoorMarker {
  id: number;
  x: number;
  y: number;
  state: number; // 0 = unlocked, 1 = locked
  distance: number;
  maxDistance: number;
}

interface RenderMarker extends DoorMarker {
  leaving: boolean;
}

const FADE_MS = 280;

const useStyles = createStyles(() => ({
  layer: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 5,
  },
  marker: {
    position: 'absolute',
    width: 0,
    height: 0,
    fontFamily: "'Fira Mono', 'Courier New', monospace",
    transition: `opacity ${FADE_MS}ms ease-out`,
    willChange: 'opacity',
  },
  inner: {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    transition: `transform ${FADE_MS}ms ease-out`,
    willChange: 'transform',
  },
  boxWrap: {
    position: 'relative',
    width: 46,
    height: 46,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(8,8,8,0.85)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
  },
  innerBorder: {
    position: 'absolute',
    inset: 3,
    border: '1px solid rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  bracket: {
    position: 'absolute',
    width: 9,
    height: 9,
    pointerEvents: 'none',
  },
  iconWrap: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.95))',
  },
  label: {
    fontSize: 9,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    textShadow: '0 1px 2px rgba(0,0,0,1)',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  },
  labelState: {
    fontWeight: 600,
  },
}));

const COLORS = {
  locked: '#FF3A3A',
  unlocked: '#52E45A',
};

const DoorOverlay: React.FC = () => {
  const { classes } = useStyles();
  const [markers, setMarkers] = useState<Record<number, RenderMarker>>({});
  const removalTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useNuiEvent<DoorMarker[]>('setDoorMarkers', (data) => {
    const incoming = Array.isArray(data) ? data : [];

    setMarkers((prev) => {
      const next: Record<number, RenderMarker> = {};
      const seen = new Set<number>();

      // Update / add incoming markers; clear any pending removal
      for (const m of incoming) {
        seen.add(m.id);
        next[m.id] = { ...m, leaving: false };
        const t = removalTimers.current[m.id];
        if (t !== undefined) {
          clearTimeout(t);
          delete removalTimers.current[m.id];
        }
      }

      // Markers that vanished — keep mounted briefly so they fade out
      for (const idStr of Object.keys(prev)) {
        const id = Number(idStr);
        if (seen.has(id)) continue;
        if (prev[id].leaving) {
          next[id] = prev[id];
          continue;
        }
        next[id] = { ...prev[id], leaving: true };
        if (removalTimers.current[id] === undefined) {
          removalTimers.current[id] = setTimeout(() => {
            delete removalTimers.current[id];
            setMarkers((cur) => {
              const { [id]: _gone, ...rest } = cur;
              return rest;
            });
          }, FADE_MS + 30);
        }
      }

      return next;
    });
  });

  useEffect(
    () => () => {
      Object.values(removalTimers.current).forEach(clearTimeout);
      removalTimers.current = {};
    },
    []
  );

  const list = Object.values(markers);
  if (list.length === 0) return null;

  return (
    <div className={classes.layer}>
      {list.map((m) => {
        const locked = m.state === 1;
        const color = locked ? COLORS.locked : COLORS.unlocked;
        const t = Math.max(0, Math.min(1, 1 - m.distance / m.maxDistance));
        const scale = 0.6 + t * 0.5; // 0.6 → 1.10
        const opacity = m.leaving ? 0 : 0.4 + t * 0.6;

        return (
          <div
            key={m.id}
            className={classes.marker}
            style={{
              left: `${m.x * 100}%`,
              top: `${m.y * 100}%`,
              opacity,
            }}
          >
            <div className={classes.inner} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
              <div className={classes.boxWrap}>
                {/* Main square plate */}
                <div
                  className={classes.plate}
                  style={{ border: `1px solid ${color}99` }}
                />
                {/* Top accent bar */}
                <div
                  className={classes.topAccent}
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
                  }}
                />
                {/* Faint inner border */}
                <div className={classes.innerBorder} />
                {/* Corner brackets (top-left, top-right, bottom-left, bottom-right) */}
                <div
                  className={classes.bracket}
                  style={{
                    top: -2,
                    left: -2,
                    borderTop: `2px solid ${color}`,
                    borderLeft: `2px solid ${color}`,
                  }}
                />
                <div
                  className={classes.bracket}
                  style={{
                    top: -2,
                    right: -2,
                    borderTop: `2px solid ${color}`,
                    borderRight: `2px solid ${color}`,
                  }}
                />
                <div
                  className={classes.bracket}
                  style={{
                    bottom: -2,
                    left: -2,
                    borderBottom: `2px solid ${color}`,
                    borderLeft: `2px solid ${color}`,
                  }}
                />
                <div
                  className={classes.bracket}
                  style={{
                    bottom: -2,
                    right: -2,
                    borderBottom: `2px solid ${color}`,
                    borderRight: `2px solid ${color}`,
                  }}
                />
                {/* Lock icon */}
                <div className={classes.iconWrap} style={{ color }}>
                  {locked ? (
                    <FiLock size={18} strokeWidth={2.6} />
                  ) : (
                    <FiUnlock size={18} strokeWidth={2.6} />
                  )}
                </div>
              </div>
              <div className={classes.label}>
                <span className={classes.labelState} style={{ color }}>
                  {locked ? 'Locked' : 'Unlocked'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}> · {m.distance.toFixed(1)}m</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DoorOverlay;
