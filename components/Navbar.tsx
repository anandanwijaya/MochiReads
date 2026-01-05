
import { BookOpen, Globe, Heart, Search, Sparkles, User, X, Check, Menu, Clock, ChevronDown, PenTool, Upload, LogOut } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getTranslation, translations } from '../i18n';
import { AppLanguage, Book, ViewType } from '../types';
import { playSound } from './SoundEffects';
import { signOut } from '../services/supabase';

interface NavbarProps {
  onNavigate: (view: ViewType) => void;
  onUploadClick: () => void;
  onSeedClick: () => void;
  activeView: ViewType;
  user: any;
  onLogout: () => void;
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
  onNavigate, onUploadClick, activeView, user, onLogout, onLoginClick, favoritesCount, 
  theme, language, setLanguage, searchQuery, setSearchQuery,
  books, onReadBook
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';
  const t = (key: any) => getTranslation(language, key);

  const handleNav = (view: ViewType) => {
    playSound('pop');
    onNavigate(view);
    setShowShelfDropdown(false);
    setShowLangDropdown(false);
    setShowUserDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLangChange = (lang: AppLanguage) => {
    playSound('pop');
    setLanguage(lang);
    setShowLangDropdown(false);
  };

  const handleLogoutClick = async () => {
    playSound('woosh');
    await signOut();
    onLogout();
    setShowUserDropdown(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.pageYOffset;
      setScrollProgress(totalScroll > 0 ? (currentScroll / totalScroll) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const handleClickOutside = (event: MouseEvent) => {
      if (shelfRef.current && !shelfRef.current.contains(event.target as Node)) {
        setShowShelfDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [books, searchQuery]);

  const languages: { code: AppLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ms', label: 'Melayu' },
    { code: 'id', label: 'Indonesian' },
    { code: 'zh', label: '中文' },
    { code: 'th', label: 'ไทย' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'tl', label: 'Tagalog' },
    { code: 'vi', label: 'Tiếng Việt' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] w-full py-3 sm:py-4 transition-all duration-300 border-b-4 ${
      isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/95 border-brand-lavender shadow-lg'
    } backdrop-blur-xl`}>
      <div 
        className="absolute bottom-[-4px] left-0 h-1 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-amber transition-all duration-300 ease-out z-10 rounded-full"
        style={{ width: `${scrollProgress}%` }}
      />
      
      <div className="w-full px-4 sm:px-12 flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group shrink-0" onClick={() => handleNav('library')}>
          <div className="bg-brand-purple p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-white group-hover:rotate-6 transition-all shadow-md border-2 border-white/20">
            <BookOpen size={24} strokeWidth={3} />
          </div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-display font-black tracking-tight hidden xs:block ${isDark ? 'text-white' : 'text-brand-violet'}`}>
            Mochi<span className="text-brand-pink">Reads</span>
          </h1>
        </div>

        <div className="flex-1 max-w-lg relative group mx-2 sm:mx-0" ref={searchRef}>
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${isDark ? 'text-slate-500' : 'text-brand-purple'}`}>
            <Search size={18} strokeWidth={3} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('library') + '...'}
            className={`w-full pl-10 pr-10 py-2 sm:py-3 rounded-xl sm:rounded-2xl outline-none border-4 transition-all font-bold text-sm sm:text-base ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-white focus:border-brand-purple' 
                : 'bg-brand-softPurple border-brand-lavender text-slate-900 focus:border-brand-purple focus:bg-white'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-rose transition-colors"
            >
              <X size={16} strokeWidth={3} />
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-3 rounded-2xl sm:rounded-3xl shadow-2xl border-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-brand-lavender'
            }`}>
              <div className="p-2">
                {suggestions.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      playSound('pop');
                      setSearchQuery(book.title);
                      setShowSuggestions(false);
                      onReadBook(book);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-brand-lavender'
                    }`}
                  >
                    <div className="w-8 h-12 rounded-lg overflow-hidden shrink-0 border-2 border-slate-200 shadow-sm">
                      <img src={book.coverImage} className="w-full h-full object-cover" alt={book.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>{book.title}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{book.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={() => { playSound('pop'); onUploadClick(); }}
            className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all border-2 group ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-brand-blue' : 'bg-brand-lavender text-brand-purple border-transparent hover:border-brand-purple/20'
            }`}
            title="Upload Book"
          >
            <Upload size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase hidden xl:inline tracking-widest">Upload</span>
          </button>

          <div className="relative" ref={langRef}>
            <button 
              onClick={() => { playSound('pop'); setShowLangDropdown(!showLangDropdown); }}
              className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all border-2 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-brand-lavender text-brand-purple border-transparent hover:border-brand-purple/20'
              }`}
            >
              <Globe size={20} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase hidden xl:inline tracking-widest">{language}</span>
            </button>

            {showLangDropdown && (
              <div className={`absolute top-full right-0 mt-3 w-44 rounded-2xl border-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-brand-lavender text-slate-950'
              }`}>
                <div className="p-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        language === l.code ? 'bg-brand-purple text-white' : 'hover:bg-brand-lavender hover:text-brand-purple'
                      }`}
                    >
                      {l.label}
                      {language === l.code && <Check size={14} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={shelfRef}>
            <button 
              onClick={() => { playSound('pop'); setShowShelfDropdown(!showShelfDropdown); }}
              className={`flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all relative group border-2 ${
                ['favorites', 'latest', 'my-stories'].includes(activeView) || showShelfDropdown
                  ? 'bg-brand-purple text-white border-white shadow-md' 
                  : 'text-slate-500 border-transparent hover:bg-brand-lavender hover:text-brand-purple'
              }`}
            >
              <Heart size={20} sm:size={24} strokeWidth={3} fill={['favorites', 'latest', 'my-stories'].includes(activeView) ? 'currentColor' : 'none'} />
              <ChevronDown size={14} strokeWidth={3} className={`transition-transform duration-300 hidden sm:block ${showShelfDropdown ? 'rotate-180' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-rose text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {favoritesCount}
                </span>
              )}
            </button>

            {showShelfDropdown && (
              <div className={`absolute top-full right-0 mt-3 w-64 rounded-3xl border-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-brand-lavender text-slate-950'
              }`}>
                <div className="p-2 flex flex-col gap-1">
                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-50 dark:border-slate-800 mb-1">
                    Magic Shelf
                  </div>
                  <button 
                    onClick={() => handleNav('favorites')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all font-bold text-left ${
                      activeView === 'favorites' ? 'bg-brand-rose text-white' : 'hover:bg-brand-lavender hover:text-brand-purple'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${activeView === 'favorites' ? 'bg-white/20' : 'bg-brand-rose/10 text-brand-rose'}`}>
                      <Heart size={18} fill={activeView === 'favorites' ? 'currentColor' : 'none'} />
                    </div>
                    <div>
                      <div className="text-xs">Favorites</div>
                      <div className={`text-[9px] opacity-70 ${activeView === 'favorites' ? '' : 'text-slate-400'}`}>{favoritesCount} stories</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleNav('latest')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all font-bold text-left ${
                      activeView === 'latest' ? 'bg-brand-purple text-white' : 'hover:bg-brand-lavender hover:text-brand-purple'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${activeView === 'latest' ? 'bg-white/20' : 'bg-brand-purple/10 text-brand-purple'}`}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-xs">Recently Read</div>
                      <div className={`text-[9px] opacity-70 ${activeView === 'latest' ? '' : 'text-slate-400'}`}>Resume adventure</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleNav('my-stories')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all font-bold text-left ${
                      activeView === 'my-stories' ? 'bg-brand-cyan text-white' : 'hover:bg-brand-lavender hover:text-brand-purple'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${activeView === 'my-stories' ? 'bg-white/20' : 'bg-brand-cyan/10 text-brand-cyan'}`}>
                      <PenTool size={18} />
                    </div>
                    <div>
                      <div className="text-xs">My Stories</div>
                      <div className={`text-[9px] opacity-70 ${activeView === 'my-stories' ? '' : 'text-slate-400'}`}>Tales you authored</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleNav('creator')}
            className={`hidden sm:flex items-center gap-2.5 px-5 py-2.5 rounded-xl sm:rounded-2xl font-black transition-all border-2 group ${
              activeView === 'creator' 
                ? 'bg-brand-purple text-white border-white shadow-md' 
                : 'bg-brand-lavender text-brand-purple border-transparent hover:scale-105 active:scale-95'
            }`}
          >
            <Sparkles size={18} className="group-hover:animate-sparkle shrink-0" />
            <span className="uppercase tracking-[0.15em] text-[10px] hidden md:inline">Magic Lab</span>
          </button>

          <div className="relative" ref={userRef}>
            {user ? (
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-brand-purple text-white font-black border-2 sm:border-4 border-white shadow-md transition-all hover:scale-110 active:scale-90 flex items-center justify-center text-sm sm:text-base shrink-0`}
              >
                {user.email?.[0].toUpperCase()}
              </button>
            ) : (
              <button 
                onClick={onLoginClick}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl text-brand-purple border-2 border-brand-lavender bg-white hover:bg-brand-lavender transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <User size={20} sm:size={24} strokeWidth={3} />
              </button>
            )}

            {showUserDropdown && user && (
              <div className={`absolute top-full right-0 mt-3 w-60 rounded-3xl border-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-brand-lavender text-slate-950'
              }`}>
                <div className="p-2">
                  <div className="px-3 py-2 border-b-2 dark:border-slate-800 mb-2">
                    <p className="text-xs font-black truncate">{user.full_name || user.email}</p>
                    <p className="text-[10px] text-slate-400 truncate opacity-70">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => handleNav('progress')}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all font-bold text-left hover:bg-brand-lavender hover:text-brand-purple"
                  >
                    <Clock size={16} />
                    <span className="text-xs">Adventure Map</span>
                  </button>
                  <button 
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all font-bold text-left text-brand-rose hover:bg-brand-rose/10"
                  >
                    <LogOut size={16} />
                    <span className="text-xs">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
