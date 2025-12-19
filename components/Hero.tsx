
import React from 'react';
import { Sparkles, ArrowRight, Stars, BookOpen } from 'lucide-react';
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

  return (
    <div className={`relative overflow-hidden pt-20 pb-28 transition-colors duration-500 w-full ${
      theme === 'dark' ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-b from-purple-100 via-white to-white'
    }`}>
      {/* Playful Floating Shapes */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-magic-lemon rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute top-40 right-10 w-64 h-64 bg-magic-sky rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-magic-coral rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse-soft" />

      {/* Content Container */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 text-center relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className={`inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-[13px] font-black mb-10 shadow-xl border-4 animate-bounce-slow transition-all sparkle-container cursor-default ${
          theme === 'dark' ? 'bg-slate-800 text-purple-400 border-slate-700' : 'bg-white text-indigo-600 border-purple-50'
        }`}>
          <Stars size={18} fill="currentColor" strokeWidth={0} className="text-amber-400" />
          <span className="tracking-[0.2em] uppercase">{t('adventureAwaits')}</span>
        </div>
        
        <h1 className={`text-6xl sm:text-8xl lg:text-[9.5rem] font-display font-bold mb-8 leading-[0.85] tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          {t('heroTitle').split('&')[0]} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-orange-500">
            & {t('heroTitle').split('&')[1]}
          </span>
        </h1>
        
        <p className={`text-xl sm:text-2xl lg:text-3xl mb-14 max-w-4xl mx-auto font-medium leading-relaxed opacity-80 ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <button 
            onClick={() => { playSound('pop'); document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="group relative px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl flex items-center gap-4 w-full sm:w-auto justify-center tactile-button shadow-indigo-200 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-4">
               {t('startReading')}
               <BookOpen size={28} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button 
            onClick={() => { playSound('pop'); onStartCreating(); }}
            className={`group relative px-12 py-6 border-4 rounded-[2.5rem] font-black text-2xl transition-all flex items-center gap-4 w-full sm:w-auto justify-center tactile-button overflow-hidden ${
              theme === 'dark' 
                ? 'bg-slate-800 text-purple-400 border-slate-700 shadow-purple-900/40' 
                : 'bg-white text-fuchsia-600 border-fuchsia-50 shadow-fuchsia-100'
            }`}
          >
            <span className="relative z-10 flex items-center gap-4">
              <Sparkles size={28} fill="currentColor" strokeWidth={0} className="group-hover:animate-pulse" />
              {t('magicStoryLab')}
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/10 to-purple-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>

        <div className="mt-28 grid grid-cols-3 max-w-3xl mx-auto gap-6 sm:gap-10">
          {[
            { label: t('stories'), value: '500+', color: 'indigo', bg: 'bg-indigo-50' },
            { label: t('languages'), value: '20+', color: 'fuchsia', bg: 'bg-fuchsia-50' },
            { label: t('friends'), value: '10k+', color: 'amber', bg: 'bg-amber-50' }
          ].map(stat => (
            <div key={stat.label} className={`text-center p-8 rounded-[3rem] border-4 transition-all hover:-translate-y-2 hover:scale-[1.05] group cursor-default ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/30' 
                : `${stat.bg} border-white shadow-lg shadow-black/5 hover:shadow-indigo-500/10`
            }`}>
              <div className={`text-4xl sm:text-5xl font-black text-${stat.color}-500 group-hover:scale-110 transition-transform duration-500`}>{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 group-hover:text-indigo-400 transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
