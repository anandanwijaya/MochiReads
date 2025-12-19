
import React from 'react';
import { Sparkles, Stars, BookOpen, Rocket } from 'lucide-react';
import { playSound } from './SoundEffects';
import { AppLanguage } from '../types';
import { getTranslation } from '../i18n';

interface HeroProps {
  onStartCreating: () => void;
  language: AppLanguage;
  theme: 'light' | 'dark';
}

const Hero: React.FC<HeroProps> = ({ onStartCreating, language, theme }) => {
  const t = (key: any) => getTranslation(language, key);
  const isDark = theme === 'dark';

  return (
    <div className={`relative overflow-hidden pt-16 sm:pt-24 lg:pt-36 pb-24 sm:pb-40 transition-colors duration-500 w-full ${
      isDark ? 'bg-transparent' : 'bg-transparent'
    }`}>
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-brand-blue opacity-[0.08] filter blur-[100px] animate-morph pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-brand-purple opacity-[0.08] filter blur-[100px] animate-morph animation-delay-2000 pointer-events-none" />

      {/* Playful Floating Icons */}
      <div className="absolute top-24 right-[10%] text-brand-blue/30 animate-float pointer-events-none hidden md:block">
        <Rocket size={64} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-32 left-[8%] text-brand-purple/30 animate-float animation-delay-1500 pointer-events-none hidden md:block">
        <Sparkles size={56} strokeWidth={1.5} />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 text-center relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-xs sm:text-sm font-black mb-10 shadow-xl border-4 transition-all hover:scale-110 cursor-default animate-bounce-slow ${
          isDark ? 'bg-slate-800 text-brand-sky border-slate-700' : 'bg-white text-brand-blue border-blue-50'
        }`}>
          <Stars size={20} fill="currentColor" strokeWidth={0} className="text-amber-400" />
          <span className="tracking-[0.3em] uppercase">{t('adventureAwaits')}</span>
        </div>
        
        <h1 className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black mb-10 leading-[0.85] tracking-tighter ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {t('heroTitle').split('&')[0]} <br className="hidden md:block" />
          <span className="magic-text">
            & {t('heroTitle').split('&')[1]}
          </span>
        </h1>
        
        <p className={`text-xl sm:text-3xl mb-16 sm:mb-24 max-w-4xl mx-auto font-bold leading-relaxed opacity-80 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 w-full max-w-3xl mx-auto">
          <button 
            onClick={() => { playSound('pop'); document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="group relative px-12 py-6 sm:px-16 sm:py-8 bg-brand-blue text-white rounded-[2.5rem] sm:rounded-[3.5rem] font-black text-2xl sm:text-3xl flex items-center gap-5 w-full sm:w-auto justify-center tactile-button shadow-blue-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-5">
               {t('startReading')}
               <BookOpen size={32} className="sm:w-12 sm:h-12" strokeWidth={3} />
            </span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button 
            onClick={() => { playSound('pop'); onStartCreating(); }}
            className={`group relative px-12 py-6 sm:px-16 sm:py-8 border-8 rounded-[2.5rem] sm:rounded-[3.5rem] font-black text-2xl sm:text-3xl transition-all flex items-center gap-5 w-full sm:w-auto justify-center tactile-button overflow-hidden ${
              isDark 
                ? 'bg-slate-800 text-brand-purple border-slate-700 shadow-purple-950/40' 
                : 'bg-white text-brand-purple border-purple-50 shadow-purple-100'
            }`}
          >
            <span className="relative z-10 flex items-center gap-5">
              <Sparkles size={32} className="sm:w-12 sm:h-12" fill="currentColor" strokeWidth={0} />
              {t('magicStoryLab')}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-24 sm:mt-36 grid grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto gap-8 sm:gap-12">
          {[
            { label: t('stories'), value: '500+', color: 'text-brand-blue', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: t('languages'), value: '20+', color: 'text-brand-purple', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: t('friends'), value: '10k+', color: 'text-brand-sky', bg: 'bg-sky-50', border: 'border-sky-100', hideOnMobile: true }
          ].map((stat, idx) => (
            <div key={idx} className={`sticker-border p-8 sm:p-12 rounded-[3.5rem] flex flex-col items-center justify-center transform hover:-rotate-3 hover:scale-110 transition-all cursor-default puffy-shadow ${
              isDark ? 'bg-slate-900 border-slate-800' : `${stat.bg} ${stat.border}`
            } ${stat.hideOnMobile ? 'hidden md:flex' : ''}`}>
              <div className={`text-5xl sm:text-7xl font-black mb-3 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.4em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
