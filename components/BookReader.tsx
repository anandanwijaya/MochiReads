
import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Info, Share2, Download, Sun, Star, Home, PartyPopper, X, Music, Sparkles } from 'lucide-react';
import { playSound } from './SoundEffects';
import { supabase, updateReadingProgress } from '../services/supabase';

interface BookReaderProps {
  book: Book;
  theme: 'light' | 'dark';
  onClose: () => void;
  userId?: string;
  initialPage?: number;
}

const BookReader: React.FC<BookReaderProps> = ({ book, theme, onClose, userId, initialPage = 0 }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isDone, setIsDone] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isAmbianceActive, setIsAmbianceActive] = useState(false);
  const synth = window.speechSynthesis;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const totalPages = book.pages.length;
  const progress = ((currentPage + 1) / totalPages) * 100;

  useEffect(() => {
    if (userId) {
      updateReadingProgress(userId, book.id, currentPage, isDone);
    }
  }, [currentPage, isDone, userId, book.id]);

  const stopReading = () => {
    synth.cancel();
    setIsReadingAloud(false);
  };

  const toggleAmbiance = () => {
    playSound('pop');
    if (!isAmbianceActive) {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2034/2034-preview.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
      audioRef.current.play().catch(() => {});
      setIsAmbianceActive(true);
    } else {
      if (audioRef.current) audioRef.current.pause();
      setIsAmbianceActive(false);
    }
  };

  const toggleReading = () => {
    if (isReadingAloud) {
      stopReading();
    } else {
      const utterance = new SpeechSynthesisUtterance(book.pages[currentPage]);
      utterance.onend = () => setIsReadingAloud(false);
      utterance.onerror = () => setIsReadingAloud(false);
      setIsReadingAloud(true);
      synth.speak(utterance);
    }
  };

  const next = () => {
    stopReading();
    if (currentPage === totalPages - 1) {
      setIsDone(true);
      playSound('tada');
    } else {
      playSound('woosh');
      setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    }
  };

  const prev = () => {
    stopReading();
    playSound('woosh');
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopReading();
      if (audioRef.current) audioRef.current.pause();
    };
  }, [onClose, currentPage]);

  const isDark = theme === 'dark';

  const getPageImage = (idx: number) => {
    if (idx === 0) return book.coverImage;
    if (book.pageImages && book.pageImages[idx]) return book.pageImages[idx];
    return `https://loremflickr.com/800/600/colorful,2D,cartoon,children,cute,smiling,animals,playful?lock=${book.id.length + idx}`;
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} overflow-hidden font-sans`}>
      <header className={`flex-none flex items-center justify-between px-4 sm:px-8 h-16 sm:h-24 border-b-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50'}`}>
        <div className="flex items-center gap-3 sm:gap-6 overflow-hidden">
          <button 
            onClick={onClose}
            className={`flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-2xl transition-all font-black text-xs sm:text-sm border-2 ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-100'}`}
          >
            <Home size={18} strokeWidth={3} />
            <span className="hidden sm:inline">Exit</span>
          </button>
          
          <h2 className="font-display font-bold text-base sm:text-2xl truncate max-w-[200px] sm:max-w-md">
            {book.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleAmbiance}
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${isAmbianceActive ? 'bg-indigo-100 text-indigo-600' : (isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-400')}`}
          >
            <Music size={20} />
          </button>
          <button 
            onClick={toggleReading}
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${isReadingAloud ? 'bg-fuchsia-100 text-fuchsia-600' : (isDark ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-400')}`}
          >
            {isReadingAloud ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      <div className={`flex-1 relative flex flex-col items-center justify-center p-4 sm:p-12 overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-[#fdfbff]'}`}>
        {/* Nav Overlays - Accessible hit areas */}
        <div className="absolute left-0 inset-y-0 w-12 sm:w-24 z-10 flex items-center justify-center pointer-events-none">
          <button 
            onClick={prev}
            disabled={currentPage === 0}
            className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-2xl disabled:opacity-0 transition-all pointer-events-auto border-4 border-transparent hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={24} className="sm:size-10 text-indigo-600" />
          </button>
        </div>

        <div className="absolute right-0 inset-y-0 w-12 sm:w-24 z-10 flex items-center justify-center pointer-events-none">
          <button 
            onClick={next}
            className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-2xl transition-all pointer-events-auto border-4 border-transparent hover:scale-110 active:scale-95"
          >
            <ChevronRight size={24} className="sm:size-10 text-indigo-600" />
          </button>
        </div>

        {isDone ? (
          <div className={`max-w-xl w-full text-center p-8 sm:p-16 rounded-[3rem] border-8 animate-in zoom-in duration-500 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-100'}`}>
             <PartyPopper size={64} className="mx-auto mb-8 text-fuchsia-500 animate-bounce" />
             <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6">MAGICAL!</h2>
             <p className="text-lg sm:text-2xl font-bold mb-10 opacity-70">You finished "{book.title}"!</p>
             <button 
              onClick={() => { setCurrentPage(0); setIsDone(false); }}
              className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-[0_8px_0_0_#4338ca] hover:translate-y-[2px] active:translate-y-[6px] transition-all"
             >
               Read Again
             </button>
          </div>
        ) : (
          <div className={`w-full max-w-5xl h-full flex flex-col rounded-[2.5rem] overflow-hidden border-4 sm:border-8 ${isDark ? 'bg-slate-900 border-slate-900' : 'bg-white border-white'} shadow-2xl`}>
            <div className="flex-[2] min-h-0 bg-slate-50 dark:bg-slate-800 relative">
              <img 
                src={getPageImage(currentPage)}
                className="w-full h-full object-contain"
                alt={`Page ${currentPage + 1}`}
              />
            </div>
            
            <div className={`flex-1 min-h-0 p-6 sm:p-12 overflow-y-auto border-t-2 text-center flex items-center justify-center ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
              <p className="text-xl sm:text-3xl lg:text-4xl font-display font-bold leading-relaxed max-w-3xl mx-auto">
                {book.pages[currentPage]}
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className={`flex-none px-6 py-4 border-t transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-black text-slate-400 whitespace-nowrap">
              {currentPage + 1} / {totalPages}
            </span>
          </div>
          <button 
            onClick={() => { playSound('pop'); window.print(); }}
            className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
          >
            <Download size={18} /> Save Story
          </button>
        </div>
      </footer>
    </div>
  );
};

export default BookReader;
