import React, { useState } from 'react';
import type { Player, Language } from '../types/domino';
import { Users, Copy, Check, Play, ShieldCheck, Clock } from 'lucide-react';

interface WaitingRoomProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onStartMatch: () => void;
  language: Language;
}

export const WaitingRoomComponent: React.FC<WaitingRoomProps> = ({
  roomCode,
  players,
  isHost,
  onStartMatch,
  language,
}) => {
  const isArabic = language === 'ar';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const connectedCount = players.filter((p) => p.isConnected).length;

  return (
    <div className="lobby-overlay">
      <div className="lobby-card" style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Users size={32} color="var(--gold-accent)" />
          <h2 className="lobby-title" style={{ fontSize: '1.6rem' }}>
            {isArabic ? 'غرفة الانتظار الأونلاين' : 'Online Waiting Room'}
          </h2>
        </div>

        {/* Big Room Code Box */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '2px dashed var(--gold-accent)',
            borderRadius: '16px',
            padding: '16px',
            marginTop: '6px',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
            {isArabic ? 'رمز الغرفة (شارك هذا الرمز مع أصدقائك):' : 'Room Code (Share with your friends):'}
          </div>
          <div
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: '#ffd700',
              letterSpacing: '4px',
              margin: '8px 0',
              fontFamily: 'monospace',
            }}
          >
            {roomCode}
          </div>
          <button className="game-btn" onClick={handleCopy} style={{ margin: '0 auto', fontSize: '0.85rem' }}>
            {copied ? <Check size={16} color="#4ef037" /> : <Copy size={16} />}
            {isArabic ? (copied ? 'تم نسخ الرمز!' : 'نسخ الرمز') : copied ? 'Copied Code!' : 'Copy Room Code'}
          </button>
        </div>

        {/* Players Slot List */}
        <div style={{ textAlign: 'start' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--gold-accent)', fontWeight: 700 }}>
            {isArabic
              ? `اللاعبين المتربصين في الشايخانة (${connectedCount}/${players.length}):`
              : `Connected Players (${connectedCount}/${players.length}):`}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {players.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  background: p.isConnected ? 'rgba(78, 240, 55, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                  border: p.isConnected ? '1px solid #4ef037' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{p.avatar}</span>
                  <div>
                    <strong style={{ color: p.isConnected ? '#fff' : '#aaa', fontSize: '0.95rem' }}>
                      {isArabic ? p.nameAr : p.name}
                    </strong>
                    {idx === 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold-accent)', display: 'block' }}>
                        {isArabic ? '👑 المضيف (Host)' : '👑 Room Host'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {p.isConnected ? (
                    <span style={{ color: '#4ef037', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={16} />
                      {isArabic ? 'متصل ✅' : 'Connected ✅'}
                    </span>
                  ) : (
                    <span style={{ color: '#aaa', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={16} />
                      {isArabic ? 'بانتظار الانضمام... ⏳' : 'Waiting... ⏳'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        {isHost ? (
          <button
            className="game-btn"
            style={{
              background: 'var(--gold-accent)',
              color: 'var(--wood-dark)',
              justifyContent: 'center',
              fontSize: '1.15rem',
              padding: '14px',
              marginTop: '10px',
            }}
            onClick={onStartMatch}
          >
            <Play size={22} />
            {isArabic ? 'ابدأ الجلسة الآن!' : 'Start Chaikhana Match Now!'}
          </button>
        ) : (
          <div style={{ color: 'var(--gold-accent)', padding: '10px', fontSize: '0.95rem', fontWeight: 700 }}>
            {isArabic ? '⏳ بانتظار المضيف ليبدأ الجلسة...' : '⏳ Waiting for Host to start the match...'}
          </div>
        )}
      </div>
    </div>
  );
};
