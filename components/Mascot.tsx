
import React, { useState, useEffect } from 'react';
import { AppLanguage } from '../types';
import { playSound } from './SoundEffects';

interface MascotProps {
  theme: 'light' | 'dark';
  language: AppLanguage;
}

const Mascot: React.FC<MascotProps> = ({ theme, language }) => {
  const [message, setMessage] = useState("Let's read together!");
  const [isVisible, setIsVisible] = useState(true);
  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end pointer-events-none sm:pointer-events-auto">
      <div className={`mb-4 px-6 py-4 rounded-[2rem] border-4 font-black text-sm text-center transition-all duration-500 relative ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-90'
      } ${
        isDark ? 'bg-slate-900 border-slate-800 text-brand-lavender' : 'bg-white border-brand-lavender text-brand-purple shadow-xl'
      }`}>
        {message}
        <div className={`absolute -bottom-2 right-8 w-4 h-4 rotate-45 border-r-4 border-b-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-brand-lavender'
        }`} />
      </div>
      
      <div 
        className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-purple to-brand-pink rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-white cursor-pointer pointer-events-auto hover:scale-110 active:scale-95 transition-all"
        onClick={() => { playSound('pop'); setIsVisible(!isVisible); }}
      >
        <svg viewBox="0 0 100 100" className="w-10 h-10 sm:w-12 sm:h-12 fill-white">
          <circle cx="50" cy="55" r="35" />
          <circle cx="35" cy="35" r="8" fill="#333" />
          <circle cx="65" cy="35" r="8" fill="#333" />
          <path d="M42 80 Q50 86 58 80" stroke="#333" strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

export default Mascot;
