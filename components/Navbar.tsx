
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
    <nav className={`sticky top-0 z-50 w-full py-4 sm:py-5 transition-all duration-500 border-b-2 ${
      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-blue-50/50 shadow-xl'
    } backdrop-blur-2xl px-0`}>
      <div className="w-full px-4 sm:px-8 flex items-center justify-between gap-4">
        
        {/* Playful Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          onClick={() => handleNav('library')}
        >
          <div className="bg-brand-blue p-2 rounded-xl text-white group-hover:rotate-12 transition-all shadow-xl shadow-brand-blue/30 border-2 border-blue-400">
            <BookOpen size={20} className="sm:w-5 sm:h-5" strokeWidth={3} />
          </div>
          <h1 className={`text-xl sm:text-2xl font-display font-black tracking-tighter hidden sm:block ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Mochi<span className="text-brand-blue">Reads</span>
          </h1>
        </div>

        {/* Sticker-style Search Bar */}
        <div className="flex-1 max-w-2xl relative group min-w-0" ref={searchRef}>
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Search size={16} strokeWidth={3} />
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
            className={`w-full pl-10 pr-10 py-2.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm sm:text-base ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white focus:border-brand-purple focus:bg-slate-950' 
                : 'bg-blue-50/50 border-blue-50 text-slate-800 focus:border-brand-blue focus:bg-white shadow-inner'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}

          {/* Magical Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-4 rounded-2xl shadow-3xl border-2 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[110] ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'
            }`}>
              <div className="p-2">
                <p className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Magical Findings</p>
                {suggestions.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      playSound('pop');
                      setSearchQuery(book.title);
                      setShowSuggestions(false);
                      onReadBook(book);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-left transition-all ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-brand-blue/5'
                    }`}
                  >
                    <div className="w-8 h-10 flex-shrink-0 rounded-lg overflow-hidden border-2 border-slate-100 dark:border-slate-700">
                      <img src={book.coverImage} className="w-full h-full object-cover" alt={book.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.title}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">By {book.author}</p>
                    </div>
                    <Sparkles size={14} className="text-brand-purple animate-pulse" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fun Navigation Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={() => handleNav('favorites')}
            className={`p-2.5 rounded-xl transition-all relative group border-2 ${
              activeView === 'favorites' 
                ? 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900'
                : 'text-slate-400 border-transparent hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10'
            }`}
          >
            <Heart size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                {favoritesCount}
              </span>
            )}
          </button>

          <div className="relative" ref={langRef}>
            <button 
              onClick={() => { playSound('pop'); setShowLangMenu(!showLangMenu); }}
              className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-blue-50/50 border-blue-50 text-brand-blue hover:bg-blue-100'
              }`}
            >
              <Globe size={18} strokeWidth={3} />
            </button>
            {showLangMenu && (
              <div className={`absolute top-full right-0 mt-4 w-56 max-h-[50vh] overflow-y-auto rounded-2xl shadow-3xl border-2 p-3 animate-in slide-in-from-top-4 duration-300 z-[120] ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'
              }`}>
                {sortedLanguages.map((langCode) => (
                  <button
                    key={langCode}
                    onClick={() => handleLangSelect(langCode)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-[11px] font-black ${
                      language === langCode 
                        ? 'bg-brand-blue text-white' 
                        : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-blue-50')
                    }`}
                  >
                    <span>{translations[langCode].languageName}</span>
                    {language === langCode && <Check size={12} strokeWidth={4} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => handleNav('creator')}
            className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all active:scale-90 group border-2 ${
              activeView === 'creator' 
                ? 'bg-brand-purple border-purple-400 text-white shadow-xl shadow-brand-purple/20' 
                : (isDark ? 'bg-slate-800 text-brand-purple border-slate-700' : 'bg-magic-purple border-purple-100 text-brand-purple hover:scale-105')
            }`}
          >
            <Sparkles size={16} className="group-hover:animate-sparkle" />
            <span className="uppercase tracking-[0.1em] text-[10px]">Lab</span>
          </button>

          {user ? (
            <button 
              onClick={() => { playSound('pop'); setShowProfileMenu(!showProfileMenu); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all hover:scale-110 active:scale-90 shadow-xl ${
                isDark ? 'bg-slate-800 border-slate-700 text-brand-blue' : 'bg-white border-blue-50 text-brand-blue'
              }`}
            >
              {user.email?.[0].toUpperCase()}
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className={`p-2.5 rounded-xl transition-all border-2 tactile-button ${
                isDark ? 'text-slate-400 border-slate-800 bg-slate-800' : 'text-slate-500 border-blue-50 bg-white'
              }`}
            >
              <User size={18} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
