
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
      className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 puffy-shadow hover:-translate-y-3 transition-all duration-500 cursor-pointer flex flex-col h-full w-full tactile-button"
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
        
        {/* Playful Labels */}
        <div className="absolute top-5 left-5 flex flex-col gap-3 pointer-events-none z-10">
          {(book.id.startsWith('ai') || book.author === 'The Magic Lab') && (
            <div className="bg-brand-purple text-white p-3 rounded-2xl shadow-xl animate-bounce-slow border-2 border-white">
              <Sparkles size={16} strokeWidth={3} />
            </div>
          )}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border-2 border-brand-lavender dark:border-slate-700 flex items-center gap-3">
            <Star size={14} fill="#9333ea" strokeWidth={0} />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-purple">LVL {book.level}</span>
          </div>
        </div>

        {/* Favorite Sticker */}
        <div className="absolute top-5 right-5 z-20">
          <button 
            onClick={handleFavoriteClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl border-2 hover:scale-110 active:scale-90 ${
              isFavorite 
                ? 'bg-rose-600 border-white text-white' 
                : 'bg-white/95 dark:bg-slate-900/95 border-brand-lavender dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart size={22} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 3} />
          </button>
        </div>

        {/* Center Play Overlay */}
        <div className="absolute inset-0 bg-brand-purple/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-purple shadow-2xl scale-50 group-hover:scale-100 transition-all duration-300">
              <Play size={28} fill="currentColor" strokeWidth={0} className="ml-1" />
           </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-8 flex flex-col flex-grow bg-white dark:bg-slate-900">
        <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-purple transition-colors leading-[1.3] mb-6 tracking-tight">
          {book.title}
        </h3>
        
        <div className="mt-auto pt-6 flex items-center justify-between border-t-2 border-brand-lavender/50 dark:border-slate-800">
          <span className="text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.3em] bg-brand-lavender text-brand-purple dark:bg-slate-800 dark:text-brand-lavender border dark:border-slate-700">
            {book.tags[0] || 'Story'}
          </span>
          <div className="flex items-center gap-3">
            <BookOpen size={14} className="text-slate-500 dark:text-slate-400" />
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em]">
              {book.language}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
