
import React from 'react';
import { Sparkles, Stars, BookOpen } from 'lucide-react';
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
    <div className="relative overflow-hidden min-h-[70vh] flex items-center justify-center w-full px-4 sm:px-12 py-16 sm:py-24">
      {/* Immersive Edge-to-Edge Background Elements */}
      <div className="absolute top-[-25%] left-[-15%] w-[80vw] h-[80vw] bg-brand-purple/15 dark:bg-brand-purple/10 filter blur-[140px] animate-morph pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[80vw] h-[80vw] bg-brand-purple/15 dark:bg-brand-purple/10 filter blur-[140px] animate-morph animation-delay-2000 pointer-events-none" />

      <div className="w-full text-center relative z-10 animate-in fade-in slide-up duration-700 ease-out">
        <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-black mb-8 border-2 animate-bounce-slow ${
          isDark ? 'bg-slate-800/80 text-brand-lavender border-slate-700 backdrop-blur-md' : 'bg-white/80 text-brand-purple border-brand-lavender backdrop-blur-md shadow-sm'
        }`}>
          <Stars size={16} fill="currentColor" strokeWidth={0} className="text-brand-purple" />
          <span className="tracking-[0.3em] uppercase">{t('adventureAwaits')}</span>
        </div>
        
        <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-display font-black mb-8 leading-[0.95] tracking-tighter w-full max-w-none px-4 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {t('heroTitle').split('&')[0]} <br className="hidden md:block" />
          <span className="magic-purple-text">
            & {t('heroTitle').split('&')[1]}
          </span>
        </h1>
        
        <p className={`text-lg sm:text-2xl mb-12 max-w-4xl mx-auto font-bold opacity-80 leading-relaxed px-6 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full px-6 max-w-3xl mx-auto">
          <button 
            onClick={() => { playSound('pop'); document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="group relative px-10 py-5 bg-brand-purple text-white rounded-3xl font-black text-xl flex items-center gap-4 w-full sm:w-auto justify-center tactile-button shadow-xl shadow-brand-purple/25 border-2 border-transparent"
          >
            <BookOpen size={24} strokeWidth={3} className="group-hover:rotate-6 transition-transform" />
            {t('startReading')}
          </button>
          
          <button 
            onClick={() => { playSound('pop'); onStartCreating(); }}
            className={`group relative px-10 py-5 border-2 rounded-3xl font-black text-xl flex items-center gap-4 w-full sm:w-auto justify-center transition-all tactile-button ${
              isDark 
                ? 'bg-slate-800/50 text-brand-lavender border-slate-700 hover:bg-slate-800' 
                : 'bg-white/50 text-brand-purple border-brand-lavender hover:bg-white shadow-sm'
            }`}
          >
            <Sparkles size={24} fill="currentColor" strokeWidth={0} className="group-hover:animate-sparkle" />
            {t('magicStoryLab')}
          </button>
        </div>

        {/* Cinematic Mini-stats Bar - Child-Friendly Bright Smooth Purple Palette */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-90">
           <div className="text-center group">
             <div className="text-3xl sm:text-5xl font-black text-fuchsia-400 mb-1 group-hover:scale-105 transition-transform drop-shadow-sm">500+</div>
             <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{t('stories')}</div>
           </div>
           <div className="hidden sm:block h-10 w-0.5 bg-brand-lavender/50 dark:bg-slate-800 rounded-full" />
           <div className="text-center group">
             <div className="text-3xl sm:text-5xl font-black text-violet-500 mb-1 group-hover:scale-105 transition-transform drop-shadow-sm">20+</div>
             <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{t('languages')}</div>
           </div>
           <div className="hidden sm:block h-10 w-0.5 bg-brand-lavender/50 dark:bg-slate-800 rounded-full" />
           <div className="text-center group">
             <div className="text-3xl sm:text-5xl font-black text-purple-400 mb-1 group-hover:scale-105 transition-transform drop-shadow-sm">10k+</div>
             <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{t('friends')}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
