import React from 'react';
import type { Player, GameMode } from '../types/domino';
import { BookOpen } from 'lucide-react';

interface ScoreBoardProps {
  players: Player[];
  targetScore: number;
  mode: GameMode;
  language: 'ar' | 'en';
}

export const ScoreBoardComponent: React.FC<ScoreBoardProps> = ({
  players,
  targetScore,
  mode,
  language,
}) => {
  const isArabic = language === 'ar';

  if (mode === '2v2') {
    const team1Score = players.filter((p) => p.team === 1).reduce((sum, p) => sum + p.score, 0);
    const team2Score = players.filter((p) => p.team === 2).reduce((sum, p) => sum + p.score, 0);

    return (
      <div className="score-notebook">
        <div className="notebook-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} />
            {isArabic ? 'دفتر الحساب (2 ضد 2)' : 'Score Ledger (2v2)'}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#555' }}>🎯 {targetScore}</span>
        </div>

        <div className="player-score-row" style={{ color: '#268bd2' }}>
          <span>{isArabic ? 'فريق 1 (أنت)' : 'Team 1 (You)'}</span>
          <span>{team1Score} pt</span>
        </div>

        <div className="player-score-row" style={{ color: '#dc322f' }}>
          <span>{isArabic ? 'فريق 2 (المنافسين)' : 'Team 2 (Opponents)'}</span>
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
          {isArabic ? 'دفتر الحساب' : 'Score Ledger'}
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
