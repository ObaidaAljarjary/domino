import React, { useState } from 'react';
import type { GameMode, Language, PlayerProfile } from '../types/domino';
import { Users, User, Globe, Trophy, Play, Copy, Check, UserPlus, Settings } from 'lucide-react';

export type OnlineSubMode = '1v1' | '3_ffa' | '2v2' | '4_ffa';

interface LobbyProps {
  profile: PlayerProfile;
  onStartGame: (
    mode: GameMode,
    playerName: string,
    targetScore: number,
    roomCode?: string,
    isJoiningRoom?: boolean,
    onlineSubMode?: OnlineSubMode
  ) => void;
  onEditProfile: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const LobbyComponent: React.FC<LobbyProps> = ({
  profile,
  onStartGame,
  onEditProfile,
  language,
  onToggleLanguage,
}) => {
  const isArabic = language === 'ar';
  const [mode, setMode] = useState<GameMode>('1v1');
  const [targetScore, setTargetScore] = useState<number>(101);
  const [onlineSubMode, setOnlineSubMode] = useState<OnlineSubMode>('1v1');
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
      onStartGame(mode, profile.displayName, targetScore, joinCodeInput.trim(), true, onlineSubMode);
    } else if (mode === 'online') {
      onStartGame(mode, profile.displayName, targetScore, hostRoomCode, false, onlineSubMode);
    } else {
      onStartGame(mode, profile.displayName, targetScore);
    }
  };

  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;

  const onlineOptions: { id: OnlineSubMode; labelAr: string; labelEn: string; icon: string }[] = [
    { id: '1v1', labelAr: '1 ضد 1 (لاعبان)', labelEn: '1v1 (2 Players)', icon: '👤' },
    { id: '3_ffa', labelAr: '3 لاعبين (فردي)', labelEn: '3 Players (FFA)', icon: '👥' },
    { id: '2v2', labelAr: '2 ضد 2 (فرق)', labelEn: '2v2 Teams (4 Players)', icon: '⚔️' },
    { id: '4_ffa', labelAr: '4 لاعبين (فردي)', labelEn: '4 Players (FFA)', icon: '🎮' },
  ];

  return (
    <div className="lobby-overlay">
      <div className="lobby-card" style={{ maxWidth: '580px' }}>
        {/* Header with profile & lang */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="brand-title">
            <span style={{ fontSize: '2.2rem' }}>🀏</span>
            <div className="lobby-title" style={{ fontSize: '1.6rem' }}>{isArabic ? 'دومينو الشايخانة' : 'Chaikhana Dominoes'}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="icon-btn" onClick={onToggleLanguage}>
              <Globe size={16} />
              {isArabic ? 'EN' : 'عر'}
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(229,184,66,0.3)' }}>
          <span style={{ fontSize: '2.4rem' }}>{profile.avatar}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{profile.displayName}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#aaa', marginTop: '2px' }}>
              <span>🎮 {profile.gamesPlayed}</span>
              <span>🏆 {profile.wins}</span>
              <span>📊 {winRate}%</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onEditProfile} style={{ padding: '6px 10px' }}>
            <Settings size={16} />
          </button>
        </div>

        {/* Game Mode Selector */}
        <div style={{ textAlign: 'start' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--gold-accent)', fontWeight: 700 }}>
            {isArabic ? 'اختر نمط اللعب:' : 'Select Game Mode:'}
          </label>

          <div className="mode-selector" style={{ marginTop: '6px', gridTemplateColumns: '1fr 1fr' }}>
            <div className={`mode-card ${mode === '1v1' ? 'active' : ''}`} onClick={() => setMode('1v1')}>
              <User size={22} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.85rem' }}>{isArabic ? '1 ضد 1' : '1v1 Bot'}</strong>
            </div>

            <div className={`mode-card ${mode === '3_ffa' ? 'active' : ''}`} onClick={() => setMode('3_ffa')}>
              <UserPlus size={22} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.85rem' }}>{isArabic ? '3 لاعبين' : '3 Players'}</strong>
            </div>

            <div className={`mode-card ${mode === '2v2' ? 'active' : ''}`} onClick={() => setMode('2v2')}>
              <Users size={22} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.85rem' }}>{isArabic ? '2 ضد 2 فرق' : '2v2 Teams'}</strong>
            </div>

            <div className={`mode-card ${mode === '4_ffa' ? 'active' : ''}`} onClick={() => setMode('4_ffa')}>
              <Users size={22} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.85rem' }}>{isArabic ? '4 لاعبين' : '4 Players'}</strong>
            </div>

            <div className={`mode-card ${mode === 'pass_play' ? 'active' : ''}`} onClick={() => setMode('pass_play')}>
              <Users size={22} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.85rem' }}>{isArabic ? 'لعب محلي' : 'Pass & Play'}</strong>
            </div>

            <div className={`mode-card ${mode === 'online' ? 'active' : ''}`} onClick={() => setMode('online')}>
              <Globe size={22} color="var(--gold-accent)" />
              <strong style={{ fontSize: '0.85rem' }}>{isArabic ? 'أونلاين' : 'Online Room'}</strong>
            </div>
          </div>
        </div>

        {/* Online Room Options */}
        {mode === 'online' && (
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', textAlign: 'start' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button
                className={`game-btn ${!isJoining ? 'active' : ''}`}
                style={{ flex: 1, fontSize: '0.85rem', justifyContent: 'center' }}
                onClick={() => setIsJoining(false)}
              >
                {isArabic ? 'إنشاء غرفة' : 'Create Room'}
              </button>
              <button
                className={`game-btn ${isJoining ? 'active' : ''}`}
                style={{ flex: 1, fontSize: '0.85rem', justifyContent: 'center' }}
                onClick={() => setIsJoining(true)}
              >
                {isArabic ? 'انضمام لغرفة' : 'Join Room'}
              </button>
            </div>

            {!isJoining && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold-accent)', fontWeight: 700 }}>
                  {isArabic ? 'نوع الغرفة الأونلاين:' : 'Online Room Type:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                  {onlineOptions.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      className={`game-btn ${onlineSubMode === sub.id ? 'active' : ''}`}
                      style={{ fontSize: '0.8rem', justifyContent: 'center', padding: '8px 6px' }}
                      onClick={() => setOnlineSubMode(sub.id)}
                    >
                      <span>{sub.icon}</span>
                      <span>{isArabic ? sub.labelAr : sub.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isJoining ? (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold-accent)' }}>
                  {isArabic ? 'رمز الغرفة:' : 'Room Code:'}
                </label>
                <input
                  className="input-field"
                  placeholder={isArabic ? 'أدخل الرمز' : 'Enter Code'}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  style={{ marginTop: '4px' }}
                />
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold-accent)' }}>
                  {isArabic ? 'رمز غرفتك:' : 'Your Room Code:'}
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    className="input-field"
                    value={hostRoomCode}
                    onChange={(e) => setHostRoomCode(e.target.value.toUpperCase())}
                    style={{ fontWeight: 800, letterSpacing: '2px', textAlign: 'center', fontSize: '1.1rem' }}
                  />
                  <button className="icon-btn" onClick={handleCopyCode} style={{ padding: '6px 10px' }}>
                    {copied ? <Check size={16} color="#4ef037" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Target Score */}
        <div style={{ textAlign: 'start' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--gold-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={14} />
            {isArabic ? 'هدف النقاط:' : 'Target Score:'}
          </label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {[50, 101, 150].map((score) => (
              <button
                key={score}
                className={`game-btn ${targetScore === score ? 'active' : ''}`}
                style={{ flex: 1, borderColor: targetScore === score ? 'var(--gold-accent)' : 'transparent', justifyContent: 'center' }}
                onClick={() => setTargetScore(score)}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          className="game-btn"
          style={{
            background: 'var(--gold-accent)',
            color: 'var(--wood-dark)',
            justifyContent: 'center',
            fontSize: '1.15rem',
            padding: '14px',
            marginTop: '4px',
          }}
          onClick={handleStart}
        >
          <Play size={22} />
          {isArabic
            ? mode === 'online'
              ? isJoining
                ? 'انضمام!'
                : 'إنشاء الغرفة!'
              : 'ابدأ الجلسة!'
            : mode === 'online'
            ? isJoining
              ? 'Join!'
              : 'Create Room!'
            : 'Start Match!'}
        </button>
      </div>
    </div>
  );
};
