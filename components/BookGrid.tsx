
import React, { useState, useMemo } from 'react';
import { Book, Category, Level, LanguageFilter, AppLanguage } from '../types';
import BookCard from './BookCard';
import { Sparkles, Globe, Filter, Loader2, ChevronRight, PawPrint, Atom, Compass, Scroll, Heart, Star, LayoutGrid } from 'lucide-react';
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
}

interface CategoryCardMeta {
  id: Category;
  icon: React.ReactNode;
  color: string;
  bg: string;
  image: string;
  description: string;
}

const CATEGORY_META: CategoryCardMeta[] = [
  { 
    id: 'Animal Stories', 
    icon: <PawPrint size={24} />, 
    color: 'text-orange-500', 
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=400',
    description: 'Meet furry & scaly friends!'
  },
  { 
    id: 'Science', 
    icon: <Atom size={24} />, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
    description: 'Explore our amazing world.'
  },
  { 
    id: 'Adventure', 
    icon: <Compass size={24} />, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&q=80&w=400',
    description: 'Journey to far-off places!'
  },
  { 
    id: 'Folk Tales', 
    icon: <Scroll size={24} />, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400',
    description: 'Stories from long ago.'
  },
  { 
    id: 'Life Skills', 
    icon: <Heart size={24} />, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=400',
    description: 'Grow, share, and be kind.'
  },
];

