import React, { useState } from 'react';
import type { GameMode, Language } from '../types/domino';
import { Users, User, Globe, Trophy, Play, Copy, Check } from 'lucide-react';

interface LobbyProps {
  onStartGame: (
    mode: GameMode,
    playerName: string,
    targetScore: number,
    roomCode?: string,
    isJoiningRoom?: boolean
  ) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const LobbyComponent: React.FC<LobbyProps> = ({
  onStartGame,
  language,
  onToggleLanguage,
}) => {
  const isArabic = language === 'ar';
  const [mode, setMode] = useState<GameMode>('1v1');
  const [playerName, setPlayerName] = useState(isArabic ? 'أبو العز' : 'Player 1');
  const [targetScore, setTargetScore] = useState<number>(101);
  const [hostRoomCode, setHostRoomCode] = useState<string>(
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(hostRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    if (mode === 'online' && isJoining) {
      if (!joinCodeInput.trim()) return;
      onStartGame(mode, playerName, targetScore, joinCodeInput.trim(), true);
    } else if (mode === 'online') {
      onStartGame(mode, playerName, targetScore, hostRoomCode, false);
    } else {
      onStartGame(mode, playerName, targetScore);
    }
  };

  return (
    <div className="lobby-overlay">
      <div className="lobby-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="brand-title">
            <span style={{ fontSize: '2.2rem' }}>🀏</span>
            <div className="lobby-title">{isArabic ? 'دومينو الشايخانة' : 'Chaikhana Dominoes'}</div>
          </div>
          <button className="icon-btn" onClick={onToggleLanguage}>
            <Globe size={18} />
            {isArabic ? 'English' : 'العربية'}
          </button>
        </div>

        <div className="lobby-subtitle">
          {isArabic
            ? 'لعبة الدومينو العراقية الأصيلة - أجواء القهوة الشعبية الشايخانة!'
            : 'Authentic Iraqi Cafe Dominoes - Classic Rules & Chaikhana Vibe!'}
        </div>

        {/* Player Name Input */}
        <div style={{ textAlign: 'start' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--gold-accent)', fontWeight: 700 }}>
            {isArabic ? 'اسم اللاعب:' : 'Player Name:'}
          </label>
          <input
            className="input-field"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ marginTop: '4px' }}
          />
        </div>

        {/* Game Mode Selector */}
        <div style={{ textAlign: 'start' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--gold-accent)', fontWeight: 700 }}>
            {isArabic ? 'اختر نمط اللعب:' : 'Select Game Mode:'}
          </label>

          <div className="mode-selector" style={{ marginTop: '8px' }}>
            <div
              className={`mode-card ${mode === '1v1' ? 'active' : ''}`}
              onClick={() => setMode('1v1')}
            >
              <User size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? '1 ضد 1 (بوت)' : '1v1 Singleplayer'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? 'ضد البوت أبو جاسم' : 'vs Abu Jasim Bot'}
              </span>
            </div>

            <div
              className={`mode-card ${mode === '2v2' ? 'active' : ''}`}
              onClick={() => setMode('2v2')}
            >
              <Users size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? '2 ضد 2 (فرق)' : '2v2 Team Battle'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? 'أنت والحجي ضد المنافسين' : 'You + Bot vs 2 Bots'}
              </span>
            </div>

            <div
              className={`mode-card ${mode === 'pass_play' ? 'active' : ''}`}
              onClick={() => setMode('pass_play')}
            >
              <Users size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? 'لعب محلي' : 'Pass & Play'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? 'لاعبين على نفس الجهاز' : '2 Players on Same Device'}
              </span>
            </div>

            <div
              className={`mode-card ${mode === 'online' ? 'active' : ''}`}
              onClick={() => setMode('online')}
            >
              <Globe size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? 'غرفة أونلاين' : 'Online Room'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? 'انشئ غرفة أو انضم لصديق' : 'Play with Friends via Code'}
              </span>
            </div>
          </div>
        </div>

        {/* Online Room options */}
        {mode === 'online' && (
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '12px', textAlign: 'start' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                className={`game-btn ${!isJoining ? 'active' : ''}`}
                style={{ flex: 1, fontSize: '0.85rem' }}
                onClick={() => setIsJoining(false)}
              >
                {isArabic ? 'إنشاء غرفة جديدة' : 'Create Room'}
              </button>
              <button
                className={`game-btn ${isJoining ? 'active' : ''}`}
                style={{ flex: 1, fontSize: '0.85rem' }}
                onClick={() => setIsJoining(true)}
              >
                {isArabic ? 'الانضمام لغرفة' : 'Join Room'}
              </button>
            </div>

            {isJoining ? (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--gold-accent)' }}>
                  {isArabic ? 'رمز الغرفة المراد الانضمام لها:' : 'Target Room Code:'}
                </label>
                <input
                  className="input-field"
                  placeholder={isArabic ? 'أدخل الرمز (مثلاً CHAI77)' : 'Enter Room Code (e.g. CHAI77)'}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  style={{ marginTop: '4px' }}
                />
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--gold-accent)' }}>
                  {isArabic ? 'رمز غرفتك الخاص (شاركه مع صديقك):' : 'Your Unique Room Code (Share with friend):'}
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    className="input-field"
                    value={hostRoomCode}
                    onChange={(e) => setHostRoomCode(e.target.value.toUpperCase())}
                    style={{ fontWeight: 800, letterSpacing: '2px', textAlign: 'center', fontSize: '1.1rem' }}
                  />
                  <button className="icon-btn" onClick={handleCopyCode}>
                    {copied ? <Check size={18} color="#4ef037" /> : <Copy size={18} />}
                    {isArabic ? (copied ? 'تم النسخ!' : 'نسخ') : copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Target Score Selector */}
        <div style={{ textAlign: 'start' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--gold-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={16} />
            {isArabic ? 'هدف المباراة (النقاط):' : 'Target Match Score:'}
          </label>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            {[50, 101, 150].map((score) => (
              <button
                key={score}
                className={`game-btn ${targetScore === score ? 'active' : ''}`}
                style={{
                  flex: 1,
                  borderColor: targetScore === score ? 'var(--gold-accent)' : 'transparent',
                }}
                onClick={() => setTargetScore(score)}
              >
                {score} {isArabic ? 'نقطة' : 'pts'}
              </button>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        <button
          className="game-btn"
          style={{
            background: 'var(--gold-accent)',
            color: 'var(--wood-dark)',
            justifyContent: 'center',
            fontSize: '1.2rem',
            padding: '14px',
            marginTop: '8px',
          }}
          onClick={handleStart}
        >
          <Play size={22} />
          {isArabic
            ? mode === 'online'
              ? isJoining
                ? 'انضمام للغرفة!'
                : 'إنشاء ودخول الغرفة!'
              : 'ابدأ الجلسة الشايخانة!'
            : mode === 'online'
            ? isJoining
              ? 'Join Room!'
              : 'Create & Launch Room!'
            : 'Start Chaikhana Match!'}
        </button>
      </div>
    </div>
  );
};
