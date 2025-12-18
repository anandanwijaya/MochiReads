import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Info, Share2, Download, Sun, Star, Home, PartyPopper, X } from 'lucide-react';
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
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const synth = window.speechSynthesis;
  
  const totalPages = book.pages.length;
  const progress = ((currentPage + 1) / totalPages) * 100;

  // Track progress when page changes or book finishes
  useEffect(() => {
    if (userId) {
      updateReadingProgress(userId, book.id, currentPage, isDone);
    }
  }, [currentPage, isDone, userId, book.id]);

  const stopReading = () => {
    synth.cancel();
    setIsReadingAloud(false);
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

  const handleShare = async () => {
    playSound('pop');
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Check out this amazing story: ${book.title} by ${book.author}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('Sharing is not supported on this browser. Copy the URL to share!');
    }
  };

  const handleDownload = () => {
    playSound('pop');
    window.print();
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
    };
  }, [onClose, currentPage]);

  const isDark = theme === 'dark';

  const getPageImage = (idx: number) => {
    if (idx === 0) return book.coverImage;
    if (book.pageImages && book.pageImages[idx]) return book.pageImages[idx];
    return `https://picsum.photos/seed/${book.id}-${idx}/800/600`;
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} overflow-hidden font-sans print:relative print:block print:bg-white`}>
      <header className={`flex-none flex items-center justify-between px-4 sm:px-6 h-20 border-b-4 z-50 print:hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50'}`}>
        <div className="flex items-center h-full">
          <button 
            onClick={() => { playSound('pop'); onClose(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-black text-sm border-2 ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-100'}`}
          >
            <Home size={20} strokeWidth={3} />
            <span className="hidden sm:inline">Library</span>
          </button>
          
          <div className={`h-10 w-[2px] mx-6 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          
          <div className="flex flex-col justify-center max-w-[150px] sm:max-w-xs md:max-w-md">
            <h2 className={`font-display font-bold text-lg sm:text-xl leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {book.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{book.language}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>Level {book.level}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => { playSound('pop'); toggleReading(); }}
            className={`p-2.5 sm:p-3 rounded-2xl transition-all shadow-sm ${isReadingAloud ? 'bg-fuchsia-100 text-fuchsia-600' : (isDark ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-amber-50 text-amber-400 hover:bg-amber-100')}`}
            title={isReadingAloud ? "Stop Reading" : "Read Aloud"}
          >
            {isReadingAloud ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button 
            onClick={handleShare}
            className={`p-2.5 sm:p-3 rounded-2xl transition-all shadow-sm ${isDark ? 'bg-slate-800 text-purple-400 hover:bg-slate-700' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
            title="Share Story"
          >
            <Share2 size={24} />
          </button>
          <button 
            onClick={() => { playSound('pop'); setShowInfo(!showInfo); }}
            className={`p-2.5 sm:p-3 rounded-2xl transition-all shadow-sm ${showInfo ? (isDark ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-700') : (isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}`}
            title="Story Info"
          >
            <Info size={24} />
          </button>
        </div>
      </header>

      {showInfo && (
        <div className={`absolute top-24 right-6 z-[110] w-80 rounded-3xl shadow-2xl border-4 p-6 animate-in slide-in-from-top-4 duration-300 print:hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Story Details</h3>
            <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About this book</p>
              <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{book.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Author</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{book.author}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Illustrator</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{book.illustrator}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 relative flex flex-col items-center overflow-hidden print:bg-white print:overflow-visible ${isDark ? 'bg-slate-950' : 'bg-[#fdfbff]'}`}>
        <div className="absolute left-4 sm:left-6 inset-y-0 z-10 hidden lg:flex items-center print:hidden">
          <button 
            onClick={prev}
            disabled={currentPage === 0}
            className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-[2rem] shadow-xl text-purple-600 disabled:opacity-20 transition-all border-4 group hover:scale-110 active:scale-90 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50'}`}
          >
            <ChevronLeft size={32} strokeWidth={4} />
          </button>
        </div>

        <div className="absolute right-4 sm:right-6 inset-y-0 z-10 hidden lg:flex items-center print:hidden">
          <button 
            onClick={next}
            className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-[2rem] shadow-xl text-purple-600 transition-all border-4 group hover:scale-110 active:scale-90 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50'}`}
          >
            <ChevronRight size={32} strokeWidth={4} />
          </button>
        </div>

        <div className="w-full h-full flex flex-col items-center justify-center px-4 py-8 lg:py-12 overflow-hidden print:p-0 print:block print:h-auto">
          {isDone ? (
            <div className={`max-w-xl w-full text-center p-8 sm:p-12 rounded-[3rem] shadow-2xl border-8 animate-in fade-in zoom-in duration-500 print:hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-100'}`}>
               <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce ${isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                  <PartyPopper size={48} />
               </div>
               <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>YOU DID IT!</h2>
               <p className={`text-lg sm:text-xl font-bold mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>You finished reading "{book.title}"! You're a super reader!</p>
               <div className="flex flex-col gap-4">
                 <button 
                  onClick={() => { playSound('pop'); setIsDone(false); setCurrentPage(0); }}
                  className="px-8 py-4 bg-purple-600 text-white rounded-[2rem] font-black text-xl shadow-[0_8px_0_0_#7e22ce] hover:translate-y-[2px] active:translate-y-[8px] active:shadow-none transition-all"
                 >
                   Read Again
                 </button>
                 <button 
                  onClick={() => { playSound('pop'); onClose(); }}
                  className={`px-8 py-4 rounded-[2rem] font-black text-xl transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                 >
                   Back to Library
                 </button>
               </div>
            </div>
          ) : (
            <div className={`max-w-3xl w-full h-full max-h-full flex flex-col rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.1)] overflow-hidden border-8 animate-in slide-in-from-bottom-10 duration-500 print:shadow-none print:border-0 print:rounded-none print:max-h-none print:h-auto ${isDark ? 'bg-slate-900 border-slate-900' : 'bg-white border-white'}`}>
              <div className={`flex-1 min-h-0 relative print:bg-white ${isDark ? 'bg-slate-800' : 'bg-purple-50/20'}`}>
                <img 
                  src={getPageImage(currentPage)}
                  className="w-full h-full object-contain p-4 print:p-0"
                  alt={`Illustration ${currentPage + 1}`}
                />
              </div>
              
              <div className={`flex-none p-6 sm:p-12 text-center overflow-y-auto max-h-[35%] border-t-2 print:max-h-none print:border-0 print:p-8 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-50 text-slate-700'}`}>
                <p className="text-xl sm:text-3xl lg:text-4xl font-display font-bold leading-relaxed">
                  {book.pages[currentPage]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className={`flex-none z-50 print:hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className={`w-full h-8 sm:h-10 relative flex items-center ${isDark ? 'bg-slate-900' : 'bg-purple-50'}`}>
          <div className="absolute inset-0 flex items-center px-4">
             <div className={`w-full h-2 sm:h-3 rounded-full overflow-hidden shadow-inner border-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-100'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
             </div>
          </div>
          <div 
            className="absolute top-0 transition-all duration-700 ease-out z-10"
            style={{ left: `calc(${progress}% - 16px)` }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
               <Sun size={20} fill="white" strokeWidth={0} />
            </div>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between transition-colors ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => { playSound('pop'); setShowThumbnails(!showThumbnails); }}
              className={`px-4 sm:px-6 py-2 rounded-2xl text-[10px] sm:text-xs font-black transition-all border-4 ${
                showThumbnails 
                  ? (isDark ? 'bg-fuchsia-700 border-fuchsia-700 text-white' : 'bg-fuchsia-600 border-fuchsia-600 text-white shadow-lg') 
                  : (isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-fuchsia-900' : 'bg-white border-slate-100 text-slate-500 hover:border-fuchsia-200')
              }`}
            >
              THUMBNAILS
            </button>
            <div className="flex items-center gap-2">
               <Star size={16} fill="#a855f7" strokeWidth={0} />
               <span className={`text-[10px] sm:text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {currentPage + 1} / {totalPages}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownload}
              className={`flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-slate-900 text-purple-400 hover:bg-slate-800' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
            >
              <Download size={16} strokeWidth={3} />
              <span className="hidden sm:inline">Save Story</span>
            </button>
          </div>
        </div>

        {showThumbnails && (
          <div className={`p-4 border-t-4 overflow-x-auto flex gap-4 no-scrollbar animate-in slide-in-from-bottom-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            {book.pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { playSound('pop'); setCurrentPage(idx); }}
                className={`relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-4 transition-all ${
                  currentPage === idx 
                    ? 'border-purple-600 ring-4 ring-purple-100/20 scale-105 z-10 shadow-xl' 
                    : `opacity-60 hover:opacity-100 ${isDark ? 'border-slate-800' : 'border-white'}`
                }`}
              >
                <img 
                  src={getPageImage(idx)}
                  className="w-full h-full object-cover"
                  alt={`Page ${idx + 1}`}
                />
                <div className="absolute bottom-1 right-2 text-[10px] text-white font-black drop-shadow-md">
                  {idx + 1}
                </div>
              </button>
            ))}
          </div>
        )}
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media print {
          body { visibility: hidden; }
          .print-content { visibility: visible; }
        }
      `}</style>
    </div>
  );
};

export default BookReader;