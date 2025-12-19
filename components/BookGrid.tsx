
import React, { useState, useMemo, useRef } from 'react';
import { Book, Category, Level, LanguageFilter, AppLanguage } from '../types';
import BookCard from './BookCard';
import { Sparkles, Globe, Filter, ChevronRight, PawPrint, Atom, Compass, Scroll, Heart, Star, LayoutGrid, ChevronLeft, RotateCcw } from 'lucide-react';
import { playSound } from './SoundEffects';
import { getTranslation } from '../i18n';

interface BookGridProps {
  books: Book[];
  onRead: (book: Book) => void;
  selectedCategory?: Category;
  setSelectedCategory?: (cat: Category) => void;
  selectedLevel?: Level;
  setSelectedLevel?: (lvl: Level) => void;
  selectedLanguageFilter?: LanguageFilter;
  setSelectedLanguageFilter?: (lang: LanguageFilter) => void;
  onToggleFavorite?: (e: React.MouseEvent, bookId: string) => void;
  favorites?: string[];
  hideFilters?: boolean;
  theme: 'light' | 'dark';
  language: AppLanguage;
  onSeed?: () => Promise<void>;
  user?: any;
}

const CATEGORY_META = [
  { id: 'Animal Stories', icon: <PawPrint size={20} />, color: 'border-brand-rose', image: 'https://loremflickr.com/600/450/colorful,2D,cartoon,children,cute,smiling,animals,playful,bright,simple,storybook,animal?lock=101' },
  { id: 'Science', icon: <Atom size={20} />, color: 'border-brand-cyan', image: 'https://loremflickr.com/600/450/colorful,2D,cartoon,children,cute,smiling,animals,playful,bright,simple,storybook,science?lock=202' },
  { id: 'Adventure', icon: <Compass size={20} />, color: 'border-brand-amber', image: 'https://loremflickr.com/600/450/colorful,2D,cartoon,children,cute,smiling,animals,playful,bright,simple,storybook,adventure?lock=303' },
  { id: 'Folk Tales', icon: <Scroll size={20} />, color: 'border-brand-purple', image: 'https://loremflickr.com/600/450/colorful,2D,cartoon,children,cute,smiling,animals,playful,bright,simple,storybook,fairytale?lock=404' },
  { id: 'Life Skills', icon: <Heart size={20} />, color: 'border-magic-mint', image: 'https://loremflickr.com/600/450/colorful,2D,cartoon,children,cute,smiling,animals,playful,bright,simple,storybook,friendship?lock=505' },
];

