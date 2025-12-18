
import React from 'react';
import { Book, Category, Level, LanguageFilter, AppLanguage } from '../types';
import BookCard from './BookCard';
import { Sparkles, Rocket, Globe } from 'lucide-react';
import { playSound } from './SoundEffects';
import { getTranslation } from '../i18n';

interface BookGridProps {
  books: Book[];
  onRead: (book: Book) => void;
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  selectedLevel: Level;
  setSelectedLevel: (lvl: Level) => void;
  selectedLanguageFilter: LanguageFilter;
  setSelectedLanguageFilter: (lang: LanguageFilter) => void;
  onToggleFavorite?: (e: React.MouseEvent, bookId: string) => void;
  favorites?: string[];
  hideFilters?: boolean;
  theme: 'light' | 'dark';
  language: AppLanguage;
}

const BookGrid: React.FC<BookGridProps> = ({ 
  books, onRead, selectedCategory, setSelectedCategory,
  selectedLevel, setSelectedLevel, selectedLanguageFilter, setSelectedLanguageFilter,
  onToggleFavorite, favorites = [],
  hideFilters = false, theme, language
}) => {
  const t = (key: any) => getTranslation(language, key);
  const isDark = theme === 'dark';
  
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

  return (
    <section className="pb-20">
      {!hideFilters && (
        <div className="flex flex-col gap-6 mb-16">
          <div className="flex flex-wrap items-center justify-end gap-4">
            {/* Category Filter */}
            <div className={`flex items-center gap-2 rounded-3xl p-1.5 border-4 shadow-sm overflow-x-auto no-scrollbar animate-in slide-in-from-right-4 duration-500 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50'
            }`}>
              {['All', 'Animal Stories', 'Science', 'Life Skills'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { handleFilterClick(); setSelectedCategory(cat as Category); }}
                  className={`px-5 py-2 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : `text-slate-500 hover:bg-purple-50 dark:hover:bg-slate-800`
                  }`}
                >
                  {cat === 'All' ? t('all') : cat}
                </button>
              ))}
            </div>

            {/* Language Filter */}
            <div className={`flex items-center gap-2 rounded-3xl p-1.5 border-4 shadow-sm overflow-x-auto no-scrollbar animate-in slide-in-from-right-8 duration-500 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-50'
            }`}>
              <Globe size={14} className="ml-3 text-indigo-400 hidden sm:block" />
              {['All', 'English', 'Malay', 'Indonesian'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => { handleFilterClick(); setSelectedLanguageFilter(lang as LanguageFilter); }}
                  className={`px-5 py-2 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${
                    selectedLanguageFilter === lang 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : `text-slate-500 hover:bg-indigo-50 dark:hover:bg-slate-800`
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className={`flex items-center gap-2 rounded-3xl p-1.5 border-4 shadow-sm animate-in slide-in-from-right-12 duration-500 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-fuchsia-50'
            }`}>
              <span className="text-[10px] font-black text-fuchsia-400 px-2 uppercase tracking-widest hidden sm:inline">{t('level')}</span>
              {['All', '1', '2', '3'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { handleFilterClick(); setSelectedLevel(lvl as Level); }}
                  className={`w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black transition-all ${
                    selectedLevel === lvl 
                      ? 'bg-fuchsia-600 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-fuchsia-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl === 'All' ? '∞' : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
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
        <div className={`text-center py-24 rounded-[3rem] border-4 border-dashed transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-100'
        }`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-slate-800 text-purple-600/30' : 'bg-purple-50 text-purple-200'}`}>
            <Rocket size={48} />
          </div>
          <h3 className={`text-2xl font-display font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Empty Shelf!</h3>
          <p className="text-slate-500 font-bold">Try different filters or create a new story!</p>
        </div>
      )}
    </section>
  );
};

export default BookGrid;
