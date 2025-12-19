
import React from 'react';
import { Book } from '../types';
import { Play, Sparkles, Heart, Star, Share2 } from 'lucide-react';
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('pop');
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out this amazing story: ${book.title} by ${book.author}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Basic fallback
      alert('Sharing is not supported on this browser. Try copying the URL!');
    }
  };

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-3 transition-all duration-500 cursor-pointer flex flex-col h-full tactile-button"
      onClick={handleClick}
    >
      {/* Cover Image - Constant Aspect Ratio */}
      <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 dark:bg-slate-800 border-b-4 border-slate-50 dark:border-slate-800 shrink-0">
        <img 
          src={book.coverImage} 
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
          {(book.id.startsWith('ai') || book.author === 'The Magic Lab') && (
            <div className="bg-indigo-600 text-white p-2 rounded-2xl shadow-xl animate-pulse ring-4 ring-indigo-500/20">
              <Sparkles size={16} strokeWidth={3} />
            </div>
          )}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border-2 border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
            <Star size={12} fill="#eab308" strokeWidth={0} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Lvl {book.level}</span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-2xl scale-75 group-hover:scale-100 transition-all duration-500">
              <Play size={32} fill="currentColor" strokeWidth={0} className="ml-1.5 group-hover:animate-bounce" />
           </div>
        </div>

        {/* Action Cluster - Top Right - Higher Z-Index to be above overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {onToggleFavorite && (
            <button 
              onClick={handleFavoriteClick}
              title="Add to Favorites"
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md border-4 hover:scale-110 active:scale-90 tactile-button ${
                isFavorite 
                  ? 'bg-rose-500 border-rose-400 text-white animate-squish' 
                  : 'bg-white/80 dark:bg-slate-800/80 border-white dark:border-slate-700 text-slate-300 hover:text-rose-500'
              }`}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 3} />
            </button>
          )}
          
          <button 
            onClick={handleShare}
            title="Share this book"
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md border-4 hover:scale-110 active:scale-90 tactile-button bg-white/80 dark:bg-slate-800/80 border-white dark:border-slate-700 text-slate-400 hover:text-indigo-500"
          >
            <Share2 size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      {/* Precision Content Area */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title: Exactly 2 lines worth of height reserved */}
        <div className="min-h-[3.5rem] flex flex-col justify-start mb-1 overflow-hidden">
          <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            {book.title}
          </h3>
        </div>
        
        <p className="text-sm font-bold text-slate-400 truncate mb-4">
          {book.author}
        </p>
        
        {/* Footer: Pushed to bottom of flex container */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
          <div className="flex flex-wrap gap-2">
            {book.tags.slice(0, 1).map((tag) => (
              <span 
                key={tag} 
                className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest bg-magic-mint/50 border-2 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 group-hover:scale-110 transition-transform"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {book.language}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
