import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BookOpen, Sparkles, Search, User, Heart, LogOut, Clock, Star, Moon, Sun, Globe, Upload, X, BarChart2, Book as BookIcon } from 'lucide-react';
import { playSound } from './SoundEffects';
import { signOut } from '../services/supabase';
import { ViewType, AppLanguage, Book } from '../types';
import { getTranslation } from '../i18n';

interface NavbarProps {
  onNavigate: (view: ViewType) => void;
  onUploadClick: () => void;
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
  onNavigate, onUploadClick, activeView, user, onLoginClick, favoritesCount, 
  theme, toggleTheme, language, setLanguage, searchQuery, setSearchQuery,
  books, onReadBook
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const t = (key: any) => getTranslation(language, key);

  const handleNav = (view: ViewType) => {
    playSound('pop');
    onNavigate(view);
    setShowProfileMenu(false);
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`sticky top-0 z-[100] px-4 py-3 transition-colors duration-300 border-b-2 ${
      theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-100 shadow-sm'
    } backdrop-blur-md`}>
      <div className="w-full flex items-center justify-between gap-4 px-2 sm:px-6">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
          onClick={() => handleNav('library')}
        >
          <div className="bg-indigo-600 p-2 rounded-xl text-white group-hover:rotate-6 transition-all shadow-md">
            <BookOpen size={24} strokeWidth={3} />
          </div>
          <h1 className={`text-xl font-display font-bold tracking-tight hidden sm:block ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Mochi<span className="text-indigo-600">Reads</span>
          </h1>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-4xl relative group" ref={searchRef}>
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            <Search size={18} />
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
            className={`w-full pl-12 pr-10 py-2.5 rounded-2xl outline-none border-2 transition-all font-medium text-sm z-0 ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500 focus:bg-slate-900' 
                : 'bg-slate-50 border-slate-100 text-slate-700 focus:border-indigo-200 focus:bg-white'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[110] ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'
            }`}>
              <div className="p-2">
                <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggestions</p>
                {suggestions.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      playSound('pop');
                      setSearchQuery(book.title);
                      setShowSuggestions(false);
                      handleNav('library');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="w-10 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={book.coverImage} className="w-full h-full object-cover" alt={book.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{book.title}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{book.author}</p>
                    </div>
                    <BookIcon size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-1 mr-2">
            {[
              { id: 'latest', icon: <Clock size={18} />, label: t('recent') },
              { id: 'favorites', icon: <Heart size={18} />, label: t('favorites'), badge: favoritesCount > 0 },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNav(item.id as ViewType)}
                className={`p-2 rounded-xl transition-all relative ${
                  activeView === item.id 
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title={item.label}
              >
                {item.icon}
                {item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleNav('creator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all active:scale-95 group ${
              activeView === 'creator' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                : (theme === 'dark' ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100')
            }`}
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">Magic Lab</span>
          </button>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

          {user ? (
            <div className="relative">
              <button 
                onClick={() => { playSound('pop'); setShowProfileMenu(!showProfileMenu); }}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black border-2 transition-all hover:scale-105 ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                }`}
              >
                {user.email?.[0].toUpperCase()}
              </button>

              {showProfileMenu && (
                <div className={`absolute top-full right-0 mt-3 w-56 rounded-2xl shadow-xl border-2 p-2 animate-in slide-in-from-top-2 duration-200 z-[100] ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'
                }`}>
                  <div className={`px-4 py-2 border-b mb-1 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-50'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{user.email}</p>
                  </div>

                  <button 
                    onClick={() => handleNav('progress')}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-bold text-sm ${
                      activeView === 'progress' 
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                        : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50')
                    }`}
                  >
                    <BarChart2 size={16} />
                    My Progress
                  </button>

                  <button 
                    onClick={() => { onUploadClick(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors font-bold text-sm"
                  >
                    <Upload size={16} />
                    Upload Book
                  </button>
                  
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
              className={`p-2 rounded-xl transition-all ${
                theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <User size={22} />
            </button>
          )}

          <button 
            onClick={() => { playSound('pop'); toggleTheme(); }}
            className={`p-2 rounded-xl transition-all ${
              theme === 'dark' ? 'text-amber-400' : 'text-slate-400 hover:text-indigo-600'
            }`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;