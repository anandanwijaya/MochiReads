
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Book } from '../types';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Info, Share2, Download, Sun, Star, Home, PartyPopper, X, Music, Sparkles, FileDown } from 'lucide-react';
import { playSound } from './SoundEffects';
import { supabase, updateReadingProgress } from '../services/supabase';

interface BookReaderProps {
  book: Book;
  theme: 'light' | 'dark';
  onClose: () => void;
  userId?: string;
  initialPage?: number;
  autoPrint?: boolean;
}

const BookReader: React.FC<BookReaderProps> = ({ book, theme, onClose, userId, initialPage = 0, autoPrint = false }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isDone, setIsDone] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isAmbianceActive, setIsAmbianceActive] = useState(false);
  const synth = window.speechSynthesis;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const totalPages = (book.pages || []).length;
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  const isPdfUpload = book.tags.includes('PDF');
  const hasText = !!book.pages[currentPage]?.trim();

  // Reading progress persistence
  useEffect(() => {
    if (userId && totalPages > 0) {
      updateReadingProgress(userId, book.id, currentPage, isDone);
    }
  }, [currentPage, isDone, userId, book.id, totalPages]);

  // Handle auto-print if triggered
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const stopReading = () => {
    synth.cancel();
    setIsReadingAloud(false);
  };

  const getAmbianceUrl = (book: Book): string => {
    const tags = (book.tags || []).map(t => t.toLowerCase());
    
    if (tags.includes('science')) return 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3';
    if (tags.includes('animal stories')) return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';
    if (tags.includes('adventure')) return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    if (tags.includes('folk tales')) return 'https://assets.mixkit.co/music/preview/mixkit-dreamy-lullaby-vibe-114.mp3';
    if (tags.includes('life skills')) return 'https://assets.mixkit.co/music/preview/mixkit-peaceful-piano-ambience-109.mp3';
    
    return 'https://assets.mixkit.co/music/preview/mixkit-sun-and-clouds-585.mp3';
  };

  const FALLBACK_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

  useEffect(() => {
    const url = getAmbianceUrl(book);
    const audio = new Audio();
    
    const handleError = () => {
      console.warn("Primary ambiance source failed, trying fallback:", url);
      if (audio.src !== FALLBACK_AUDIO) {
        audio.src = FALLBACK_AUDIO;
        audio.load();
      } else {
        setIsAmbianceActive(false);
      }
    };

    audio.addEventListener('error', handleError);
    audio.src = url;
    audio.loop = true;
    audio.volume = 0.12;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      audio.load();
      audioRef.current = null;
    };
  }, [book.id]);

  const toggleAmbiance = async () => {
    playSound('pop');
    if (!audioRef.current) return;

    try {
      if (!isAmbianceActive) {
        await audioRef.current.play();
        setIsAmbianceActive(true);
      } else {
        audioRef.current.pause();
        setIsAmbianceActive(false);
      }
    } catch (error) {
      console.error("Ambiance playback failed:", error);
      if (audioRef.current.src !== FALLBACK_AUDIO) {
        audioRef.current.src = FALLBACK_AUDIO;
        try {
          await audioRef.current.play();
          setIsAmbianceActive(true);
        } catch (innerError) {
          setIsAmbianceActive(false);
        }
      } else {
        setIsAmbianceActive(false);
      }
    }
  };

  const toggleReading = () => {
    if (isReadingAloud) {
      stopReading();
    } else {
      const textToRead = book.pages[currentPage];
      if (!textToRead || !textToRead.trim()) return;
      const utterance = new SpeechSynthesisUtterance(textToRead);
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

  const handlePrint = () => {
    playSound('pop');
    window.print();
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
    };
  }, [onClose, currentPage, totalPages]);

  const isDark = theme === 'dark';

  const getPageImage = (idx: number) => {
    if (idx === 0) return book.coverImage;
    if (book.pageImages && book.pageImages[idx]) return book.pageImages[idx];
    return `https://loremflickr.com/800/600/illustration,drawing,cartoon,children,cute,storybook?lock=${book.id.length + idx}`;
  };

  const printRoot = document.getElementById('print-root');
  const printPortalContent = printRoot ? createPortal(
    <div className="print-magic-container">
      <div className="print-page-break">
        <h1 className="print-cover-title">{book.title}</h1>
        <p className="print-author">Created by {book.author}</p>
        <img 
          src={book.coverImage} 
          className="print-page-image" 
          style={{ height: '175mm' }} 
          crossOrigin="anonymous" 
          loading="eager"
        />
      </div>
      {book.pages.map((text, idx) => (
        <div key={idx} className="print-page-break">
          <img 
            src={getPageImage(idx)} 
            className="print-page-image" 
            crossOrigin="anonymous" 
            loading="eager"
          />
          <p className="print-page-text">{text}</p>
          <div style={{ position: 'absolute', bottom: '15mm', width: '100%', textAlign: 'center', fontSize: '12pt', color: '#999', fontWeight: 'bold' }}>
            Page {idx + 1} of {book.pages.length}
          </div>
        </div>
      ))}
    </div>,
    printRoot
  ) : null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-950'} overflow-hidden font-sans`}>
      {printPortalContent}
      
      <header className={`flex-none flex items-center justify-between px-4 sm:px-12 h-20 sm:h-24 border-b-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-4 sm:gap-8 overflow-hidden flex-1">
          <button 
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all font-black text-[10px] sm:text-xs border-2 ${isDark ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-950 hover:bg-slate-100 border-slate-200'}`}
          >
            <Home size={18} strokeWidth={3} />
            <span className="hidden sm:inline uppercase tracking-widest">EXIT</span>
          </button>
          <h2 className="font-display font-black text-lg sm:text-2xl truncate tracking-wide pr-4">
            {book.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={toggleAmbiance} 
            title="Toggle Music" 
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all border-2 relative ${isAmbianceActive ? 'bg-brand-blue text-white shadow-lg' : (isDark ? 'bg-slate-800 text-brand-blue border-slate-700' : 'bg-slate-50 text-brand-blue border-slate-200')}`}
          >
            <Music size={20} className={isAmbianceActive ? 'animate-pulse' : ''} />
          </button>
          {hasText && (
            <button 
              onClick={toggleReading} 
              title="Read Aloud" 
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all border-2 ${isReadingAloud ? 'bg-brand-purple text-white shadow-lg' : (isDark ? 'bg-slate-800 text-brand-purple border-slate-700' : 'bg-slate-50 text-brand-purple border-slate-200')}`}
            >
              {isReadingAloud ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}
        </div>
      </header>

      <div className={`flex-1 relative flex flex-col items-center justify-center p-4 sm:p-12 md:p-16 overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-[#fdfbff]'}`}>
        <div className="absolute left-0 inset-y-0 w-12 sm:w-24 md:w-32 z-10 flex items-center justify-center pointer-events-none">
          <button 
            onClick={prev} 
            disabled={currentPage === 0} 
            className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl disabled:opacity-0 transition-all pointer-events-auto border-4 border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-90"
          >
            <ChevronLeft size={24} className="text-brand-blue" />
          </button>
        </div>
        <div className="absolute right-0 inset-y-0 w-12 sm:w-24 md:w-32 z-10 flex items-center justify-center pointer-events-none">
          <button 
            onClick={next} 
            className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl transition-all pointer-events-auto border-4 border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-90"
          >
            <ChevronRight size={24} className="text-brand-blue" />
          </button>
        </div>

        {isDone ? (
          <div className={`max-w-xl w-full text-center p-8 sm:p-16 rounded-[3rem] sm:rounded-[4rem] border-8 animate-in zoom-in duration-300 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
             <PartyPopper size={64} className="mx-auto mb-8 text-brand-purple animate-bounce" />
             <h2 className="text-4xl sm:text-6xl font-display font-black mb-6 leading-tight tracking-tight uppercase text-brand-purple">You Rule!</h2>
             <p className="text-xl sm:text-2xl font-bold mb-10 opacity-90 leading-relaxed tracking-wide text-slate-950 dark:text-slate-200">You finished "{book.title}"!</p>
             <div className="flex flex-col gap-4 items-center">
               <button onClick={() => { setCurrentPage(0); setIsDone(false); }} className="px-12 py-5 bg-brand-blue text-white rounded-[2rem] font-black text-2xl tactile-button shadow-lg w-full tracking-widest">
                 READ AGAIN
               </button>
               <button onClick={handlePrint} className="px-10 py-4 bg-white text-brand-purple border-4 border-brand-lavender rounded-[1.5rem] font-black text-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-md w-full justify-center">
                 <FileDown size={20} strokeWidth={3} /> SAVE AS PDF
               </button>
             </div>
          </div>
        ) : (
          <div className={`w-full max-w-6xl h-full flex flex-col rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden border-4 sm:border-8 ${isDark ? 'bg-slate-900 border-slate-900' : 'bg-white border-white'} shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`min-h-0 relative flex-1 ${isPdfUpload ? '' : 'flex-[1.5]'}`}>
              <img src={getPageImage(currentPage)} className="w-full h-full object-contain" alt={`Page ${currentPage + 1}`} />
            </div>
            {!isPdfUpload && hasText && (
              <div className={`min-h-0 p-8 sm:p-12 overflow-y-auto border-t-4 text-center flex items-center justify-center flex-1 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-50 bg-[#fdfbff]'}`}>
                <p className="text-xl sm:text-2xl lg:text-3xl font-display font-bold leading-relaxed max-w-4xl mx-auto tracking-wide text-slate-900 dark:text-slate-100">
                  {book.pages[currentPage]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className={`flex-none px-6 sm:px-12 py-4 sm:py-6 border-t transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 sm:gap-12">
          <div className="flex-1 flex items-center gap-4 sm:gap-10">
            <div className="flex-1 h-3 sm:h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border dark:border-slate-700">
              <div className="h-full bg-brand-blue transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[11px] sm:text-[14px] font-black text-slate-600 dark:text-slate-300 whitespace-nowrap uppercase tracking-[0.3em]">
              {currentPage + 1} / {totalPages}
            </span>
          </div>
          <button onClick={handlePrint} className={`hidden md:flex items-center gap-3 px-6 py-2.5 rounded-xl font-black text-[10px] border-2 transition-all tactile-button ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-950'}`}>
            <Download size={16} /> <span className="tracking-widest uppercase">Save PDF</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default BookReader;
