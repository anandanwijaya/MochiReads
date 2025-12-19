
import React from 'react';
import { Book } from '../types';
import { Play, Sparkles, Heart, Star, BookOpen } from 'lucide-react';
import { playSound } from './SoundEffects';

interface BookCardProps {
  book: Book;
  onRead: (book: Book) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onRead, isFavorite, onToggleFavorite }) => {
  const handleClick = () => {
    playSound('pop');
    onRead(book);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(e, book.id);
    }
  };

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 puffy-shadow hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full w-full tactile-button"
      onClick={handleClick}
    >
      {/* Cover Image Area */}
      <div className="aspect-[3/4] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800 border-b-4 border-brand-lavender dark:border-slate-800">
        <img 
          src={book.coverImage} 
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Playful Labels - Purple Theme */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-10">
          {(book.id.startsWith('ai') || book.author === 'The Magic Lab') && (
            <div className="bg-brand-purple text-white p-2 rounded-xl shadow-lg animate-bounce-slow border-2 border-white">
              <Sparkles size={12} strokeWidth={3} />
            </div>
          )}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border-2 border-brand-lavender flex items-center gap-1.5">
            <Star size={10} fill="#9333ea" strokeWidth={0} />
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple">Lvl {book.level}</span>
          </div>
        </div>

        {/* Favorite Sticker */}
        <div className="absolute top-3 right-3 z-20">
          <button 
            onClick={handleFavoriteClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg border-2 hover:scale-110 active:scale-90 ${
              isFavorite 
                ? 'bg-rose-500 border-white text-white' 
                : 'bg-white/90 dark:bg-slate-800/90 border-brand-lavender text-slate-300 hover:text-rose-500'
            }`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 3} />
          </button>
        </div>

        {/* Center Play Overlay */}
        <div className="absolute inset-0 bg-brand-purple/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-purple shadow-xl scale-50 group-hover:scale-100 transition-all duration-300">
              <Play size={20} fill="currentColor" strokeWidth={0} className="ml-0.5" />
           </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow bg-white dark:bg-slate-900">
        <h3 className="font-display font-black text-lg text-slate-800 dark:text-white line-clamp-2 group-hover:text-brand-purple transition-colors leading-tight mb-2">
          {book.title}
        </h3>
        
        <div className="mt-auto pt-3 flex items-center justify-between border-t-2 border-brand-lavender dark:border-slate-800">
          <span className="text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest bg-brand-lavender text-brand-purple dark:bg-slate-800 dark:text-brand-lavender">
            {book.tags[0] || 'Story'}
          </span>
          <div className="flex items-center gap-1.5">
            <BookOpen size={10} className="text-slate-400" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              {book.language}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
