
import React, { useState, useEffect } from 'react';
import { AppLanguage } from '../types';
import { getTranslation } from '../i18n';

interface MascotProps {
  theme: 'light' | 'dark';
  language: AppLanguage;
}

const Mascot: React.FC<MascotProps> = ({ theme, language }) => {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const messages = {
      en: [
        "You're doing great!",
        "Which story is your favorite?",
        "I love reading with you!",
        "The Magic Lab is so fun!",
        "Ready for a new adventure?"
      ],
      ms: [
        "Hebatnya anda!",
        "Cerita mana kegemaran anda?",
        "Saya suka membaca bersama anda!",
        "Makmal Ajaib sangat menyeronokkan!",
        "Sedia untuk pengembaraan baru?"
      ],
      id: [
        "Kamu luar biasa!",
        "Cerita mana yang kamu suka?",
        "Aku senang membaca bersamamu!",
        "Lab Ajaib seru sekali!",
        "Siap untuk petualangan baru?"
      ]
    };
    
    const langMessages = messages[language] || messages.en;
    setMessage(langMessages[0]);
    
    const interval = setInterval(() => {
      setMessage(langMessages[Math.floor(Math.random() * langMessages.length)]);
    }, 12000);
    
    return () => clearInterval(interval);
  }, [language]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none sm:pointer-events-auto">
      <div className={`mb-2 px-4 py-2 rounded-2xl shadow-lg border-2 font-bold text-sm animate-bounce max-w-[150px] text-center transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      } ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-purple-400' : 'bg-white border-purple-100 text-purple-600'
      }`}>
        {message}
      </div>
      <div className="relative group cursor-help pointer-events-auto" onClick={() => setIsVisible(!isVisible)}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 transition-transform hover:scale-110 active:scale-95 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-purple-600 border-white'
        }`}>
          <svg viewBox="0 0 100 100" className="w-16 h-16 transition-all group-hover:rotate-12">
            <circle cx="50" cy="55" r="35" fill={theme === 'dark' ? '#333' : 'white'} />
            <circle cx="35" cy="30" r="10" fill={theme === 'dark' ? '#666' : '#333'} />
            <circle cx="65" cy="30" r="10" fill={theme === 'dark' ? '#666' : '#333'} />
            <circle cx="38" cy="50" r="8" fill={theme === 'dark' ? '#666' : '#333'} />
            <circle cx="62" cy="50" r="8" fill={theme === 'dark' ? '#666' : '#333'} />
            <circle cx="50" cy="65" r="5" fill={theme === 'dark' ? '#666' : '#333'} />
            <path d="M45 75 Q50 80 55 75" stroke={theme === 'dark' ? '#666' : '#333'} strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Mascot;
