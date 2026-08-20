import React from 'react';
import type { Player, Language } from '../types/domino';

interface TableLayoutProps {
  players: Player[];
  myPlayerId: string;
  currentTurnIndex: number;
  language: Language;
  activeEmotes?: { id: string; senderId: string; emote: string }[];
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
  activeEmotes = [],
  children
}) => {
  const myIndex = players.findIndex(p => p.id === myPlayerId);
  
  let leftPlayer: Player | undefined;
  let topLeftPlayer: Player | undefined;
  let topPlayer: Player | undefined;
  let topRightPlayer: Player | undefined;
  let rightPlayer: Player | undefined;

  if (myIndex !== -1) {
    const numPlayers = players.length;
    if (numPlayers === 2) {
      topPlayer = players[(myIndex + 1) % 2];
    } else if (numPlayers === 3) {
      leftPlayer = players[(myIndex + 1) % 3];
      topPlayer = players[(myIndex + 2) % 3];
    } else if (numPlayers === 4) {
      leftPlayer = players[(myIndex + 1) % 4];
      topPlayer = players[(myIndex + 2) % 4];
      rightPlayer = players[(myIndex + 3) % 4];
    } else if (numPlayers === 5) {
      leftPlayer = players[(myIndex + 1) % 5];
      topLeftPlayer = players[(myIndex + 2) % 5];
      topRightPlayer = players[(myIndex + 3) % 5];
      rightPlayer = players[(myIndex + 4) % 5];
    } else if (numPlayers === 6) {
      leftPlayer = players[(myIndex + 1) % 6];
      topLeftPlayer = players[(myIndex + 2) % 6];
      topPlayer = players[(myIndex + 3) % 6];
      topRightPlayer = players[(myIndex + 4) % 6];
      rightPlayer = players[(myIndex + 5) % 6];
    }
  }

  const renderSeatContent = (player: Player, position: 'top' | 'left' | 'right' | 'topLeft' | 'topRight') => {
    const isVertical = position === 'left' || position === 'right';
    const tileStyle = isVertical ? faceDownTileVerticalStyle : faceDownTileStyle;
    const tileClassName = isVertical ? 'face-down-tile-vertical' : 'face-down-tile';
    
    return (
      <>
        <div className="seat-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div className="seat-avatar" style={{ fontSize: '2.5rem', lineHeight: '1', position: 'relative' }}>
            {player.avatar || '👤'}
            {activeEmotes
              .filter((e) => e.senderId === player.id)
              .map((e) => (
                <div key={e.id} className="floating-emote" style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)' }}>
                  {e.emote}
                </div>
              ))}
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

  const hasTopRow = topPlayer || topLeftPlayer || topRightPlayer;

  return (
    <div className="table-layout">
      {hasTopRow && (
        <div className="table-top-row" style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '6px 16px', background: 'rgba(27, 15, 11, 0.6)', borderBottom: '2px solid rgba(109, 57, 37, 0.4)' }}>
          {topLeftPlayer && (
            <div className={`table-seat seat-top ${isPlayerActive(topLeftPlayer) ? 'seat-active-turn' : ''}`} style={{ flex: 1, padding: 0, border: 'none', background: 'none' }}>
              {renderSeatContent(topLeftPlayer, 'topLeft')}
            </div>
          )}
          {topPlayer && (
            <div className={`table-seat seat-top ${isPlayerActive(topPlayer) ? 'seat-active-turn' : ''}`} style={{ flex: 1, padding: 0, border: 'none', background: 'none' }}>
              {renderSeatContent(topPlayer, 'top')}
            </div>
          )}
          {topRightPlayer && (
            <div className={`table-seat seat-top ${isPlayerActive(topRightPlayer) ? 'seat-active-turn' : ''}`} style={{ flex: 1, padding: 0, border: 'none', background: 'none' }}>
              {renderSeatContent(topRightPlayer, 'topRight')}
            </div>
          )}
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