export const BookShelf: React.FC<{
  title: string;
  books: Book[];
  onRead: (book: Book) => void;
  onToggleFavorite?: (e: React.MouseEvent, bookId: string) => void;
  favorites?: string[];
  theme: 'light' | 'dark';
  icon?: React.ReactNode;
}> = ({ title, books, onRead, onToggleFavorite, favorites = [], theme, icon }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      playSound('woosh');
    }
  };

  if (books.length === 0) return null;

  return (
    <div className="space-y-6 mb-20 w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-4 sm:px-12">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-lavender dark:bg-slate-800 rounded-xl text-brand-purple border-2 border-white dark:border-slate-700 shadow-sm">
            {icon ? React.cloneElement(icon as React.ReactElement, { size: 18 }) : <Sparkles size={18} />}
          </div>
          <h3 className={`text-2xl sm:text-3xl font-display font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {title}
          </h3>
        </div>
      </div>

      <div className="relative group/shelf px-4 sm:px-12">
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x snap-mandatory"
        >
          {books.map((book) => (
            <div key={book.id} className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start">
              <BookCard book={book} onRead={onRead} isFavorite={favorites.includes(book.id)} onToggleFavorite={onToggleFavorite} />
            </div>
          ))}
        </div>
        
        <button onClick={() => scroll('left')} className="absolute left-6 sm:left-14 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-xl items-center justify-center text-brand-purple z-10 hidden group-hover/shelf:flex hover:scale-105 transition-all border-2 border-brand-lavender dark:border-slate-700">
          <ChevronLeft size={22} />
        </button>
        <button onClick={() => scroll('right')} className="absolute right-6 sm:right-14 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-xl items-center justify-center text-brand-purple z-10 hidden group-hover/shelf:flex hover:scale-105 transition-all border-2 border-brand-lavender dark:border-slate-700">
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};

const BookGrid: React.FC<BookGridProps> = ({ 
  books, onRead, 
  selectedCategory = 'All', setSelectedCategory = (_c: Category) => {},
  selectedLevel = 'All', setSelectedLevel = (_l: Level) => {}, 
  selectedLanguageFilter = 'All', setSelectedLanguageFilter = (_lg: LanguageFilter) => {},
  onToggleFavorite, favorites = [],
  hideFilters = false, theme
}) => {
  const isDark = theme === 'dark';
  const hasActiveFilters = selectedCategory !== 'All' || selectedLevel !== 'All' || selectedLanguageFilter !== 'All';

  const resetAllFilters = () => { 
    playSound('woosh'); 
    setSelectedCategory('All'); 
    setSelectedLevel('All'); 
    setSelectedLanguageFilter('All'); 
  };

  const filteredBooks = hideFilters ? books : books.filter(book => {
    const categoryMatch = selectedCategory === 'All' || book.tags.includes(selectedCategory);
    const levelMatch = selectedLevel === 'All' || book.level.toString() === selectedLevel;
    const languageMatch = selectedLanguageFilter === 'All' || book.language.toLowerCase().includes(selectedLanguageFilter.toLowerCase());
    return categoryMatch && levelMatch && languageMatch;
  });

  const languages = ['All', 'English', 'Malay', 'Indonesian', 'Chinese', 'Thai', 'Japanese', 'Korean', 'Spanish', 'French'];

  return (
    <section className="w-full pb-24">
      {!hideFilters && (
        <div className="w-full px-4 sm:px-12 mb-12 space-y-10 animate-in slide-up duration-500">
          {/* Category Hub - Rainbow Borders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-display font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Topics</h3>
              {hasActiveFilters && (
                <button onClick={resetAllFilters} className="text-[8px] font-black text-brand-purple uppercase tracking-widest flex items-center gap-2 hover:bg-brand-purple/10 px-3 py-1 rounded-full transition-all">
                  <RotateCcw size={10} /> Clear
                </button>
              )}
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2">
              {CATEGORY_META.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { playSound('pop'); setSelectedCategory(cat.id as Category); }}
                  className={`group flex flex-col items-center min-w-[110px] sm:min-w-[140px] p-0.5 transition-all ${selectedCategory === cat.id ? 'scale-105' : 'hover:scale-105'}`}
                >
                  <div className={`w-full aspect-square rounded-2xl overflow-hidden mb-2 border-2 transition-all ${selectedCategory === cat.id ? `${cat.color} shadow-md border-4` : 'border-white dark:border-slate-800 shadow-sm'}`}>
                    <img src={cat.image} className="w-full h-full object-cover" alt={cat.id} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center ${selectedCategory === cat.id ? 'text-brand-purple' : 'text-slate-500'}`}>{cat.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Slim Unified Filter Dashboard - Solid Background, No Blur */}
          <div className={`flex flex-col xl:flex-row items-stretch xl:items-center gap-4 p-3 rounded-2xl border-2 shadow-lg transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-white shadow-purple-500/5'
          }`}>
            <div className="flex-1 flex items-center gap-4 px-5 py-2.5 rounded-xl bg-white/40 dark:bg-slate-800/30 overflow-hidden border border-transparent dark:border-slate-700/50">
               <Globe size={16} className="text-brand-purple shrink-0" />
               <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                 {languages.map(lang => (
                   <button
                    key={lang}
                    onClick={() => { playSound('pop'); setSelectedLanguageFilter(lang as LanguageFilter); }}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all border border-transparent tactile-button ${
                      selectedLanguageFilter === lang 
                        ? 'bg-brand-purple text-white shadow-sm' 
                        : (isDark ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-500 hover:bg-purple-50')
                    }`}
                   >
                    {lang}
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex items-center gap-4 px-5 py-2.5 rounded-xl bg-brand-purple/5 border border-brand-purple/20 shrink-0">
               <Filter size={16} className="text-brand-purple" />
               <div className="flex items-center gap-1.5">
                 {['All', '1', '2', '3', '4', '5'].map((lvl) => (
                   <button
                    key={lvl}
                    onClick={() => { playSound('pop'); setSelectedLevel(lvl as Level); }}
                    className={`flex items-center justify-center rounded-lg font-black transition-all border border-transparent w-8 h-8 text-[10px] tactile-button ${
                      selectedLevel === lvl 
                        ? 'bg-brand-purple text-white shadow-sm' 
                        : (isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-brand-purple/10')
                    }`}
                   >
                    {lvl === 'All' ? '∞' : lvl}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Edge-to-Edge Grid Results */}
      <div className="w-full px-4 sm:px-12">
        <h4 className={`text-lg font-display font-black mb-8 px-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <LayoutGrid className="text-brand-purple" size={18} />
          {!hasActiveFilters ? 'Highlights' : `Found (${filteredBooks.length})`}
        </h4>
        
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredBooks.map((book, idx) => (
              <div key={book.id} className="animate-in slide-up duration-500 flex" style={{ animationDelay: `${idx * 30}ms` }}>
                <BookCard book={book} onRead={onRead} isFavorite={favorites.includes(book.id)} onToggleFavorite={onToggleFavorite} />
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-3xl border-2 border-dashed animate-in zoom-in duration-500 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <Sparkles size={40} className="mx-auto mb-4 text-brand-purple animate-pulse" />
            <h3 className={`text-2xl font-display font-black mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No stories found... yet!</h3>
            <p className="text-slate-400 font-bold text-xs mb-8 max-w-sm mx-auto leading-relaxed">The magic library couldn't find those books. Try changing your filters!</p>
            <button onClick={resetAllFilters} className="px-8 py-3 bg-brand-purple text-white rounded-xl font-black text-base hover:scale-105 transition-all tactile-button">Reset Filters</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookGrid;
