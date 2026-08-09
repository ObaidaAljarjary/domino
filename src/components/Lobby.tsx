import React, { useState } from 'react';
import type { GameMode, Language } from '../types/domino';
import { Users, User, Globe, Trophy, Play, Copy, Check, UserPlus } from 'lucide-react';

interface LobbyProps {
  onStartGame: (
    mode: GameMode,
    playerName: string,
    targetScore: number,
    roomCode?: string,
    isJoiningRoom?: boolean,
    onlinePlayerCount?: 2 | 3 | 4
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
  const [onlinePlayerCount, setOnlinePlayerCount] = useState<2 | 3 | 4>(2);
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
      onStartGame(mode, playerName, targetScore, joinCodeInput.trim(), true, onlinePlayerCount);
    } else if (mode === 'online') {
      onStartGame(mode, playerName, targetScore, hostRoomCode, false, onlinePlayerCount);
    } else {
      onStartGame(mode, playerName, targetScore);
    }
  };

  return (
    <div className="lobby-overlay">
      <div className="lobby-card" style={{ maxWidth: '580px' }}>
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
            ? 'لعبة الدومينو العراقية الأصيلة - 2 و 3 و 4 لاعبين أونلاين وبوتات!'
            : 'Authentic Iraqi Cafe Dominoes - 2, 3 & 4 Players Online & Bots!'}
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

          <div className="mode-selector" style={{ marginTop: '8px', gridTemplateColumns: '1fr 1fr' }}>
            <div
              className={`mode-card ${mode === '1v1' ? 'active' : ''}`}
              onClick={() => setMode('1v1')}
            >
              <User size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? '1 ضد 1 (لاعبين)' : '1v1 Match'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? 'أنت ضد البوت أبو جاسم' : 'vs Abu Jasim Bot'}
              </span>
            </div>

            <div
              className={`mode-card ${mode === '3_ffa' ? 'active' : ''}`}
              onClick={() => setMode('3_ffa')}
            >
              <UserPlus size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? '3 لاعبين فردي' : '3 Players FFA'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? 'أنت وبوتين كل من لحاله' : '3 Player Free For All'}
              </span>
            </div>

            <div
              className={`mode-card ${mode === '2v2' ? 'active' : ''}`}
              onClick={() => setMode('2v2')}
            >
              <Users size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? '4 لاعبين (فرق 2v2)' : '2v2 Team Battle'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? 'أنت والحجي ضد المنافسين' : 'You + Bot vs 2 Bots'}
              </span>
            </div>

            <div
              className={`mode-card ${mode === '4_ffa' ? 'active' : ''}`}
              onClick={() => setMode('4_ffa')}
            >
              <Users size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? '4 لاعبين (فردي)' : '4 Players FFA'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? '4 لاعبين كل من لحاله' : '4 Player Free For All'}
              </span>
            </div>

            <div
              className={`mode-card ${mode === 'pass_play' ? 'active' : ''}`}
              onClick={() => setMode('pass_play')}
              style={{ gridColumn: 'span 1' }}
            >
              <Users size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? 'لعب محلي' : 'Pass & Play'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? 'على نفس الجهاز' : 'Same Device'}
              </span>
            </div>

            <div
              className={`mode-card ${mode === 'online' ? 'active' : ''}`}
              onClick={() => setMode('online')}
              style={{ gridColumn: 'span 1' }}
            >
              <Globe size={24} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.95rem' }}>{isArabic ? 'غرفة أونلاين' : 'Online Room'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                {isArabic ? '2 أو 3 أو 4 أصدقاء' : '2, 3 or 4 Players'}
              </span>
            </div>
          </div>
        </div>

        {/* Online Room Mode Options */}
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

            {!isJoining && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--gold-accent)', fontWeight: 700 }}>
                  {isArabic ? 'عدد لاعبي الغرفة:' : 'Room Player Count:'}
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      className={`game-btn ${onlinePlayerCount === count ? 'active' : ''}`}
                      style={{ flex: 1, fontSize: '0.85rem', justifyContent: 'center' }}
                      onClick={() => setOnlinePlayerCount(count as 2 | 3 | 4)}
                    >
                      {count} {isArabic ? 'لاعبين' : 'Players'}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  {isArabic ? 'رمز غرفتك الخاص (شاركه مع أصدقائك):' : 'Your Unique Room Code (Share with friends):'}
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
