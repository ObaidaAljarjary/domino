import React from 'react';
import type { GameBoard, Tile as TileType, PlayPosition } from '../types/domino';
import { TileComponent } from './Tile';

interface TableProps {
  board: GameBoard;
  selectedTile: TileType | null;
  validPositions: PlayPosition[];
  onPlayTile: (position: PlayPosition) => void;
  language: 'ar' | 'en';
}

export const TableComponent: React.FC<TableProps> = ({
  board,
  selectedTile,
  validPositions,
  onPlayTile,
  language,
}) => {
  const isArabic = language === 'ar';

  if (board.tiles.length === 0) {
    return (
      <div className="board-area">
        <div style={{ textAlign: 'center', opacity: 0.8 }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🀏</div>
          <h3 style={{ color: 'var(--gold-accent)', fontSize: '1.3rem' }}>
            {isArabic ? 'الطاولة جاهزة - افتح اللعبة!' : 'Table Ready - Start the Game!'}
          </h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '4px' }}>
            {isArabic
              ? 'اللاعب صاحب أعلى دبل (دوش) يلعب أولاً'
              : 'Player with highest double (6-6) opens the round'}
          </p>
        </div>
      </div>
    );
  }

  const showLeftTarget = selectedTile && validPositions.includes('left');
  const showRightTarget = selectedTile && validPositions.includes('right');

  return (
    <div className="board-area">
      <div className="snake-container">
        {/* Left End Placement Button */}
        {showLeftTarget && (
          <button className="drop-target-btn" onClick={() => onPlayTile('left')}>
            {isArabic ? 'اليمين' : 'Left'}
          </button>
        )}

        {/* Board Domino Snake Chain */}
        {board.tiles.map((played, idx) => (
          <TileComponent
            key={`${played.tile.id}-${idx}`}
            tile={played.tile}
            orientation={played.isDouble ? 'vertical' : 'horizontal'}
          />
        ))}

        {/* Right End Placement Button */}
        {showRightTarget && (
          <button className="drop-target-btn" onClick={() => onPlayTile('right')}>
            {isArabic ? 'اليسار' : 'Right'}
          </button>
        )}
      </div>
    </div>
  );
};
