
import React from 'react';
import { Book } from '../types';
import { Play, Heart, Star, BookOpen, Layers } from 'lucide-react';
import { playSound } from './SoundEffects';

interface BookCardProps {
  book: Book;
  onRead: (book: Book) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onRead, isFavorite, onToggleFavorite }) => {
  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-white dark:border-slate-800 puffy-shadow hover:-translate-y-3 transition-all duration-300 cursor-pointer flex flex-col h-full w-full will-change-transform"
      onClick={() => { playSound('pop'); onRead(book); }}
    >
      {/* Glossy Cover Image */}
      <div className="aspect-[3/4] w-full relative overflow-hidden bg-brand-softPurple">
        <img 
          src={book.coverImage} 
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Level Tag */}
        <div className="absolute top-5 left-5 z-10">
          <div className="bg-brand-purple/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-2xl shadow-xl border-2 border-white/30 flex items-center gap-2">
            <Star size={14} fill="currentColor" className="text-brand-amber" />
            <span className="text-[11px] font-black uppercase tracking-widest">LVL {book.level}</span>
          </div>
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(e, book.id); }}
          className={`absolute top-5 right-5 w-11 h-11 rounded-2xl flex items-center justify-center transition-all border-2 z-20 hover:scale-110 active:scale-90 ${
            isFavorite 
              ? 'bg-brand-rose text-white border-white shadow-lg' 
              : 'bg-white/80 backdrop-blur-md text-slate-400 border-brand-lavender'
          }`}
        >
          <Heart size={22} fill={isFavorite ? "currentColor" : "none"} strokeWidth={3} />
        </button>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-purple/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-brand-purple shadow-[0_15px_35px_rgba(124,58,237,0.4)] scale-50 group-hover:scale-100 transition-all duration-300">
              <Play size={36} fill="currentColor" strokeWidth={0} className="ml-1.5" />
           </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-7 flex flex-col flex-grow">
        <h3 className="font-display font-black text-2xl text-brand-violet dark:text-white line-clamp-2 leading-tight mb-5 group-hover:text-brand-purple transition-colors">
          {book.title}
        </h3>
        
        <div className="mt-auto pt-5 flex items-center justify-between border-t border-brand-lavender/50">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-softPurple dark:bg-slate-800 text-brand-purple">
            <Layers size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {book.tags[0] || 'Story'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <BookOpen size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {book.language}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
