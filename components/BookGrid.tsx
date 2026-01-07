
import React, { useRef } from 'react';
import { Book, Category, Level, LanguageFilter, AppLanguage } from '../types';
import BookCard from './BookCard';
import { Sparkles, Globe, Filter, PawPrint, Atom, Compass, Scroll, Heart, LayoutGrid, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
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
  user?: any;
}

const CATEGORY_META = [
	{
		id: 'Animal Stories',
		icon: <PawPrint size={20} />,
		color: 'border-brand-rose',
		image: '/animal.jpg',
	},
	{
		id: 'Science',
		icon: <Atom size={20} />,
		color: 'border-brand-cyan',
		image: '/science.jpg',
	},
	{
		id: 'Adventure',
		icon: <Compass size={20} />,
		color: 'border-brand-amber',
		image: '/adventure.jpg',
	},
	{
		id: 'Folk Tales',
		icon: <Scroll size={20} />,
		color: 'border-brand-purple',
		image: '/folk-tales.png',
	},
	{
		id: 'Life Skills',
		icon: <Heart size={20} />,
		color: 'border-brand-pink',
		image: '/fantasy.jpg',
	},
]

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
      const move = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: move, behavior: 'smooth' });
      playSound('woosh');
    }
  };

  if (books.length === 0) return null;

  return (
    <div className="space-y-8 mb-24 w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-6 sm:px-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-purple text-white rounded-2xl shadow-[0_10px_20px_-5px_rgba(124,58,237,0.4)] border-2 border-white/20">
            {icon ? React.cloneElement(icon as React.ReactElement, { size: 22 }) : <Sparkles size={22} />}
          </div>
          <h3 className={`text-3xl font-display font-black tracking-tight ${isDark ? 'text-white' : 'text-brand-violet'}`}>
            {title}
          </h3>
        </div>
        <div className="hidden sm:flex gap-3">
          <button onClick={() => scroll('left')} className={`w-12 h-12 rounded-2xl border-4 flex items-center justify-center transition-all active:scale-90 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-brand-lavender text-brand-purple shadow-sm'}`}>
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <button onClick={() => scroll('right')} className={`w-12 h-12 rounded-2xl border-4 flex items-center justify-center transition-all active:scale-90 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-brand-lavender text-brand-purple shadow-sm'}`}>
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar px-6 sm:px-12 pb-8 snap-x snap-mandatory"
      >
        {books.map((book) => (
          <div key={book.id} className="w-[300px] sm:w-[340px] snap-start">
            <BookCard book={book} onRead={onRead} isFavorite={favorites.includes(book.id)} onToggleFavorite={onToggleFavorite} />
          </div>
        ))}
      </div>
    </div>
  );
};

