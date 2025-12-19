
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
    <div className="relative overflow-hidden min-h-[75vh] flex items-center justify-center w-full px-6 sm:px-12 py-20 sm:py-32">
      {/* Immersive Edge-to-Edge Background Elements */}
      <div className="absolute top-[-25%] left-[-15%] w-[80vw] h-[80vw] bg-brand-purple/15 dark:bg-brand-purple/10 filter blur-[140px] animate-morph pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[80vw] h-[80vw] bg-brand-cyan/15 dark:bg-brand-cyan/10 filter blur-[140px] animate-morph animation-delay-2000 pointer-events-none" />

      <div className="w-full text-center relative z-10 animate-in fade-in slide-up duration-700 ease-out">
        <div className={`inline-flex items-center gap-4 px-8 py-3 rounded-full text-[11px] font-black mb-12 border-2 animate-bounce-slow ${
          isDark ? 'bg-slate-800/90 text-brand-lavender border-slate-700 backdrop-blur-md' : 'bg-white/90 text-brand-purple border-brand-lavender backdrop-blur-md shadow-md'
        }`}>
          <Stars size={18} fill="currentColor" strokeWidth={0} className="text-brand-purple" />
          <span className="tracking-[0.4em] uppercase">{t('adventureAwaits')}</span>
        </div>
        
        <h1 className={`text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-display font-black mb-12 leading-[1.1] tracking-tight w-full max-w-7xl mx-auto px-4 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {t('heroTitle').split('&')[0]} <br className="hidden md:block" />
          <span className="magic-purple-text">
            & {t('heroTitle').split('&')[1]}
          </span>
        </h1>
        
        <p className={`text-xl sm:text-3xl mb-16 max-w-5xl mx-auto font-bold opacity-90 leading-relaxed px-8 tracking-wide ${
          isDark ? 'text-slate-200' : 'text-slate-700'
        }`}>
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full px-6 max-w-4xl mx-auto">
          <button 
            onClick={() => { playSound('pop'); document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="group relative px-12 py-6 bg-brand-purple text-white rounded-[2rem] font-black text-2xl flex items-center gap-4 w-full sm:w-auto justify-center tactile-button shadow-2xl shadow-brand-purple/30 border-2 border-transparent tracking-wider"
          >
            <BookOpen size={28} strokeWidth={3} className="group-hover:rotate-6 transition-transform" />
            {t('startReading')}
          </button>
          
          <button 
            onClick={() => { playSound('pop'); onStartCreating(); }}
            className={`group relative px-12 py-6 border-2 rounded-[2rem] font-black text-2xl flex items-center gap-4 w-full sm:w-auto justify-center transition-all tactile-button tracking-wider ${
              isDark 
                ? 'bg-slate-800/80 text-brand-lavender border-slate-700 hover:bg-slate-800' 
                : 'bg-white text-brand-purple border-brand-lavender hover:bg-white/95 shadow-lg'
            }`}
          >
            <Sparkles size={28} fill="currentColor" strokeWidth={0} className="group-hover:animate-sparkle" />
            {t('magicStoryLab')}
          </button>
        </div>

        {/* Cinematic Mini-stats Bar */}
        <div className="mt-32 flex flex-wrap justify-center items-center gap-12 md:gap-24">
           <div className="text-center group">
             <div className="text-4xl sm:text-6xl font-black text-brand-rose mb-3 group-hover:scale-105 transition-transform drop-shadow-md tracking-tighter">500+</div>
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">{t('stories')}</div>
           </div>
           <div className="hidden sm:block h-14 w-1 bg-brand-lavender/60 dark:bg-slate-800 rounded-full" />
           <div className="text-center group">
             <div className="text-4xl sm:text-6xl font-black text-brand-amber mb-3 group-hover:scale-105 transition-transform drop-shadow-md tracking-tighter">20+</div>
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">{t('languages')}</div>
           </div>
           <div className="hidden sm:block h-14 w-1 bg-brand-lavender/60 dark:bg-slate-800 rounded-full" />
           <div className="text-center group">
             <div className="text-4xl sm:text-6xl font-black text-brand-cyan mb-3 group-hover:scale-105 transition-transform drop-shadow-md tracking-tighter">10k+</div>
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">{t('friends')}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
