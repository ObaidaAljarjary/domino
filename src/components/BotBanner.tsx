import React from 'react';

interface BotBannerProps {
  messageAr: string;
  messageEn: string;
  botNameAr: string;
  botNameEn: string;
  avatar: string;
  language: 'ar' | 'en';
}

export const BotBannerComponent: React.FC<BotBannerProps> = ({
  messageAr,
  messageEn,
  botNameAr,
  botNameEn,
  avatar,
  language,
}) => {
  const isArabic = language === 'ar';

  return (
    <div className="bot-banner">
      <span>{avatar}</span>
      <span style={{ color: 'var(--tea-dark)', fontWeight: 800 }}>
        {isArabic ? botNameAr : botNameEn}:
      </span>
      <span>"{isArabic ? messageAr : messageEn}"</span>
    </div>
  );
};
