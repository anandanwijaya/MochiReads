
import React from 'react';
import { Book } from '../types';
import { Play, Sparkles, Heart, Star } from 'lucide-react';
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
      const btn = e.currentTarget as HTMLElement;
      btn.classList.add('animate-squish');
      setTimeout(() => btn.classList.remove('animate-squish'), 300);
      onToggleFavorite(e, book.id);
    }
  };

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden border-[8px] sm:border-[12px] border-slate-50 dark:border-slate-800 hover:border-brand-blue dark:hover:border-brand-purple shadow-2xl hover:shadow-brand-blue/20 hover:-translate-y-6 transition-all duration-500 cursor-pointer flex flex-col h-full w-full tactile-button"
      onClick={handleClick}
    >
      {/* Cover Image Area */}
      <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800 border-b-[8px] border-slate-50 dark:border-slate-800 flex-shrink-0">
        <img 
          src={book.coverImage} 
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-1000"
        />
        
        {/* Playful Stickers Overlay */}
        <div className="absolute top-5 left-5 flex flex-col gap-3 pointer-events-none z-10">
          {(book.id.startsWith('ai') || book.author === 'The Magic Lab') && (
            <div className="bg-brand-purple text-white p-3 rounded-2xl shadow-xl animate-bounce-slow border-2 border-purple-300">
              <Sparkles size={22} strokeWidth={3} />
            </div>
          )}
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-lg border-2 border-slate-100 dark:border-slate-700 flex items-center gap-2.5">
            <Star size={16} fill="#f59e0b" strokeWidth={0} />
            <span className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Lvl {book.level}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute top-5 right-5 z-20">
          <button 
            onClick={handleFavoriteClick}
            className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl backdrop-blur-md border-[6px] hover:scale-110 active:scale-90 tactile-button ${
              isFavorite 
                ? 'bg-rose-500 border-rose-400 text-white' 
                : 'bg-white/90 dark:bg-slate-800/90 border-white dark:border-slate-700 text-slate-300 hover:text-rose-500'
            }`}
          >
            <Heart size={28} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 3} />
          </button>
        </div>

        {/* Read Hover Overlay */}
        <div className="absolute inset-0 bg-brand-blue/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-blue shadow-3xl scale-50 group-hover:scale-100 transition-all duration-500">
              <Play size={44} fill="currentColor" strokeWidth={0} className="ml-1.5 animate-pulse" />
           </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-10 flex flex-col flex-grow bg-white dark:bg-slate-900">
        <div className="flex-grow">
          <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-800 dark:text-white line-clamp-2 group-hover:text-brand-blue dark:group-hover:text-brand-purple transition-colors leading-[1.05] mb-4">
            {book.title}
          </h3>
          <p className="text-base font-black text-slate-400 uppercase tracking-[0.2em] truncate mb-8">
            By {book.author}
          </p>
        </div>
        
        {/* Footer Sticker Tag */}
        <div className="mt-auto pt-8 flex items-center justify-between border-t-[6px] border-slate-50 dark:border-slate-800/50">
          <span className="text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest bg-brand-blue/10 border-2 border-blue-100 text-brand-blue dark:bg-brand-purple/20 dark:border-brand-purple/40 dark:text-brand-purple">
            {book.tags[0] || 'Adventure'}
          </span>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-brand-sky animate-pulse" />
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">
              {book.language}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