const BookGrid: React.FC<BookGridProps> = ({ 
  books, onRead, 
  selectedCategory = 'All', 
  setSelectedCategory = (_cat: Category) => {},
  selectedLevel = 'All', 
  setSelectedLevel = (_lvl: Level) => {}, 
  selectedLanguageFilter = 'All', 
  setSelectedLanguageFilter = (_lang: LanguageFilter) => {},
  onToggleFavorite, favorites = [],
  hideFilters = false, theme, language, onSeed
}) => {
  const isDark = theme === 'dark';
  const [isSeeding, setIsSeeding] = useState(false);
  
  const filteredBooks = hideFilters 
    ? books 
    : books.filter(book => {
        const categoryMatch = selectedCategory === 'All' || book.tags.includes(selectedCategory);
        const levelMatch = selectedLevel === 'All' || book.level.toString() === selectedLevel;
        
        if (selectedLanguageFilter === 'All') return categoryMatch && levelMatch;
        
        const bookLang = book.language.toLowerCase();
        const filterLang = selectedLanguageFilter.toLowerCase();
        
        const languageMatch = bookLang.includes(filterLang) || 
          (selectedLanguageFilter === 'Indonesian' && (bookLang === 'indonesia' || bookLang === 'id')) ||
          (selectedLanguageFilter === 'Malay' && (bookLang === 'malay' || bookLang === 'ms')) ||
          (selectedLanguageFilter === 'Chinese' && (bookLang === 'chinese' || bookLang === 'zh' || bookLang === 'mandarin'));
          
        return categoryMatch && levelMatch && languageMatch;
      });

  const availableLanguages = useMemo(() => {
    return ['All', 'English', 'Malay', 'Indonesian', 'Chinese', 'Thai', 'Japanese', 'Korean', 'Tagalog', 'Lao', 'Khmer', 'Arabic', 'German', 'French', 'Spanish', 'Dutch', 'Russian', 'Italian', 'Portuguese', 'Turkish'];
  }, []);

  const handleFilterClick = () => playSound('pop');

  return (
    <section className="pb-24">
      {!hideFilters && (
        <div className="space-y-16 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500 rounded-2xl text-white shadow-lg rotate-3">
                  <Star size={24} fill="currentColor" strokeWidth={0} />
                </div>
                <h3 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Choose an Adventure
                </h3>
              </div>
              {selectedCategory !== 'All' && (
                <button 
                  onClick={() => { playSound('woosh'); setSelectedCategory('All'); }}
                  className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform"
                >
                  View All <ChevronRight size={18} />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
              {CATEGORY_META.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => { handleFilterClick(); setSelectedCategory(cat.id); }}
                  className={`group relative flex flex-col p-4 sm:p-5 rounded-[2.5rem] border-4 transition-all duration-500 text-left overflow-hidden h-full tactile-button ${
                    selectedCategory === cat.id 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-2xl scale-[1.02]' 
                      : (isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:-translate-y-2' : 'bg-white border-slate-100 hover:border-indigo-200 hover:-translate-y-2 hover:shadow-xl shadow-sm')
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="aspect-square w-full rounded-[2rem] overflow-hidden mb-5 relative bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-inner shrink-0">
                    <img src={cat.image} alt={cat.id} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className={`absolute top-3 right-3 p-2.5 rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-800/90 shadow-lg ${cat.color} group-hover:rotate-12 transition-transform`}>
                      {cat.icon}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <h4 className={`font-display font-bold text-xl mb-1 truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{cat.id}</h4>
                    <p className="text-[11px] font-bold text-slate-400 leading-tight">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`flex flex-col lg:flex-row lg:items-center gap-8 p-8 rounded-[3rem] border-4 transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-magic-sky/40 border-white shadow-inner'
          }`}>
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2.5 text-slate-500 font-black text-xs uppercase tracking-[0.2em] shrink-0">
                <Globe size={18} className="text-indigo-400" />
                <span>Language</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 flex-1">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { handleFilterClick(); setSelectedLanguageFilter(lang as LanguageFilter); }}
                    className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap border-2 tactile-button ${
                      selectedLanguageFilter === lang 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200' 
                        : (isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100')
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-10 w-[2px] bg-slate-200 dark:bg-slate-800 hidden lg:block rounded-full" />

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5 text-slate-500 font-black text-xs uppercase tracking-[0.2em] shrink-0">
                <Filter size={18} className="text-amber-400" />
                <span>Level</span>
              </div>
              <div className="flex items-center gap-2">
                {['All', '1', '2', '3', '4', '5'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => { handleFilterClick(); setSelectedLevel(lvl as Level); }}
                    className={`w-11 h-11 flex items-center justify-center rounded-2xl text-[11px] font-black transition-all border-2 tactile-button ${
                      selectedLevel === lvl 
                        ? 'bg-amber-500 border-amber-500 text-white shadow-amber-200' 
                        : (isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-100 text-slate-500 hover:border-amber-100')
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16 items-stretch">
          {filteredBooks.map((book, idx) => (
            <div key={book.id} className="animate-in fade-in zoom-in-95 duration-700 flex" style={{ animationDelay: `${idx * 80}ms` }}>
              <BookCard book={book} onRead={onRead} isFavorite={favorites.includes(book.id)} onToggleFavorite={onToggleFavorite} />
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-24 px-10 rounded-[4rem] border-8 border-dashed animate-in fade-in zoom-in duration-500 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/80 border-slate-100 shadow-inner'
        }`}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-indigo-100 dark:bg-slate-800 text-indigo-500 animate-bounce">
            <LayoutGrid size={40} />
          </div>
          <h3 className={`text-4xl font-display font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>The Shelves are Shy!</h3>
          <p className="text-slate-400 font-bold text-lg mb-12 max-w-sm mx-auto leading-relaxed">No books found in the database. Help populate the global library with 76 magical stories across all languages!</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => { playSound('pop'); setSelectedCategory('All'); setSelectedLevel('All'); setSelectedLanguageFilter('All'); }}
              className="px-10 py-5 bg-white dark:bg-slate-800 border-4 border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-[2.5rem] font-black text-xl hover:bg-indigo-50 transition-all tactile-button"
            >
              Clear Filters
            </button>
            {onSeed && (
              <button
                onClick={async () => { setIsSeeding(true); playSound('pop'); await onSeed(); setIsSeeding(false); }}
                disabled={isSeeding}
                className="group relative px-10 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl tactile-button flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden shadow-xl shadow-indigo-500/20"
              >
                {isSeeding ? <Loader2 className="animate-spin" /> : <Sparkles className="group-hover:animate-sparkle" />}
                Populate Full Global Library (76 Books)
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BookGrid;
