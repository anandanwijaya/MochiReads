
import React from 'react';
import { Trophy, Star, Shield, Zap, Heart, Map, Sparkles, Medal, BookOpen, Globe } from 'lucide-react';
import { playSound } from './SoundEffects';

interface AchievementsProps {
  finishedCount: number;
  languageCount: number;
  theme: 'light' | 'dark';
}

const Achievements: React.FC<AchievementsProps> = ({ finishedCount, languageCount, theme }) => {
  const isDark = theme === 'dark';

  const badges = [
    { id: 'first-step', title: 'First Adventure', icon: <Map className="text-brand-rose" />, desc: 'Finished 1 story!', requirement: 1 },
    { id: 'bookworm', title: 'Super Reader', icon: <Heart className="text-brand-rose" />, desc: 'Finished 5 stories!', requirement: 5 },
    { id: 'librarian', title: 'Library Legend', icon: <Trophy className="text-brand-amber" />, desc: 'Finished 10 stories!', requirement: 10 },
    { id: 'polyglot', title: 'World Traveler', icon: <Globe className="text-brand-cyan" />, desc: 'Read in 3 languages!', requirement: 3, type: 'lang' },
    { id: 'creator', title: 'Magic Maker', icon: <Zap className="text-brand-purple" />, desc: 'Created 1 story!', requirement: 1, type: 'create' },
  ];

  const handleStickerClick = () => {
    playSound('pop');
  };

  return (
    <div className="py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center mb-16">
        <div className="p-5 bg-brand-lavender rounded-[2rem] text-brand-purple mb-6 shadow-xl animate-float border-4 border-white">
          <Trophy size={40} />
        </div>
        <h2 className={`text-4xl sm:text-6xl font-display font-black mb-4 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
          My Magic Sticker Book
        </h2>
        <p className={`text-lg sm:text-xl font-bold max-w-2xl text-center opacity-80 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Earn stickers by reading and creating stories. Can you collect them all?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-10">
        {badges.map((badge) => {
          const isUnlocked = badge.type === 'lang' 
            ? languageCount >= badge.requirement 
            : finishedCount >= badge.requirement;
            
          return (
            <div 
              key={badge.id}
              onClick={isUnlocked ? handleStickerClick : undefined}
              className={`relative flex flex-col items-center p-8 rounded-[3rem] border-4 transition-all duration-300 ${
                isUnlocked 
                  ? `${isDark ? 'bg-slate-900 border-brand-purple/50 shadow-brand-purple/20' : 'bg-white border-brand-lavender shadow-xl'} hover:scale-105 cursor-pointer tactile-button` 
                  : `opacity-30 grayscale ${isDark ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-100'}`
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 ${
                isUnlocked ? 'bg-brand-lavender border-white shadow-inner' : 'bg-slate-200 border-slate-300'
              }`}>
                {React.cloneElement(badge.icon as React.ReactElement, { size: 32 })}
              </div>
              
              <h3 className={`font-display font-black text-lg mb-1 text-center leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {badge.title}
              </h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">
                {badge.desc}
              </p>

              {isUnlocked && (
                <div className="absolute -top-3 -right-3 p-2 bg-brand-purple rounded-full text-white shadow-lg animate-bounce-slow border-2 border-white">
                  <Sparkles size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Stats Board - Rainbow Palette */}
      <div className={`mt-20 p-8 sm:p-12 rounded-[4rem] border-[6px] border-dashed flex flex-wrap justify-around gap-12 transition-colors ${
        isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-brand-lavender shadow-inner'
      }`}>
        <div className="text-center group cursor-default">
          <div className="text-5xl sm:text-7xl font-display font-black text-brand-rose mb-2 transition-transform group-hover:scale-110">{finishedCount}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Books Read</div>
        </div>
        <div className="text-center group cursor-default">
          <div className="text-5xl sm:text-7xl font-display font-black text-brand-cyan mb-2 transition-transform group-hover:scale-110">{languageCount}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Worlds Visited</div>
        </div>
        <div className="text-center group cursor-default">
          <div className="text-5xl sm:text-7xl font-display font-black text-brand-amber mb-2 transition-transform group-hover:scale-110">{finishedCount * 5}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Stars Earned</div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
