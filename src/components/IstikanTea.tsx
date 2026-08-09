import React, { useState } from 'react';
import { soundEngine } from '../utils/soundEngine';

interface IstikanTeaProps {
  language: 'ar' | 'en';
}

const TEA_PHRASES_AR = [
  'شاي عراقي مخدر! ☕',
  'عاشت الأيادي! ✨',
  'استكانة شاي تفك الرأس!',
  'بالعافية يا غالي! ❤️',
  'شاي هي لـ أبو الجاسم! 🫖',
];

const TEA_PHRASES_EN = [
  'Authentic Iraqi Tea! ☕',
  'Fresh Brewed Chai! ✨',
  'Cheers & Good Luck! ❤️',
  'Best Domino Tea! 🫖',
];

export const IstikanTeaComponent: React.FC<IstikanTeaProps> = ({ language }) => {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handleSip = () => {
    soundEngine.playTeaSpoonClink();

    const phrases = language === 'ar' ? TEA_PHRASES_AR : TEA_PHRASES_EN;
    const randomMsg = phrases[Math.floor(Math.random() * phrases.length)];
    setTooltip(randomMsg);

    setTimeout(() => {
      setTooltip(null);
    }, 2500);
  };

  return (
    <div className="istikan-container" onClick={handleSip} title="اشرب استكان شاي عراقي!">
      <div className="steam steam-1" />
      <div className="steam steam-2" />

      <div className="istikan-glass">
        <div className="tea-spoon" />
      </div>
      <div className="saucer" />

      {tooltip ? (
        <div className="sip-tooltip">{tooltip}</div>
      ) : (
        <div className="sip-tooltip">{language === 'ar' ? 'استكان شاي ☕' : 'Iraqi Tea ☕'}</div>
      )}
    </div>
  );
};
