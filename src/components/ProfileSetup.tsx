import React, { useState } from 'react';
import type { PlayerProfile } from '../utils/playerProfile';
import { AVATAR_OPTIONS, createProfile, saveProfile } from '../utils/playerProfile';
import { User, Trophy, Percent, Save } from 'lucide-react';

export interface ProfileSetupProps {
  onProfileReady: (profile: PlayerProfile) => void;
  existingProfile: PlayerProfile | null;
  language: 'ar' | 'en';
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  onProfileReady,
  existingProfile,
  language,
}) => {
  const isArabic = language === 'ar';
  const [displayName, setDisplayName] = useState<string>(existingProfile?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    existingProfile?.avatar || AVATAR_OPTIONS[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = displayName.trim() || (isArabic ? 'لاعب' : 'Player');

    let saved: PlayerProfile;
    if (existingProfile) {
      saved = {
        ...existingProfile,
        displayName: finalName,
        avatar: selectedAvatar,
      };
      saveProfile(saved);
    } else {
      saved = createProfile(finalName, selectedAvatar);
    }

    onProfileReady(saved);
  };

  const winRate =
    existingProfile && existingProfile.gamesPlayed > 0
      ? Math.round((existingProfile.wins / existingProfile.gamesPlayed) * 100)
      : 0;

  return (
    <div className="lobby-overlay" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="lobby-card" style={{ maxWidth: '520px', width: '95%' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="lobby-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <User size={28} style={{ color: 'var(--gold-accent)' }} />
            <span>{isArabic ? 'الملف الشخصي' : 'Player Profile'}</span>
          </div>
          <div className="lobby-subtitle" style={{ marginTop: '4px' }}>
            {isArabic ? 'خصص اسمك ورمزك الشخصي لبدء اللعب' : 'Customize your name and avatar to play'}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Display Name Input */}
          <div style={{ textAlign: isArabic ? 'right' : 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gold-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} />
              {isArabic ? 'اسم اللاعب' : 'Player Name'}
            </label>
            <input
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={isArabic ? 'أدخل اسمك...' : 'Enter your name...'}
              maxLength={20}
              required
            />
          </div>

          {/* Avatar Picker Grid */}
          <div style={{ textAlign: isArabic ? 'right' : 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gold-accent)' }}>
              {isArabic ? 'اختر الرمز الشخصي' : 'Select Avatar'}
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                border: '1px solid var(--wood-border)',
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              {AVATAR_OPTIONS.map((avatarOption) => {
                const isSelected = selectedAvatar === avatarOption;
                return (
                  <button
                    key={avatarOption}
                    type="button"
                    onClick={() => setSelectedAvatar(avatarOption)}
                    style={{
                      fontSize: '1.8rem',
                      padding: '8px',
                      background: isSelected ? 'rgba(229, 184, 66, 0.2)' : 'rgba(78, 41, 27, 0.4)',
                      border: isSelected ? '3px solid var(--gold-accent)' : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 12px var(--gold-glow)' : 'none',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={avatarOption}
                  >
                    {avatarOption}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Stats section if existing profile */}
          {existingProfile && (
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                border: '1px solid var(--wood-border)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#aaa', textAlign: isArabic ? 'right' : 'left' }}>
                {isArabic ? 'إحصائيات اللاعب' : 'Player Statistics'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div
                  style={{
                    background: 'rgba(78, 41, 27, 0.5)',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid rgba(229, 184, 66, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <User size={14} style={{ color: 'var(--gold-accent)' }} />
                    {isArabic ? 'المباريات' : 'Played'}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>
                    {existingProfile.gamesPlayed}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(78, 41, 27, 0.5)',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid rgba(229, 184, 66, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Trophy size={14} style={{ color: 'var(--gold-accent)' }} />
                    {isArabic ? 'الفوز' : 'Wins'}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--gold-accent)', marginTop: '2px' }}>
                    {existingProfile.wins}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(78, 41, 27, 0.5)',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid rgba(229, 184, 66, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Percent size={14} style={{ color: 'var(--gold-accent)' }} />
                    {isArabic ? 'نسبة الفوز' : 'Win Rate'}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4CAF50', marginTop: '2px' }}>
                    {winRate}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="game-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginTop: '4px',
            }}
          >
            <Save size={20} />
            {isArabic ? 'حفظ ومتابعة' : 'Save & Play'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
