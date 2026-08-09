import React from 'react';
import type { Player, Language } from '../types/domino';

interface TableLayoutProps {
  players: Player[];
  myPlayerId: string;
  currentTurnIndex: number;
  language: Language;
  children: React.ReactNode;
}

const faceDownTileStyle: React.CSSProperties = {
  width: '24px',
  height: '40px',
  background: 'repeating-linear-gradient(45deg, #2b1810, #2b1810 3px, #4e291b 3px, #4e291b 6px)',
  border: '1px solid #6d3925',
  borderRadius: '3px',
};

const faceDownTileVerticalStyle: React.CSSProperties = {
  width: '40px',
  height: '24px',
  background: 'repeating-linear-gradient(45deg, #2b1810, #2b1810 3px, #4e291b 3px, #4e291b 6px)',
  border: '1px solid #6d3925',
  borderRadius: '3px',
};

const badgeStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '0.8rem',
  marginTop: '4px',
  fontWeight: 'bold',
};

const passBadgeStyle: React.CSSProperties = {
  backgroundColor: '#e74c3c',
  color: 'white',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  marginTop: '4px',
};

export const TableLayout: React.FC<TableLayoutProps> = ({
  players,
  myPlayerId,
  currentTurnIndex,
  language,
  children
}) => {
  const myIndex = players.findIndex(p => p.id === myPlayerId);
  
  let leftPlayer: Player | undefined;
  let topPlayer: Player | undefined;
  let rightPlayer: Player | undefined;

  if (myIndex !== -1) {
    const numPlayers = players.length;
    if (numPlayers === 2) {
      topPlayer = players[(myIndex + 1) % 2];
    } else if (numPlayers === 3) {
      leftPlayer = players[(myIndex + 1) % 3];
      topPlayer = players[(myIndex + 2) % 3];
    } else if (numPlayers >= 4) {
      leftPlayer = players[(myIndex + 1) % numPlayers];
      topPlayer = players[(myIndex + 2) % numPlayers];
      rightPlayer = players[(myIndex + 3) % numPlayers];
    }
  }

  const renderSeatContent = (player: Player, position: 'top' | 'left' | 'right') => {
    const isVertical = position === 'left' || position === 'right';
    const tileStyle = isVertical ? faceDownTileVerticalStyle : faceDownTileStyle;
    const tileClassName = isVertical ? 'face-down-tile-vertical' : 'face-down-tile';
    
    return (
      <>
        <div className="seat-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="seat-avatar" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
            {player.avatar || '👤'}
          </div>
          <div className="seat-name" style={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', color: 'white' }}>
            {language === 'ar' && player.nameAr ? player.nameAr : player.name}
          </div>
          <div className="seat-count" style={badgeStyle}>
            🀏 {player.hand.length}
          </div>
          {player.isPassed && (
            <div className="seat-pass" style={passBadgeStyle}>
              {language === 'ar' ? 'باص' : 'Pass'}
            </div>
          )}
        </div>
        <div className="seat-tiles" style={{ 
          display: 'flex', 
          flexDirection: isVertical ? 'column' : 'row', 
          gap: '2px',
          marginTop: isVertical ? '0' : '8px',
          marginLeft: isVertical ? '8px' : '0',
          justifyContent: 'center'
        }}>
          {player.hand.map((_, i) => (
            <div 
              key={`${player.id}-tile-${i}`} 
              className={tileClassName}
              style={tileStyle}
            />
          ))}
        </div>
      </>
    );
  };

  const isPlayerActive = (player: Player) => {
    const playerIndex = players.findIndex(p => p.id === player.id);
    return currentTurnIndex === playerIndex;
  };

  return (
    <div className="table-layout">
      {topPlayer && (
        <div className={`table-seat seat-top ${isPlayerActive(topPlayer) ? 'seat-active-turn' : ''}`}>
          {renderSeatContent(topPlayer, 'top')}
        </div>
      )}
      
      <div className="table-middle-row">
        {leftPlayer && (
          <div className={`table-seat seat-left ${isPlayerActive(leftPlayer) ? 'seat-active-turn' : ''}`}>
            {renderSeatContent(leftPlayer, 'left')}
          </div>
        )}
        
        <div className="table-center">
          {children}
        </div>
        
        {rightPlayer && (
          <div className={`table-seat seat-right ${isPlayerActive(rightPlayer) ? 'seat-active-turn' : ''}`}>
            {renderSeatContent(rightPlayer, 'right')}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableLayout;
