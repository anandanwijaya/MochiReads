
import React, { useState, useEffect } from 'react';
import { AppLanguage } from '../types';
import { getTranslation } from '../i18n';
import { playSound } from './SoundEffects';

interface MascotProps {
  theme: 'light' | 'dark';
  language: AppLanguage;
}

const Mascot: React.FC<MascotProps> = ({ theme, language }) => {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isWiggling, setIsWiggling] = useState(false);

  useEffect(() => {
    const messages: Record<string, string[]> = {
      en: ["You're doing great!", "High five! ✋", "Which story is your favorite?", "I love reading with you!", "The Magic Lab is so fun!", "Ready for a new adventure?"],
      ms: ["Hebatnya anda!", "Tepuk tangan! ✋", "Cerita mana kegemaran anda?", "Saya suka membaca bersama anda!", "Makmal Ajaib sangat menyeronokkan!", "Sedia untuk pengembaraan baru?"],
      id: ["Kamu luar biasa!", "Tos dulu! ✋", "Cerita mana yang kamu suka?", "Aku senang membaca bersamamu!", "Lab Ajaib seru sekali!", "Siap untuk petualangan baru?"],
      // ... other languages
    };
    
    const langMessages = messages[language] || messages.en;
    setMessage(langMessages[0]);
    
    const interval = setInterval(() => {
      setMessage(langMessages[Math.floor(Math.random() * langMessages.length)]);
    }, 12000);
    
    return () => clearInterval(interval);
  }, [language]);

  const handleMascotClick = () => {
    playSound('pop');
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);
    setIsVisible(!isVisible);
  };

  return (
    <div className="fixed bottom-10 right-10 z-40 flex flex-col items-end pointer-events-none sm:pointer-events-auto">
      <div className={`mb-4 px-6 py-3 rounded-[2rem] shadow-2xl border-4 font-bold text-base animate-bounce-slow max-w-[200px] text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      } ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-purple-400' : 'bg-white border-purple-50 text-purple-600'
      }`}>
        {message}
        <div className={`absolute -bottom-2 right-8 w-4 h-4 rotate-45 border-r-4 border-b-4 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-50'
        }`} />
      </div>
      <div 
        className={`relative group cursor-pointer pointer-events-auto animate-float ${isWiggling ? 'animate-shake' : ''}`} 
        onClick={handleMascotClick}
      >
        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-[0_12px_0_0_rgba(0,0,0,0.1)] border-4 transition-transform hover:scale-110 active:scale-95 tactile-button ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-indigo-600 border-white shadow-indigo-200'
        }`}>
          <svg viewBox="0 0 100 100" className="w-16 h-16 transition-all group-hover:rotate-6">
            <circle cx="50" cy="55" r="35" fill={theme === 'dark' ? '#333' : 'white'} />
            <circle cx="35" cy="30" r="10" fill={theme === 'dark' ? '#666' : '#333'} />
            <circle cx="65" cy="30" r="10" fill={theme === 'dark' ? '#666' : '#333'} />
            <circle cx="38" cy="50" r="8" fill={theme === 'dark' ? '#666' : '#333'} />
            <circle cx="62" cy="50" r="8" fill={theme === 'dark' ? '#666' : '#333'} />
            <circle cx="50" cy="65" r="5" fill={theme === 'dark' ? '#666' : '#333'} />
            <path d="M45 75 Q50 80 55 75" stroke={theme === 'dark' ? '#666' : '#333'} strokeWidth="3" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Mascot;
