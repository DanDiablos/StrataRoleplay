import React from 'react';

const durabilityColor = (pct: number): string => {
  if (pct <= 0) return '#a13434';
  if (pct < 25) return '#a13434';
  if (pct < 60) return '#f09348';
  return '#52984a';
};

const WeightBar: React.FC<{ percent: number; durability?: boolean }> = ({ percent, durability }) => {
  if (durability) {
    const pct = Math.max(0, Math.min(100, percent));
    const color = durabilityColor(pct);

    return (
      <div className="durability-bar">
        <div
          className="durability-bar-fill"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    );
  }

  return (
    <div className="weight-bar">
      <div
        className="weight-bar-fill"
        style={{
          visibility: percent > 0 ? 'visible' : 'hidden',
          width: `${percent}%`,
        }}
      />
    </div>
  );
};
export default WeightBar;
