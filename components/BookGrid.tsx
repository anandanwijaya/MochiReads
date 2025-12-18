
import React, { useState } from 'react';
import { Book, Category, Level, LanguageFilter, AppLanguage } from '../types';
import BookCard from './BookCard';
import { Sparkles, Rocket, Globe, Filter, Database, Loader2 } from 'lucide-react';
import { playSound } from './SoundEffects';
import { getTranslation } from '../i18n';

// Fix: Make filter props optional to support cases where hideFilters is true
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
}

const BookGrid: React.FC<BookGridProps> = ({ 
  books, onRead, 
  // Fix: Provide default values for optional props to prevent undefined errors in filter logic.
  // Updated function defaults to accept parameters to match the expected call signature.
  selectedCategory = 'All', 
  setSelectedCategory = (_cat: Category) => {},
  selectedLevel = 'All', 
  setSelectedLevel = (_lvl: Level) => {}, 
  selectedLanguageFilter = 'All', 
  setSelectedLanguageFilter = (_lang: LanguageFilter) => {},
  onToggleFavorite, favorites = [],
  hideFilters = false, theme, language, onSeed
}) => {
  const t = (key: any) => getTranslation(language, key);
  const isDark = theme === 'dark';
  const [isSeeding, setIsSeeding] = useState(false);
  
  const filteredBooks = hideFilters 
    ? books 
    : books.filter(book => {
        const categoryMatch = selectedCategory === 'All' || book.tags.includes(selectedCategory);
        const levelMatch = selectedLevel === 'All' || book.level.toString() === selectedLevel;
        const bookLang = book.language.toLowerCase();
        const filterLang = selectedLanguageFilter.toLowerCase();
        const languageMatch = selectedLanguageFilter === 'All' || 
          bookLang.includes(filterLang) || 
          (selectedLanguageFilter === 'Indonesian' && bookLang === 'indonesia') ||
          (selectedLanguageFilter === 'Malay' && bookLang === 'malay');
          
        return categoryMatch && levelMatch && languageMatch;
      });

  const handleFilterClick = () => playSound('pop');

  const handleSeedClick = async () => {
    if (!onSeed) return;
    setIsSeeding(true);
    playSound('pop');
    try {
      await onSeed();
      playSound('tada');
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <section className="pb-20">
      {!hideFilters && (
        <div className={`sticky top-16 z-40 py-4 mb-10 border-b border-slate-100 dark:border-slate-800 ${isDark ? 'bg-slate-950/90' : 'bg-[#fdfbff]/90'} backdrop-blur-md`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
              <Filter size={18} />
              <span>Filters</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Dropdown/Scroll */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {['All', 'Animal Stories', 'Science', 'Adventure', 'Folk Tales'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { handleFilterClick(); setSelectedCategory(cat as Category); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border-2 ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                        : (isDark ? 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200')
                    }`}
                  >
                    {cat === 'All' ? t('all') : cat}
                  </button>
                ))}
              </div>

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

              {/* Language Selector */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {['All', 'English', 'Malay', 'Indonesian'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { handleFilterClick(); setSelectedLanguageFilter(lang as LanguageFilter); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border-2 ${
                      selectedLanguageFilter === lang 
                        ? 'bg-slate-800 border-slate-800 text-white dark:bg-indigo-600 dark:border-indigo-600' 
                        : (isDark ? 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200')
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

              {/* Level Selector */}
              <div className="flex items-center gap-1.5">
                {['All', '1', '2', '3', '4'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => { handleFilterClick(); setSelectedLevel(lvl as Level); }}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all border-2 ${
                      selectedLevel === lvl 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : (isDark ? 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200')
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

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {filteredBooks.map((book, idx) => (
            <div key={book.id} className="animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
              <BookCard 
                book={book} 
                onRead={onRead} 
                isFavorite={favorites.includes(book.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-24 px-6 rounded-[3rem] border-4 border-dashed transition-colors ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-100'
        }`}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-slate-100 dark:bg-slate-800 text-slate-300">
            <Rocket size={32} />
          </div>
          <h3 className={`text-2xl font-display font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>No Books Found</h3>
          <p className="text-slate-400 font-bold text-sm mb-10 max-w-sm mx-auto">The magical shelves are empty! Try clearing your filters or help populate the library.</p>
          
          {onSeed && (
            <button
              onClick={handleSeedClick}
              disabled={isSeeding}
              className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-[0_6px_0_0_#4f46e5] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50"
            >
              {isSeeding ? (
                <><Loader2 size={24} className="animate-spin" /> Magicking Books...</>
              ) : (
                <><Database size={24} /> Seed Magical Library</>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default BookGrid;
