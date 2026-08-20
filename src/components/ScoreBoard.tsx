import React from 'react';
import type { Player, GameMode } from '../types/domino';
import { BookOpen } from 'lucide-react';

interface ScoreBoardProps {
  players: Player[];
  targetScore: number;
  mode: GameMode;
  onlineSubMode?: '1v1' | '3_ffa' | '2v2' | '4_ffa' | '5_ffa' | '6_ffa' | '3v3';
  roundNumber: number;
  language: 'ar' | 'en';
}

export const ScoreBoardComponent: React.FC<ScoreBoardProps> = ({
  players,
  targetScore,
  mode,
  onlineSubMode,
  roundNumber,
  language,
}) => {
  const isArabic = language === 'ar';
  const isTeamGame = mode === '2v2' || mode === '3v3' || (mode === 'online' && (onlineSubMode === '2v2' || onlineSubMode === '3v3'));

  if (isTeamGame) {
    const team1Score = players.filter((p) => p.team === 1).reduce((sum, p) => sum + p.score, 0);
    const team2Score = players.filter((p) => p.team === 2).reduce((sum, p) => sum + p.score, 0);

    return (
      <div className="score-notebook">
        <div className="notebook-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} />
            {isArabic ? `الجولة ${roundNumber}` : `Round ${roundNumber}`}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#555' }}>🎯 {targetScore}</span>
        </div>

        <div className="player-score-row" style={{ color: '#268bd2' }}>
          <span>
            {players.filter((p) => p.team === 1).map((p) => p.avatar).join(' ')}
            {isArabic ? ' فريق 1' : ' Team 1'}
          </span>
          <span>{team1Score} pt</span>
        </div>

        <div className="player-score-row" style={{ color: '#dc322f' }}>
          <span>
            {players.filter((p) => p.team === 2).map((p) => p.avatar).join(' ')}
            {isArabic ? ' فريق 2' : ' Team 2'}
          </span>
          <span>{team2Score} pt</span>
        </div>
      </div>
    );
  }

  return (
    <div className="score-notebook">
      <div className="notebook-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={16} />
          {isArabic ? `الجولة ${roundNumber}` : `Round ${roundNumber}`}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#555' }}>🎯 {targetScore}</span>
      </div>

      {players.map((player) => (
        <div key={player.id} className="player-score-row">
          <span>
            {player.avatar} {isArabic ? player.nameAr : player.name}
          </span>
          <span style={{ color: player.score > 0 ? '#cb4b16' : '#555' }}>
            {player.score} pt
          </span>
        </div>
      ))}
    </div>
  );
};
