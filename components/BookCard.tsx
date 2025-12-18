
import React from 'react';
import { Book } from '../types';
import { Play, Sparkles, Heart, Globe } from 'lucide-react';
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

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-600 hover:shadow-[0_20px_50px_rgba(168,85,247,0.2)] hover:-translate-y-2 transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={book.coverImage} 
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-purple-600 scale-75 group-hover:scale-100 transition-all shadow-xl">
            <Play size={32} fill="currentColor" strokeWidth={0} className="ml-1" />
          </div>
        </div>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-purple-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 uppercase tracking-wider">
            Lvl {book.level}
          </span>
          <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 uppercase tracking-wider flex items-center gap-1">
            <Globe size={10} /> {book.language}
          </span>
          {(book.id.startsWith('ai') || book.author === 'The Magic Lab') && (
            <span className="bg-fuchsia-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} /> MAGIC
            </span>
          )}
        </div>

        {onToggleFavorite && (
          <button 
            onClick={(e) => onToggleFavorite(e, book.id)}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg border-2 border-white dark:border-slate-900 ${
              isFavorite ? 'bg-fuchsia-500 text-white' : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-fuchsia-500'
            }`}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} strokeWidth={3} />
          </button>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white line-clamp-1 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm font-bold text-slate-400 mb-3">
          by {book.author}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {book.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-widest group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
