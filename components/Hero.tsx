
import React from 'react';
import { Sparkles, ArrowRight, Stars } from 'lucide-react';
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
    <div className={`relative overflow-hidden pt-16 pb-24 px-4 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950' : 'bg-gradient-to-b from-purple-100 via-white to-white'
    }`}>
      {/* Playful Floating Shapes */}
      <div className={`absolute top-10 left-10 w-32 h-32 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob ${
        theme === 'dark' ? 'bg-purple-900' : 'bg-purple-200'
      }`} />
      <div className={`absolute top-20 right-20 w-48 h-48 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000 ${
        theme === 'dark' ? 'bg-indigo-900' : 'bg-fuchsia-200'
      }`} />
      <div className={`absolute -bottom-10 left-1/3 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-violet-200'
      }`} />

      <div className="max-w-5xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-black mb-8 animate-bounce shadow-sm border-2 ${
          theme === 'dark' ? 'bg-slate-800 text-purple-400 border-slate-700' : 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-50'
        }`}>
          <Stars size={18} />
          <span>{t('adventureAwaits')}</span>
        </div>
        
        <h1 className={`text-6xl sm:text-8xl font-display font-bold mb-6 leading-tight ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          {t('heroTitle').split('&')[0]} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600">
            & {t('heroTitle').split('&')[1]}
          </span>
        </h1>
        
        <p className={`text-2xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => { playSound('pop'); window.scrollTo({ top: 650, behavior: 'smooth' }); }}
            className="group px-10 py-5 bg-purple-600 text-white rounded-[2rem] font-black text-xl hover:bg-purple-700 transition-all flex items-center gap-3 w-full sm:w-auto justify-center shadow-[0_8px_0_0_#7e22ce] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#7e22ce] active:translate-y-[6px] active:shadow-none"
          >
            {t('startReading')}
            <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
          </button>
          
          <button 
            onClick={() => { playSound('pop'); onStartCreating(); }}
            className={`px-10 py-5 border-4 rounded-[2rem] font-black text-xl transition-all flex items-center gap-3 w-full sm:w-auto justify-center shadow-lg hover:scale-105 active:scale-95 ${
              theme === 'dark' 
                ? 'bg-slate-800 text-purple-400 border-slate-700 hover:border-purple-500 shadow-purple-900/10' 
                : 'bg-white text-fuchsia-600 border-fuchsia-100 hover:border-fuchsia-500 shadow-fuchsia-100'
            }`}
          >
            <Sparkles size={24} />
            {t('magicStoryLab')}
          </button>
        </div>

        <div className="mt-20 grid grid-cols-3 max-w-lg mx-auto gap-8">
          {[
            { label: t('stories'), value: '500+', color: 'purple' },
            { label: t('languages'), value: '20+', color: 'fuchsia' },
            { label: t('friends'), value: '10k+', color: 'indigo' }
          ].map(stat => (
            <div key={stat.label} className={`text-center p-4 rounded-3xl border-2 shadow-sm transition-transform hover:-translate-y-1 ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700' 
                : `bg-${stat.color}-50 border-${stat.color}-100`
            }`}>
              <div className={`text-3xl font-black text-${stat.color}-600`}>{stat.value}</div>
              <div className={`text-[10px] font-black text-${stat.color}-400 uppercase tracking-widest`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
