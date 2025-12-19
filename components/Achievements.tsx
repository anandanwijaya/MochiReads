
import React from 'react';
import { Trophy, Star, Shield, Zap, Heart, Map, Sparkles, Medal } from 'lucide-react';
import { playSound } from './SoundEffects';

interface AchievementsProps {
  finishedCount: number;
  languageCount: number;
  theme: 'light' | 'dark';
}

const Achievements: React.FC<AchievementsProps> = ({ finishedCount, languageCount, theme }) => {
  const isDark = theme === 'dark';

  const badges = [
    { id: 'first-step', title: 'First Adventure', icon: <Map className="text-emerald-500" />, desc: 'Finished 1 story!', requirement: 1 },
    { id: 'bookworm', title: 'Super Reader', icon: <Heart className="text-rose-500" />, desc: 'Finished 5 stories!', requirement: 5 },
    { id: 'librarian', title: 'Library Legend', icon: <Trophy className="text-amber-500" />, desc: 'Finished 10 stories!', requirement: 10 },
    { id: 'polyglot', title: 'World Traveler', icon: <Shield className="text-indigo-500" />, desc: 'Read in 3 languages!', requirement: 3, type: 'lang' },
    { id: 'creator', title: 'Magic Maker', icon: <Zap className="text-fuchsia-500" />, desc: 'Created 1 story!', requirement: 1, type: 'create' },
  ];

  const handleStickerClick = () => {
    playSound('pop');
  };

  return (
    <div className="py-12 px-4 sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center mb-16">
        <div className="p-4 bg-amber-100 rounded-[2rem] text-amber-600 mb-6 shadow-xl animate-float">
          <Trophy size={48} />
        </div>
        <h2 className={`text-5xl font-display font-bold mb-4 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
          My Sticker Book
        </h2>
        <p className={`text-xl font-medium max-w-2xl text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Keep reading to unlock magical stickers and fill your adventure map!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {badges.map((badge) => {
          const isUnlocked = badge.type === 'lang' 
            ? languageCount >= badge.requirement 
            : finishedCount >= badge.requirement;
            
          return (
            <div 
              key={badge.id}
              onClick={isUnlocked ? handleStickerClick : undefined}
              className={`relative flex flex-col items-center p-8 rounded-[3rem] border-4 transition-all duration-500 ${
                isUnlocked 
                  ? `${isDark ? 'bg-slate-900 border-indigo-500 shadow-indigo-500/20 shadow-2xl' : 'bg-white border-indigo-200 shadow-xl'} hover:scale-105 cursor-pointer tactile-button` 
                  : `opacity-40 grayscale blur-[1px] ${isDark ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-100'}`
              }`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 ${
                isUnlocked ? 'bg-indigo-50 border-white shadow-inner' : 'bg-slate-200 border-slate-300'
              }`}>
                {React.cloneElement(badge.icon as React.ReactElement, { size: 40 })}
              </div>
              
              <h3 className={`font-display font-bold text-xl mb-2 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {badge.title}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                {badge.desc}
              </p>

              {!isUnlocked && (
                <div className="absolute top-4 right-4 text-slate-400">
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                </div>
              )}
              
              {isUnlocked && (
                <div className="absolute -top-3 -right-3 p-2 bg-amber-400 rounded-full text-white shadow-lg animate-bounce-slow">
                  <Sparkles size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Board */}
      <div className={`mt-20 p-10 rounded-[4rem] border-8 border-dashed flex flex-wrap justify-around gap-12 ${
        isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-indigo-50/50 border-white shadow-inner'
      }`}>
        <div className="text-center">
          <div className="text-6xl font-display font-black text-indigo-500 mb-2">{finishedCount}</div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Books Finished</div>
        </div>
        <div className="text-center">
          <div className="text-6xl font-display font-black text-fuchsia-500 mb-2">{languageCount}</div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Languages Explored</div>
        </div>
        <div className="text-center">
          <div className="text-6xl font-display font-black text-amber-500 mb-2">{finishedCount * 10}</div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Stars Earned</div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
