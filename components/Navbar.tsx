
import { BarChart2, BookOpen, Globe, Heart, LogOut, Search, Sparkles, Upload, User, X, Check, Database } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getTranslation, translations } from '../i18n';
import { signOut } from '../services/supabase';
import { AppLanguage, Book, ViewType } from '../types';
import { playSound } from './SoundEffects';

interface NavbarProps {
  onNavigate: (view: ViewType) => void;
  onUploadClick: () => void;
  onSeedClick: () => void;
  activeView: ViewType;
  user: any;
  onLoginClick: () => void;
  favoritesCount: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  books: Book[];
  onReadBook: (book: Book) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, onUploadClick, onSeedClick, activeView, user, onLoginClick, favoritesCount, 
  theme, toggleTheme, language, setLanguage, searchQuery, setSearchQuery,
  books, onReadBook
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';
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

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return books.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [books, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedLanguages = useMemo(() => {
    return (Object.keys(translations) as AppLanguage[]).sort((a, b) => 
      translations[a].languageName.localeCompare(translations[b].languageName)
    );
  }, []);

  return (
    <nav className={`sticky top-0 z-50 px-6 sm:px-10 py-6 sm:py-8 transition-all duration-500 border-b-[6px] ${
      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-blue-50/50 shadow-xl'
    } backdrop-blur-2xl`}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-6 sm:gap-12">
        
        {/* Playful Brand Logo */}
        <div 
          className="flex items-center gap-4 cursor-pointer group flex-shrink-0"
          onClick={() => handleNav('library')}
        >
          <div className="bg-brand-blue p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] text-white group-hover:rotate-12 transition-all shadow-xl shadow-brand-blue/30 border-2 border-blue-400">
            <BookOpen size={32} className="sm:w-10 sm:h-10" strokeWidth={3} />
          </div>
          <h1 className={`text-3xl sm:text-4xl font-display font-black tracking-tighter hidden lg:block ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Mochi<span className="text-brand-blue">Reads</span>
          </h1>
        </div>

        {/* Sticker-style Search Bar */}
        <div className="flex-1 max-w-2xl relative group min-w-0" ref={searchRef}>
          <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors z-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Search size={26} strokeWidth={3} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder={t('library') + '...'}
            className={`w-full pl-16 pr-14 py-4 sm:py-5 rounded-[2rem] sm:rounded-[2.5rem] outline-none border-[6px] transition-all font-black text-lg sm:text-xl ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white focus:border-brand-purple focus:bg-slate-950' 
                : 'bg-blue-50/50 border-blue-50 text-slate-800 focus:border-brand-blue focus:bg-white shadow-inner'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
            >
              <X size={22} strokeWidth={3} />
            </button>
          )}

          {/* Magical Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-6 rounded-[3rem] shadow-3xl border-[6px] overflow-hidden animate-in fade-in slide-in-from-top-6 duration-300 z-[110] ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'
            }`}>
              <div className="p-6">
                <p className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Magical Findings</p>
                {suggestions.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      playSound('pop');
                      setSearchQuery(book.title);
                      setShowSuggestions(false);
                      onReadBook(book);
                    }}
                    className={`w-full flex items-center gap-8 px-8 py-5 rounded-[2rem] text-left transition-all ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-brand-blue/5'
                    }`}
                  >
                    <div className="w-16 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-[4px] border-slate-100 dark:border-slate-700 shadow-lg">
                      <img src={book.coverImage} className="w-full h-full object-cover" alt={book.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xl font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.title}</p>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">By {book.author}</p>
                    </div>
                    <Sparkles size={24} className="text-brand-purple animate-pulse" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fun Navigation Buttons */}
        <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => handleNav('favorites')}
              className={`p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] transition-all relative group border-4 ${
                activeView === 'favorites' 
                  ? 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900'
                  : 'text-slate-400 border-transparent hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10'
              }`}
            >
              <Heart size={30} strokeWidth={3} className="group-hover:scale-125 transition-transform" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-8 h-8 bg-rose-500 text-white text-xs font-black flex items-center justify-center rounded-full border-[4px] border-white dark:border-slate-900">
                  {favoritesCount}
                </span>
              )}
            </button>

            <div className="relative" ref={langRef}>
              <button 
                onClick={() => { playSound('pop'); setShowLangMenu(!showLangMenu); }}
                className={`p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border-[6px] transition-all flex items-center gap-4 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-blue-50/50 border-blue-50 text-brand-blue hover:bg-blue-100 shadow-sm'
                }`}
              >
                <Globe size={30} strokeWidth={3} />
                <span className="hidden xl:inline text-sm font-black uppercase tracking-widest">{language}</span>
              </button>
              {showLangMenu && (
                <div className={`absolute top-full right-0 mt-6 w-80 max-h-[75vh] overflow-y-auto rounded-[3rem] shadow-3xl border-[6px] p-6 animate-in slide-in-from-top-6 duration-300 z-[120] ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'
                }`}>
                  <div className="p-2 space-y-3">
                    {sortedLanguages.map((langCode) => (
                      <button
                        key={langCode}
                        onClick={() => handleLangSelect(langCode)}
                        className={`w-full flex items-center justify-between gap-5 px-6 py-5 rounded-[1.5rem] text-left transition-all text-base font-black ${
                          language === langCode 
                            ? 'bg-brand-blue text-white shadow-2xl' 
                            : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-blue-50')
                        }`}
                      >
                        <span>{translations[langCode].languageName}</span>
                        {language === langCode && <Check size={24} strokeWidth={4} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => handleNav('creator')}
            className={`hidden sm:flex items-center gap-4 px-8 py-5 rounded-[2rem] sm:rounded-[2.5rem] font-black transition-all active:scale-90 group border-[6px] ${
              activeView === 'creator' 
                ? 'bg-brand-purple border-purple-400 text-white shadow-2xl shadow-brand-purple/40' 
                : (isDark ? 'bg-slate-800 text-brand-purple border-slate-700' : 'bg-magic-purple border-purple-100 text-brand-purple hover:scale-105 shadow-md shadow-brand-purple/5')
            }`}
          >
            <Sparkles size={28} className="group-hover:animate-sparkle" />
            <span className="hidden md:inline uppercase tracking-[0.2em] text-base">Story Lab</span>
          </button>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => { playSound('pop'); setShowProfileMenu(!showProfileMenu); }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black border-[6px] transition-all hover:scale-110 active:scale-90 shadow-2xl ${
                  isDark ? 'bg-slate-800 border-slate-700 text-brand-blue' : 'bg-white border-blue-50 text-brand-blue'
                }`}
              >
                {user.email?.[0].toUpperCase()}
              </button>

              {showProfileMenu && (
                <div className={`absolute top-full right-0 mt-6 w-80 rounded-[3rem] shadow-3xl border-[6px] p-6 animate-in slide-in-from-top-6 duration-300 z-[100] ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-50'
                }`}>
                  <div className={`px-6 py-5 border-b-[4px] mb-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-2">Signed in</p>
                    <p className={`text-base font-black truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{user.email}</p>
                  </div>

                  {[
                    { label: 'My Progress', icon: <BarChart2 size={24} />, view: 'progress' },
                    { label: 'Upload Story', icon: <Upload size={24} />, action: () => onUploadClick() },
                    { label: 'Magic Settings', icon: <Database size={24} />, action: () => onSeedClick() }
                  ].map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => { if(item.view) handleNav(item.view as ViewType); if(item.action) { item.action(); setShowProfileMenu(false); } }}
                      className="w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-black text-base text-slate-600 dark:text-slate-300"
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  
                  <div className={`h-1.5 my-4 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />

                  <button 
                    onClick={async () => { playSound('pop'); await signOut(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-5 px-6 py-5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-[1.5rem] transition-colors font-black text-base"
                  >
                    <LogOut size={24} /> {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className={`p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] transition-all border-[6px] tactile-button ${
                isDark ? 'text-slate-400 border-slate-800 bg-slate-800' : 'text-slate-500 border-blue-50 bg-white'
              }`}
            >
              <User size={30} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
