
import React, { useState, useEffect } from 'react';
import { AppLanguage } from '../types';
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
    }, 15000);
    return () => clearInterval(interval);
  }, [language]);

  const handleMascotClick = () => {
    playSound('pop');
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);
    setIsVisible(!isVisible);
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 md:bottom-12 md:right-12 z-[100] flex flex-col items-end pointer-events-none sm:pointer-events-auto">
      {/* Dynamic Responsive Speech Bubble */}
      <div className={`mb-5 px-5 sm:px-8 py-4 sm:py-5 rounded-[2rem] shadow-3xl border-4 font-black text-xs sm:text-lg animate-bounce-slow max-w-[160px] sm:max-w-[280px] text-center transition-all duration-700 relative ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50'
      } ${
        isDark ? 'bg-slate-800/90 border-slate-700 text-brand-violet shadow-purple-950/40 backdrop-blur-xl' : 'bg-white/90 border-brand-lavender text-brand-purple shadow-indigo-100 backdrop-blur-xl'
      }`}>
        {message}
        <div className={`absolute -bottom-3 right-6 sm:right-10 w-6 h-6 rotate-45 border-r-4 border-b-4 ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-brand-lavender'
        }`} />
      </div>
      
      {/* Responsive Scaling Mascot Body - Guaranteed visibility for Tablet */}
      <div 
        className={`relative group cursor-pointer pointer-events-auto animate-float ${isWiggling ? 'animate-squish' : ''}`} 
        onClick={handleMascotClick}
      >
        <div className={`w-14 h-14 sm:w-16 md:w-20 lg:w-28 aspect-square rounded-2xl sm:rounded-3xl md:rounded-[2rem] flex items-center justify-center shadow-3xl border-4 transition-all hover:scale-110 active:scale-95 tactile-button overflow-hidden ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-brand-violet border-white shadow-brand-violet/30'
        }`}>
          <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 md:w-12 lg:w-16 transition-all group-hover:rotate-12 duration-500">
            <circle cx="50" cy="55" r="35" fill={isDark ? '#1e293b' : 'white'} />
            <circle cx="35" cy="35" r="8" fill={isDark ? '#6366f1' : '#333'} />
            <circle cx="65" cy="35" r="8" fill={isDark ? '#6366f1' : '#333'} />
            <path d="M42 80 Q50 86 58 80" stroke={isDark ? '#6366f1' : '#333'} strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx="35" cy="35" r="2" fill="white" className="animate-pulse" />
            <circle cx="65" cy="35" r="2" fill="white" className="animate-pulse" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Mascot;