const BookGrid: React.FC<BookGridProps> = ({ 
  books, onRead, 
  selectedCategory = 'All', setSelectedCategory = (_c: Category) => {},
  selectedLevel = 'All', setSelectedLevel = (_l: Level) => {}, 
  selectedLanguageFilter = 'All', setSelectedLanguageFilter = (_f: LanguageFilter) => {},
  onToggleFavorite, favorites = [],
  hideFilters = false, theme
}) => {
  const isDark = theme === 'dark';
  const filteredBooks = hideFilters ? books : books.filter(book => {
    const cat = selectedCategory === 'All' || book.tags.includes(selectedCategory);
    const lvl = selectedLevel === 'All' || book.level.toString() === selectedLevel;
    const lang = selectedLanguageFilter === 'All' || book.language.toLowerCase().includes(selectedLanguageFilter.toLowerCase());
    return cat && lvl && lang;
  });

  const languageOptions: LanguageFilter[] = [
    'All', 'English', 'Malay', 'Indonesian', 'Chinese', 'Thai', 'Japanese', 'Korean', 
    'Tagalog', 'Lao', 'Khmer', 'Arabic', 'German', 'French', 'Spanish', 'Dutch', 
    'Russian', 'Italian', 'Portuguese', 'Turkish', 'Vietnamese'
  ];

  return (
    <section className="w-full pb-32">
      {!hideFilters && (
        <div className="w-full px-6 sm:px-12 mb-16 space-y-10 animate-in slide-up duration-500">
          <div className="flex flex-row items-center gap-4 ps-4">
            <LayoutGrid className="text-brand-purple" size={24} />
            <h4 className={`text-3xl font-display font-black ${isDark ? 'text-white' : 'text-brand-violet'}`}>
              Categories ({CATEGORY_META.length})
            </h4>
          </div>
          <div className="flex justify-evenly overflow-x-auto no-scrollbar gap-6 pb-2 py-4">
            {CATEGORY_META.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { playSound('pop'); setSelectedCategory(cat.id as Category); }}
                className={`group flex flex-col items-center min-w-[130px] transition-all duration-300 ${
                  selectedCategory === cat.id ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`
                    w-[150px] md:w-[180px] aspect-square rounded-[2rem] overflow-hidden mb-4 border-4 transition-all flex justify-center items-center bg-gradient-to-tr from-purple-200 to-purple-100
                    ${selectedCategory === cat.id
                      ? `${cat.color} shadow-2xl ring-4 ring-brand-purple/20`
                      : 'border-white dark:border-slate-800 shadow-lg grayscale-[30%] opacity-90'
                    }
                  `}
                >
                  <img
                    src={cat.image}
                    alt={cat.id}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span
                  className={`
                    text-[12px] font-black uppercase tracking-[0.3em] text-center px-2 py-1 rounded-lg transition-all
                    ${selectedCategory === cat.id ? 'bg-brand-purple text-white shadow-md' : 'text-slate-500'}
                  `}
                >
                  {cat.id}
                </span>
              </button>
            ))}
          </div>

          <div className={`flex flex-col md:flex-row gap-6 p-6 rounded-[3rem] border-4 shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-brand-lavender'
          }`}>
            <div className="flex-1 flex items-center gap-4 bg-brand-softPurple dark:bg-slate-800/50 p-3 rounded-2xl overflow-x-auto no-scrollbar">
              <Globe size={22} className="text-brand-purple shrink-0 ml-2" />
              {languageOptions.map(lang => (
                <button
                  key={lang}
                  onClick={() => { playSound('pop'); setSelectedLanguageFilter(lang); }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    selectedLanguageFilter === lang 
                      ? 'bg-brand-purple text-white shadow-lg' 
                      : 'text-brand-purple hover:bg-brand-purple/10'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4 shrink-0 px-2">
               <div className="p-3 bg-brand-lavender rounded-xl text-brand-purple">
                 <Filter size={22} strokeWidth={3} />
               </div>
               <div className="flex gap-2">
                 {['All', '1', '2', '3', '4', '5'].map(lvl => (
                   <button
                    key={lvl}
                    onClick={() => { playSound('pop'); setSelectedLevel(lvl as Level); }}
                    className={`w-12 h-12 rounded-2xl font-black text-sm border-2 transition-all tactile-button ${
                      selectedLevel === lvl 
                        ? 'bg-brand-purple text-white border-white shadow-lg' 
                        : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-brand-lavender text-slate-400')
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

      <div className="px-6 sm:px-12">
        <div className="flex items-center justify-between mb-10 px-4">
           <div className="flex items-center gap-4">
              <LayoutGrid className="text-brand-purple" size={24} />
              <h4 className={`text-3xl font-display font-black ${isDark ? 'text-white' : 'text-brand-violet'}`}>
                {filteredBooks.length > 0 ? `Magic Results (${filteredBooks.length})` : 'Summoning Stories...'}
              </h4>
           </div>
           {selectedCategory !== 'All' && (
             <button 
              onClick={() => setSelectedCategory('All')}
              className="text-[10px] font-black uppercase tracking-widest text-brand-purple flex items-center gap-2 hover:bg-brand-purple/5 px-4 py-2 rounded-full"
             >
               <RotateCcw size={14} /> Clear {selectedCategory}
             </button>
           )}
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
            {filteredBooks.map((book, idx) => (
              <div key={book.id} className="animate-in fade-in slide-up duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                <BookCard book={book} onRead={onRead} isFavorite={favorites.includes(book.id)} onToggleFavorite={onToggleFavorite} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 rounded-[4rem] border-8 border-dashed border-brand-lavender animate-in zoom-in duration-500">
             <Sparkles size={60} className="mx-auto mb-6 text-brand-purple animate-pulse" />
             <h3 className="text-3xl font-display font-black text-brand-violet mb-4">No Magic Tales Found</h3>
             <p className="text-slate-400 font-bold mb-10 max-w-md mx-auto">Try changing your filters to discover different types of magic in our library!</p>
             <button 
              onClick={() => { setSelectedCategory('All'); setSelectedLevel('All'); setSelectedLanguageFilter('All'); }}
              className="px-12 py-4 bg-brand-purple text-white rounded-[2rem] font-black text-xl shadow-lg tactile-button"
             >
               Reset Filters
             </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookGrid;