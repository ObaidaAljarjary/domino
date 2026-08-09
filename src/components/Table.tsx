import React, { useState } from 'react';
import type { GameBoard, Tile as TileType, PlayPosition } from '../types/domino';
import { TileComponent } from './Tile';

interface TableProps {
  board: GameBoard;
  selectedTile: TileType | null;
  validPositions: PlayPosition[];
  onPlayTile: (position: PlayPosition, droppedTileId?: string) => void;
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
  const [isDragOverLeft, setIsDragOverLeft] = useState(false);
  const [isDragOverRight, setIsDragOverRight] = useState(false);
  const [isDragOverCenter, setIsDragOverCenter] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, position: PlayPosition) => {
    e.preventDefault();
    setIsDragOverLeft(false);
    setIsDragOverRight(false);
    setIsDragOverCenter(false);

    const tileId = e.dataTransfer.getData('text/plain');
    if (tileId) {
      onPlayTile(position, tileId);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  if (board.tiles.length === 0) {
    return (
      <div
        className={`board-area centered-table-board ${isDragOverCenter ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={() => setIsDragOverCenter(true)}
        onDragLeave={() => setIsDragOverCenter(false)}
        onDrop={(e) => handleDrop(e, 'first')}
      >
        {/* Traditional Iraqi Arabesque Ornament Background Frame */}
        <div className="iraqi-ornament-center-motif" />

        <div className="empty-board-box">
          <div className="ornament-star">🀏</div>
          <h3 className="empty-board-title">
            {isArabic ? 'الطاولة جاهزة - إسحب أو انقر لبدء اللعبة!' : 'Table Ready - Drag or Click to Start!'}
          </h3>
          <p className="empty-board-desc">
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
    <div className="board-area centered-table-board">
      {/* Background Ornaments */}
      <div className="iraqi-ornament-corner top-left" />
      <div className="iraqi-ornament-corner top-right" />
      <div className="iraqi-ornament-corner bottom-left" />
      <div className="iraqi-ornament-corner bottom-right" />

      <div className="snake-container centered-snake-wrapper">
        {/* Left Placement Target / Drop Zone */}
        <div
          className={`drop-zone-wrapper ${showLeftTarget ? 'visible' : ''} ${
            isDragOverLeft ? 'drag-over' : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setIsDragOverLeft(true)}
          onDragLeave={() => setIsDragOverLeft(false)}
          onDrop={(e) => handleDrop(e, 'left')}
          onClick={() => onPlayTile('left')}
        >
          <div className="drop-target-btn">
            {isArabic ? 'اليمين' : 'Left'}
          </div>
        </div>

        {/* Board Domino Snake Chain */}
        {board.tiles.map((played, idx) => (
          <TileComponent
            key={`${played.tile.id}-${idx}`}
            tile={played.tile}
            orientation={played.isDouble ? 'vertical' : 'horizontal'}
          />
        ))}

        {/* Right Placement Target / Drop Zone */}
        <div
          className={`drop-zone-wrapper ${showRightTarget ? 'visible' : ''} ${
            isDragOverRight ? 'drag-over' : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setIsDragOverRight(true)}
          onDragLeave={() => setIsDragOverRight(false)}
          onDrop={(e) => handleDrop(e, 'right')}
          onClick={() => onPlayTile('right')}
        >
          <div className="drop-target-btn">
            {isArabic ? 'اليسار' : 'Right'}
          </div>
        </div>
      </div>
    </div>
  );
};
