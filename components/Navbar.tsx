
import { BookOpen, Globe, Heart, Search, Sparkles, User, X, Check, Menu, Clock, ChevronDown, PenTool, Upload } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getTranslation, translations } from '../i18n';
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
  onNavigate, onUploadClick, activeView, user, onLoginClick, favoritesCount, 
  theme, language, setLanguage, searchQuery, setSearchQuery,
  books, onReadBook
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';
  const t = (key: any) => getTranslation(language, key);

  const handleNav = (view: ViewType) => {
    playSound('pop');
    onNavigate(view);
    setShowShelfDropdown(false);
    setShowLangDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLangChange = (lang: AppLanguage) => {
    playSound('pop');
    setLanguage(lang);
    setShowLangDropdown(false);
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
      isDark ? 'bg-slate-950/85 border-slate-800' : 'bg-white/90 border-brand-lavender shadow-xl'
    } backdrop-blur-xl`}>
      <div 
        className="absolute bottom-[-4px] left-0 h-1.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-amber transition-all duration-200 ease-out z-10 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]"
        style={{ width: `${scrollProgress}%` }}
      />
      
      <div className="w-full px-6 sm:px-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => handleNav('library')}>
          <div className="bg-brand-purple p-2.5 rounded-2xl text-white group-hover:rotate-6 transition-all shadow-[0_8px_20px_-5px_rgba(124,58,237,0.5)] border-2 border-white/20">
            <BookOpen size={26} strokeWidth={3} />
          </div>
          <h1 className={`text-2xl sm:text-3xl font-display font-black tracking-tight hidden sm:block ${isDark ? 'text-white' : 'text-brand-violet'}`}>
            Mochi<span className="text-brand-pink">Reads</span>
          </h1>
        </div>

        <div className="flex-1 max-w-xl relative group" ref={searchRef}>
          <div className={`absolute left-5 top-1/2 -translate-y-1/2 z-10 transition-colors ${isDark ? 'text-slate-500' : 'text-brand-purple'}`}>
            <Search size={20} strokeWidth={3} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('library') + '...'}
            className={`w-full pl-12 pr-12 py-3 rounded-2xl outline-none border-4 transition-all font-bold text-base ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-white focus:border-brand-purple' 
                : 'bg-brand-softPurple border-brand-lavender text-slate-900 focus:border-brand-purple focus:bg-white shadow-inner'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-rose transition-colors"
            >
              <X size={18} strokeWidth={3} />
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-4 rounded-[2.5rem] shadow-3xl border-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-brand-lavender'
            }`}>
              <div className="p-3">
                {suggestions.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      playSound('pop');
                      setSearchQuery(book.title);
                      setShowSuggestions(false);
                      onReadBook(book);
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-brand-lavender'
                    }`}
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border-2 border-slate-200">
                      <img src={book.coverImage} className="w-full h-full object-cover" alt={book.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>{book.title}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{book.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Manual Upload Button */}
          <button 
            onClick={() => { playSound('pop'); onUploadClick(); }}
            className={`flex items-center gap-2 p-3 rounded-2xl transition-all border-2 group ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-brand-blue' : 'bg-brand-lavender text-brand-purple border-transparent hover:border-brand-purple/20'
            }`}
            title="Upload Book Manually"
          >
            <Upload size={22} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase hidden lg:inline tracking-widest">Upload</span>
          </button>

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => { playSound('pop'); setShowLangDropdown(!showLangDropdown); }}
              className={`flex items-center gap-2 p-3 rounded-2xl transition-all border-2 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-brand-lavender text-brand-purple border-transparent hover:border-brand-purple/20'
              }`}
            >
              <Globe size={22} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase hidden lg:inline tracking-widest">{language}</span>
            </button>

            {showLangDropdown && (
              <div className={`absolute top-full right-0 mt-4 w-48 rounded-[2rem] border-4 shadow-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-brand-lavender text-slate-950'
              }`}>
                <div className="p-2 grid grid-cols-1 gap-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
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
              className={`flex items-center gap-2 p-3 rounded-2xl transition-all relative group border-2 ${
                ['favorites', 'latest', 'my-stories'].includes(activeView) || showShelfDropdown
                  ? 'bg-brand-purple text-white border-white shadow-lg' 
                  : 'text-slate-500 border-transparent hover:bg-brand-lavender hover:text-brand-purple'
              }`}
            >
              <Heart size={24} strokeWidth={3} fill={['favorites', 'latest', 'my-stories'].includes(activeView) ? 'currentColor' : 'none'} />
              <ChevronDown size={16} strokeWidth={3} className={`transition-transform duration-300 ${showShelfDropdown ? 'rotate-180' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-brand-rose text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-md">
                  {favoritesCount}
                </span>
              )}
            </button>

            {showShelfDropdown && (
              <div className={`absolute top-full right-0 mt-4 w-72 rounded-[2rem] border-4 shadow-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-brand-lavender text-slate-950'
              }`}>
                <div className="p-3 flex flex-col gap-2">
                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-50 dark:border-slate-800 mb-1">
                    My Magic Shelf
                  </div>
                  <button 
                    onClick={() => handleNav('favorites')}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all font-bold text-left group ${
                      activeView === 'favorites' ? 'bg-brand-rose text-white' : 'hover:bg-brand-lavender hover:text-brand-purple'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeView === 'favorites' ? 'bg-white/20' : 'bg-brand-rose/10 text-brand-rose'}`}>
                      <Heart size={20} fill={activeView === 'favorites' ? 'currentColor' : 'none'} />
                    </div>
                    <div>
                      <div className="text-sm">Favorites</div>
                      <div className={`text-[10px] opacity-70 ${activeView === 'favorites' ? '' : 'text-slate-400'}`}>{favoritesCount} stories saved</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleNav('latest')}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all font-bold text-left group ${
                      activeView === 'latest' ? 'bg-brand-purple text-white' : 'hover:bg-brand-lavender hover:text-brand-purple'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeView === 'latest' ? 'bg-white/20' : 'bg-brand-purple/10 text-brand-purple'}`}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="text-sm">Recently Read</div>
                      <div className={`text-[10px] opacity-70 ${activeView === 'latest' ? '' : 'text-slate-400'}`}>Jump back in</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleNav('my-stories')}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all font-bold text-left group ${
                      activeView === 'my-stories' ? 'bg-brand-cyan text-white' : 'hover:bg-brand-lavender hover:text-brand-purple'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeView === 'my-stories' ? 'bg-white/20' : 'bg-brand-cyan/10 text-brand-cyan'}`}>
                      <PenTool size={20} />
                    </div>
                    <div>
                      <div className="text-sm">My Stories</div>
                      <div className={`text-[10px] opacity-70 ${activeView === 'my-stories' ? '' : 'text-slate-400'}`}>Tales you authored</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleNav('creator')}
            className={`hidden lg:flex items-center gap-3 px-6 py-3 rounded-2xl font-black transition-all border-2 group ${
              activeView === 'creator' 
                ? 'bg-brand-purple text-white border-white shadow-lg' 
                : 'bg-brand-lavender text-brand-purple border-transparent hover:scale-105 active:scale-95'
            }`}
          >
            <Sparkles size={20} className="group-hover:animate-sparkle" />
            <span className="uppercase tracking-[0.2em] text-[11px]">Magic Lab</span>
          </button>

          {user ? (
            <button 
              onClick={() => handleNav('progress')}
              className={`w-11 h-11 rounded-2xl bg-brand-purple text-white font-black border-4 border-white shadow-lg transition-transform hover:scale-110 active:scale-90 flex items-center justify-center`}
            >
              {user.email?.[0].toUpperCase()}
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="p-3 rounded-2xl text-brand-purple border-2 border-brand-lavender bg-white hover:bg-brand-lavender transition-all hover:scale-105 active:scale-95"
            >
              <User size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
