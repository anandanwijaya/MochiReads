
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
  const isDark = theme === 'dark';

  useEffect(() => {
    const messages: Record<string, string[]> = {
      en: ["You're doing great!", "High five! ✋", "Which story is your favorite?", "I love reading with you!", "The Magic Lab is so fun!", "Ready for a new adventure?"],
      ms: ["Hebatnya anda!", "Tepuk tangan! ✋", "Cerita mana kegemaran anda?", "Saya suka membaca bersama anda!", "Makmal Ajaib sangat menyeronokkan!", "Sedia untuk pengembaraan baru?"],
      id: ["Kamu luar biasa!", "Tos dulu! ✋", "Cerita mana yang kamu suka?", "Aku senang membaca bersamamu!", "Lab Ajaib seru sekali!", "Siap untuk petualangan baru?"],
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
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end pointer-events-none sm:pointer-events-auto">
      <div className={`mb-6 px-8 py-5 rounded-[2.5rem] shadow-3xl border-8 font-black text-xl animate-bounce-slow max-w-[280px] text-center transition-all duration-700 relative ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50'
      } ${
        isDark ? 'bg-slate-800 border-slate-700 text-purple-400 shadow-purple-950/20' : 'bg-white border-purple-50 text-indigo-600 shadow-indigo-100'
      }`}>
        {message}
        <div className={`absolute -bottom-4 right-10 w-8 h-8 rotate-45 border-r-8 border-b-8 ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-50'
        }`} />
      </div>
      
      <div 
        className={`relative group cursor-pointer pointer-events-auto animate-float ${isWiggling ? 'animate-shake' : ''}`} 
        onClick={handleMascotClick}
      >
        <div className={`w-32 h-32 rounded-[3.5rem] flex items-center justify-center shadow-2xl border-8 transition-all hover:scale-110 active:scale-95 tactile-button overflow-hidden ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-indigo-600 border-white shadow-indigo-300'
        }`}>
          <svg viewBox="0 0 100 100" className="w-20 h-20 transition-all group-hover:rotate-12">
            <circle cx="50" cy="55" r="35" fill={isDark ? '#1e293b' : 'white'} />
            <circle cx="35" cy="35" r="8" fill={isDark ? '#6366f1' : '#333'} />
            <circle cx="65" cy="35" r="8" fill={isDark ? '#6366f1' : '#333'} />
            <circle cx="38" cy="55" r="6" fill={isDark ? '#475569' : '#333'} />
            <circle cx="62" cy="55" r="6" fill={isDark ? '#475569' : '#333'} />
            <circle cx="50" cy="70" r="4" fill={isDark ? '#475569' : '#333'} />
            <path d="M42 80 Q50 85 58 80" stroke={isDark ? '#6366f1' : '#333'} strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Mascot;
