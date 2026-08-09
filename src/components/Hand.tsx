import React from 'react';
import type { Player, Tile as TileType } from '../types/domino';
import { TileComponent } from './Tile';
import { RefreshCw, ArrowDownRight, SkipForward } from 'lucide-react';

interface HandProps {
  player: Player;
  isCurrentTurn: boolean;
  selectedTile: TileType | null;
  playableTiles: TileType[];
  onSelectTile: (tile: TileType) => void;
  onDrawTile: () => void;
  onPassTurn: () => void;
  onSortHand: () => void;
  canDraw: boolean;
  canPass: boolean;
  boneyardCount: number;
  language: 'ar' | 'en';
}

export const HandComponent: React.FC<HandProps> = ({
  player,
  isCurrentTurn,
  selectedTile,
  playableTiles,
  onSelectTile,
  onDrawTile,
  onPassTurn,
  onSortHand,
  canDraw,
  canPass,
  boneyardCount,
  language,
}) => {
  const isArabic = language === 'ar';

  return (
    <div className="bottom-hand-bar">
      <div className="player-info-tag">
        <span>{player.avatar}</span>
        <span>{isArabic ? player.nameAr : player.name}</span>

        {isCurrentTurn && (
          <span className="turn-indicator-badge">
            {isArabic ? '⚡ دورك الآن!' : '⚡ Your Turn!'}
          </span>
        )}

        {boneyardCount > 0 && (
          <span style={{ fontSize: '0.85rem', color: 'var(--gold-accent)', marginLeft: '12px' }}>
            {isArabic ? `السحبة: ${boneyardCount}` : `Boneyard: ${boneyardCount}`}
          </span>
        )}
      </div>

      {/* Tiles in hand */}
      <div className="hand-tiles-wrapper">
        {player.hand.map((tile) => {
          const isPlayable = isCurrentTurn && playableTiles.some((t) => t.id === tile.id);
          const isSelected = selectedTile?.id === tile.id;

          return (
            <TileComponent
              key={tile.id}
              tile={tile}
              isPlayable={isPlayable}
              onClick={() => {
                if (isCurrentTurn && isPlayable) {
                  onSelectTile(tile);
                }
              }}
              className={isSelected ? 'selected-hand-tile' : ''}
            />
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="action-buttons-group">
        <button className="game-btn" onClick={onSortHand}>
          <RefreshCw size={16} />
          {isArabic ? 'ترتيب' : 'Sort'}
        </button>

        {canDraw && (
          <button className="game-btn" onClick={onDrawTile} disabled={!isCurrentTurn}>
            <ArrowDownRight size={16} />
            {isArabic ? `سحب قطعه (${boneyardCount})` : `Draw Tile (${boneyardCount})`}
          </button>
        )}

        {canPass && (
          <button className="game-btn" onClick={onPassTurn} disabled={!isCurrentTurn}>
            <SkipForward size={16} />
            {isArabic ? 'باص / مرور' : 'Pass Turn'}
          </button>
        )}
      </div>
    </div>
  );
};
