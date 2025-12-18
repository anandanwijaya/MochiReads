
import React, { useState } from 'react';
import { BookOpen, Sparkles, Search, User, Heart, LogOut, Clock, Star, Moon, Sun, Globe } from 'lucide-react';
import { playSound } from './SoundEffects';
import { signOut } from '../services/supabase';
import { ViewType, AppLanguage } from '../types';
import { getTranslation } from '../i18n';

interface NavbarProps {
  onNavigate: (view: ViewType) => void;
  activeView: ViewType;
  user: any;
  onLoginClick: () => void;
  favoritesCount: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, activeView, user, onLoginClick, favoritesCount, 
  theme, toggleTheme, language, setLanguage 
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = (key: any) => getTranslation(language, key);

  const handleNav = (view: ViewType) => {
    playSound('pop');
    onNavigate(view);
    setShowProfileMenu(false);
  };

  const handleLangSelect = (lang: AppLanguage) => {
    playSound('pop');
    setLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <nav className={`sticky top-0 z-50 px-4 py-3 transition-colors duration-300 border-b-4 ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleNav('library')}
        >
          <div className="bg-purple-600 p-2.5 rounded-2xl text-white group-hover:rotate-12 group-hover:scale-110 transition-all shadow-md">
            <BookOpen size={24} strokeWidth={3} />
          </div>
          <h1 className={`text-2xl font-playful font-bold tracking-tight hidden lg:block ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Mochi<span className="text-purple-600">Reads</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border-2 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
          }`}>
            {[
              { id: 'library', icon: <Search size={20} />, color: 'text-purple-600', label: t('library') },
              { id: 'latest', icon: <Clock size={20} />, color: 'text-amber-500', label: t('recent') },
              { id: 'favorites', icon: <Heart size={20} />, color: 'text-fuchsia-600', label: t('favorites'), badge: favoritesCount > 0 },
              { id: 'recommendations', icon: <Star size={20} />, color: 'text-indigo-500', label: t('forYou') }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNav(item.id as ViewType)}
                className={`p-2.5 rounded-xl transition-all relative group hover:scale-105 ${
                  activeView === item.id 
                    ? (theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white shadow-sm ' + item.color)
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title={item.label}
              >
                {item.icon}
                {item.badge && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-fuchsia-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                )}
              </button>
            ))}
          </nav>

          <button 
            onClick={() => handleNav('creator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 group ${
              activeView === 'creator' 
                ? 'bg-fuchsia-600 text-white shadow-[0_4px_0_0_#a21caf]' 
                : (theme === 'dark' ? 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-2 border-slate-100 hover:bg-fuchsia-50')
            }`}
          >
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">{t('magicLab')}</span>
          </button>

          <div className="h-10 w-[2px] bg-slate-100 dark:bg-slate-800 mx-1 rounded-full" />

          {/* Theme Switcher */}
          <button 
            onClick={() => { playSound('pop'); toggleTheme(); }}
            className={`p-2.5 rounded-2xl transition-all hover:scale-110 active:rotate-45 ${
              theme === 'dark' ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => { playSound('pop'); setShowLangMenu(!showLangMenu); }}
              className={`p-2.5 rounded-2xl transition-all hover:scale-110 ${
                theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Globe size={20} />
            </button>
            {showLangMenu && (
              <div className={`absolute top-full right-0 mt-3 w-40 rounded-2xl shadow-xl border-2 p-2 animate-in slide-in-from-top-2 duration-200 z-[100] ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-50'
              }`}>
                {(['en', 'ms', 'id'] as AppLanguage[]).map(lang => (
                  <button 
                    key={lang}
                    onClick={() => handleLangSelect(lang)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      language === lang 
                        ? 'bg-purple-600 text-white' 
                        : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50')
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'ms' ? 'B. Melayu' : 'Indonesia'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => { playSound('pop'); setShowProfileMenu(!showProfileMenu); }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black border-2 transition-all hover:scale-105 active:scale-95 ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-purple-400 hover:bg-slate-700' : 'bg-purple-100 border-purple-200 text-purple-600 hover:bg-purple-200'
                }`}
              >
                {user.email?.[0].toUpperCase() || <User size={20} />}
              </button>

              {showProfileMenu && (
                <div className={`absolute top-full right-0 mt-3 w-56 rounded-2xl shadow-xl border-2 p-2 animate-in slide-in-from-top-2 duration-200 z-[100] ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-50'
                }`}>
                  <div className={`px-4 py-2 border-b mb-1 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-50'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{user.email}</p>
                  </div>
                  
                  <button 
                    onClick={async () => { playSound('pop'); await signOut(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold text-sm"
                  >
                    <LogOut size={16} />
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold border-2 transition-all active:scale-95 ${
                theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500 hover:text-white' 
                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-purple-200 hover:text-purple-600'
              }`}
            >
              <User size={20} />
              <span className="hidden sm:inline">{t('signIn')}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
