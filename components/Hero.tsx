
import React from 'react';
import { Sparkles, Stars, BookOpen, Users, Globe } from 'lucide-react';
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
    <div className="relative overflow-visible min-h-[90vh] flex flex-col items-center justify-center w-full px-6 py-12 sm:py-24">
      {/* Dynamic Aesthetic Background Blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] bg-brand-purple/15 blur-[120px] animate-morph pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] bg-brand-pink/15 blur-[120px] animate-morph animation-delay-2000 pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-brand-amber/10 blur-[100px] animate-pulse pointer-events-none" />

      <div className="w-full text-center relative z-10 animate-in fade-in slide-up duration-700 overflow-visible">
        <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-[11px] font-black mb-10 border-2 shadow-sm ${
          isDark ? 'bg-slate-800 text-brand-lavender border-slate-700' : 'bg-white text-brand-purple border-brand-lavender'
        }`}>
          <Stars size={18} fill="currentColor" className="text-brand-amber animate-pulse" />
          <span className="tracking-[0.3em] uppercase">{t('adventureAwaits')}</span>
        </div>
        
        {/* Adjusted padding and line height for title to prevent character clipping */}
        <h1 className={`text-5xl sm:text-7xl lg:text-9xl font-display font-black mb-10 leading-[1.25] pb-8 tracking-tight px-10 overflow-visible ${
          isDark ? 'text-white' : 'text-brand-violet'
        }`}>
          {t('heroTitle').includes('&') ? (
            <div className="flex flex-col items-center">
              <span>{t('heroTitle').split('&')[0]}</span>
              <span className="magic-purple-text italic">& {t('heroTitle').split('&')[1]}</span>
            </div>
          ) : (
            <span className="magic-purple-text">{t('heroTitle')}</span>
          )}
        </h1>
        
        <p className={`text-xl sm:text-3xl mb-16 max-w-4xl mx-auto font-bold opacity-90 leading-relaxed tracking-wide ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-3xl mx-auto mb-20">
          <button 
            onClick={() => { playSound('pop'); document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="px-12 py-6 bg-brand-purple text-white rounded-[2.5rem] font-black text-2xl flex items-center gap-4 w-full sm:w-auto justify-center tactile-button tracking-[0.1em] group"
          >
            <BookOpen size={28} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            {t('startReading')}
          </button>
          
          <button 
            onClick={() => { playSound('pop'); onStartCreating(); }}
            className="px-12 py-6 bg-white text-brand-purple border-4 border-brand-lavender rounded-[2.5rem] font-black text-2xl flex items-center gap-4 w-full sm:w-auto justify-center transition-all puffy-shadow tracking-[0.1em] hover:bg-brand-lavender group"
          >
            <Sparkles size={28} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
            {t('magicStoryLab')}
          </button>
        </div>

        {/* Updated Stats Section: Final design match */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 md:gap-24">
          <div className="flex flex-col items-center transition-transform hover:scale-105">
            <div className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-brand-rose drop-shadow-md">
              500+
            </div>
            <div className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
              STORIES
            </div>
          </div>

          <div className="hidden md:block h-20 w-1 bg-slate-200/50 dark:bg-slate-800 rounded-full" />

          <div className="flex flex-col items-center transition-transform hover:scale-105">
            <div className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-brand-amber drop-shadow-md">
              20+
            </div>
            <div className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
              LANGUAGES
            </div>
          </div>

          <div className="hidden md:block h-20 w-1 bg-slate-200/50 dark:bg-slate-800 rounded-full" />

          <div className="flex flex-col items-center transition-transform hover:scale-105">
            <div className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-brand-cyan drop-shadow-md">
              10k+
            </div>
            <div className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
              FRIENDS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
