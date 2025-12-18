
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
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={book.coverImage} 
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
           <div className="w-full">
             <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                  Level {book.level}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                  {book.language}
                </span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl scale-75 group-hover:scale-100 transition-all duration-500">
                  <Play size={20} fill="currentColor" strokeWidth={0} className="ml-0.5" />
               </div>
               <span className="text-white font-bold text-sm">Read Now</span>
             </div>
           </div>
        </div>
        
        <div className="absolute top-4 left-4">
          {(book.id.startsWith('ai') || book.author === 'The Magic Lab') && (
            <div className="bg-indigo-600/90 backdrop-blur-md text-white p-1.5 rounded-xl shadow-lg border border-white/20">
              <Sparkles size={14} />
            </div>
          )}
        </div>

        {onToggleFavorite && (
          <button 
            onClick={(e) => onToggleFavorite(e, book.id)}
            className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg backdrop-blur-md border ${
              isFavorite 
                ? 'bg-rose-500 border-rose-400 text-white' 
                : 'bg-white/80 dark:bg-slate-800/80 border-white dark:border-slate-700 text-slate-400 hover:text-rose-500'
            }`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
          </button>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white line-clamp-1 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs font-bold text-slate-400 mb-4 truncate">
          {book.author}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {book.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-black bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-100 dark:border-slate-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
