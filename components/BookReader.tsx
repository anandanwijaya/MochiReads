
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
      <header className={`flex-none flex items-center justify-between px-6 sm:px-12 h-24 border-b-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'}`}>
        <div className="flex items-center gap-8 overflow-hidden">
          <button 
            onClick={onClose}
            className={`flex items-center gap-4 px-6 py-3 rounded-2xl transition-all font-black text-xs border-2 ${isDark ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200'}`}
          >
            <Home size={20} strokeWidth={3} />
            <span className="hidden sm:inline uppercase tracking-[0.2em]">Exit Adventure</span>
          </button>
          
          <h2 className="font-display font-black text-2xl truncate max-w-[150px] sm:max-w-2xl tracking-wide">
            {book.title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleAmbiance}
            className={`p-3 rounded-2xl transition-all border-2 ${isAmbianceActive ? 'bg-brand-blue text-white shadow-lg border-blue-400' : (isDark ? 'bg-slate-800 text-brand-blue border-slate-700' : 'bg-blue-50 text-brand-blue border-blue-100')}`}
          >
            <Music size={22} />
          </button>
          <button 
            onClick={toggleReading}
            className={`p-3 rounded-2xl transition-all border-2 ${isReadingAloud ? 'bg-brand-purple text-white shadow-lg border-purple-400' : (isDark ? 'bg-slate-800 text-brand-purple border-slate-700' : 'bg-brand-purple/10 text-brand-purple border-brand-purple/20')}`}
          >
            {isReadingAloud ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
        </div>
      </header>

      <div className={`flex-1 relative flex flex-col items-center justify-center p-6 sm:p-20 overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-[#fdfbff]'}`}>
        {/* Nav Overlays */}
        <div className="absolute left-0 inset-y-0 w-16 sm:w-32 z-10 flex items-center justify-center pointer-events-none">
          <button 
            onClick={prev}
            disabled={currentPage === 0}
            className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-2xl disabled:opacity-0 transition-all pointer-events-auto border-4 border-transparent hover:scale-110 active:scale-90"
          >
            <ChevronLeft size={32} className="text-brand-blue" />
          </button>
        </div>

        <div className="absolute right-0 inset-y-0 w-16 sm:w-32 z-10 flex items-center justify-center pointer-events-none">
          <button 
            onClick={next}
            className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-2xl transition-all pointer-events-auto border-4 border-transparent hover:scale-110 active:scale-90"
          >
            <ChevronRight size={32} className="text-brand-blue" />
          </button>
        </div>

        {isDone ? (
          <div className={`max-w-2xl w-full text-center p-12 sm:p-24 rounded-[4rem] border-8 animate-in zoom-in duration-500 shadow-3xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'}`}>
             <PartyPopper size={72} className="mx-auto mb-12 text-brand-purple animate-bounce" />
             <h2 className="text-5xl sm:text-7xl font-display font-black mb-10 leading-tight tracking-tight">MAGICAL!</h2>
             <p className="text-2xl sm:text-3xl font-bold mb-16 opacity-80 leading-relaxed tracking-wide text-slate-700 dark:text-slate-300">You finished "{book.title}"!</p>
             <button 
              onClick={() => { setCurrentPage(0); setIsDone(false); }}
              className="px-16 py-8 bg-brand-blue text-white rounded-[2.5rem] font-black text-3xl tactile-button shadow-2xl shadow-brand-blue/30 tracking-wider"
             >
               Read Again
             </button>
          </div>
        ) : (
          <div className={`w-full max-w-7xl h-full flex flex-col rounded-[3.5rem] overflow-hidden border-4 sm:border-8 ${isDark ? 'bg-slate-900 border-slate-900' : 'bg-white border-white'} shadow-2xl`}>
            <div className="flex-[2] min-h-0 bg-slate-50 dark:bg-slate-800 relative">
              <img 
                src={getPageImage(currentPage)}
                className="w-full h-full object-contain"
                alt={`Page ${currentPage + 1}`}
              />
            </div>
            
            <div className={`flex-1 min-h-0 p-10 sm:p-16 overflow-y-auto border-t-4 text-center flex items-center justify-center ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-[2] max-w-5xl mx-auto tracking-widest text-slate-800 dark:text-slate-100">
                {book.pages[currentPage]}
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className={`flex-none px-12 py-8 border-t transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-12">
          <div className="flex-1 flex items-center gap-10">
            <div className="flex-1 h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 dark:border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-brand-blue via-brand-violet to-brand-purple transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[14px] font-black text-slate-500 dark:text-slate-400 whitespace-nowrap uppercase tracking-[0.4em]">
              {currentPage + 1} / {totalPages}
            </span>
          </div>
          <button 
            onClick={() => { playSound('pop'); window.print(); }}
            className={`hidden lg:flex items-center gap-4 px-8 py-3 rounded-2xl font-black text-sm border-2 transition-all tactile-button ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
          >
            <Download size={20} /> <span className="tracking-[0.2em]">SAVE BOOK</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default BookReader;
