import React from 'react';
import type { Tile as TileType } from '../types/domino';

interface TileProps {
  tile: TileType;
  displayTopVal?: number;
  displayBottomVal?: number;
  orientation?: 'vertical' | 'horizontal';
  isPlayable?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  className?: string;
  faceDown?: boolean;
}

export const TileComponent: React.FC<TileProps> = ({
  tile,
  displayTopVal,
  displayBottomVal,
  orientation = 'vertical',
  isPlayable = false,
  onClick,
  onDragStart,
  disabled = false,
  className = '',
  faceDown = false,
}) => {
  const isHorizontal = orientation === 'horizontal';

  const topVal = displayTopVal !== undefined ? displayTopVal : tile.top;
  const bottomVal = displayBottomVal !== undefined ? displayBottomVal : tile.bottom;

  // Helper to render pips for a half (0 to 6)
  const renderPips = (val: number) => {
    if (val === 0) return null;

    const pips: string[] = [];
    if (val === 1) {
      pips.push('pip-center');
    } else if (val === 2) {
      pips.push('pip-top-left', 'pip-bottom-right');
    } else if (val === 3) {
      pips.push('pip-top-left', 'pip-center', 'pip-bottom-right');
    } else if (val === 4) {
      pips.push('pip-top-left', 'pip-top-right', 'pip-bottom-left', 'pip-bottom-right');
    } else if (val === 5) {
      pips.push('pip-top-left', 'pip-top-right', 'pip-center', 'pip-bottom-left', 'pip-bottom-right');
    } else if (val === 6) {
      pips.push(
        'pip-top-left',
        'pip-top-right',
        'pip-mid-left',
        'pip-mid-right',
        'pip-bottom-left',
        'pip-bottom-right'
      );
    } else if (val === 7) {
      pips.push(
        'pip-top-left',
        'pip-top-right',
        'pip-mid-left',
        'pip-mid-right',
        'pip-bottom-left',
        'pip-bottom-right',
        'pip-center'
      );
    }

    return pips.map((pipClass, idx) => (
      <div key={idx} className={`pip ${pipClass}`} />
    ));
  };

  if (faceDown) {
    return (
      <div className={`domino-tile ${isHorizontal ? 'horizontal' : ''} face-down ${className}`}>
        <div style={{ flex: 1, background: 'repeating-linear-gradient(45deg, #2b1810, #2b1810 5px, #4e291b 5px, #4e291b 10px)', borderRadius: 4 }} />
      </div>
    );
  }

  return (
    <div
      className={`domino-tile ${isHorizontal ? 'horizontal' : ''} ${
        isPlayable ? 'playable draggable' : ''
      } ${disabled ? 'disabled' : ''} ${className}`}
      draggable={isPlayable}
      onDragStart={(e) => {
        if (isPlayable && onDragStart) {
          e.dataTransfer.setData('text/plain', tile.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(e);
        }
      }}
      onClick={() => {
        if (!disabled && onClick) onClick();
      }}
    >
      <div className="tile-half">{renderPips(topVal)}</div>

      <div className={isHorizontal ? 'tile-divider-horizontal' : 'tile-divider-vertical'}>
        <div className="brass-pin" />
      </div>

      <div className="tile-half">{renderPips(bottomVal)}</div>
    </div>
  );
};
