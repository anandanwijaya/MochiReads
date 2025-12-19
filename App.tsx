
import { AlertCircle, ArrowRight, BookOpen, Check, Construction, Copy, Database, Loader2, ShieldAlert, Sparkles, Star, TableProperties, Zap, Globe, Trophy, TrendingUp, Clock, Heart } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AuthModal from './components/AuthModal';
import BookGrid, { BookShelf } from './components/BookGrid';
import BookReader from './components/BookReader';
import BookUploadModal from './components/BookUploadModal';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Mascot from './components/Mascot';
import Navbar from './components/Navbar';
import ReadingProgressTable from './components/ReadingProgressTable';
import Achievements from './components/Achievements';
import StoryGenerator from './components/StoryGenerator';
import { getTranslation } from './i18n';
import { seedLibrary, SeedProgress } from './services/seed';
import { playSound } from './components/SoundEffects';
import { fetchReadingProgress, fetchUserFavorites, getManualSession, supabase, toggleFavoriteInDb } from './services/supabase';
import { AppLanguage, Book, Category, LanguageFilter, Level, ViewType } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('library');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedLevel, setSelectedLevel] = useState<Level>('All');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<LanguageFilter>('All');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const initialized = useRef(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('mochi_theme') as 'light' | 'dark') || 'light';
  });
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('mochi_lang') as AppLanguage) || 'en';
  });

  const [favorites, setFavorites] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState<any[]>([]);
  const [latestRead, setLatestRead] = useState<string[]>(() => {
    const saved = localStorage.getItem('mochi_latest');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSeedViewOpen, setIsSeedViewOpen] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress>({ status: 'idle', count: 0, total: 76, message: '' });

  const t = useCallback((key: any) => getTranslation(language, key), [language]);

  const fetchBooks = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const mappedBooks: Book[] = data.map((b: any) => ({
          id: b.id.toString(),
          title: b.title || 'Untitled',
          author: b.author || 'Unknown',
          illustrator: b.illustrator || 'AI',
          description: b.description || '',
          coverImage: b.cover_image_url || 'https://picsum.photos/400/600',
          coverImagePath: b.cover_image_path,
          language: b.language || 'English',
          level: b.level || 1,
          tags: Array.isArray(b.tags) ? b.tags : [],
          pages: Array.isArray(b.pages) ? b.pages : [],
          pageImages: Array.isArray(b.page_images) ? b.page_images : []
        }));
        setBooks(mappedBooks);
      }
    } catch (err: any) {
      console.error('Error fetching books:', err.message || err);
      setBooks([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  const triggerSeed = async () => {
    setIsSeedViewOpen(true);
    playSound('pop');
    await seedLibrary((progress) => {
      setSeedProgress(progress);
      if (progress.status === 'success') {
        playSound('tada');
        setTimeout(() => {
          setIsSeedViewOpen(false);
          fetchBooks(false);
        }, 3000);
      }
    });
  };

  const fetchUserData = useCallback(async (userEmail: string) => {
    try {
      const [favs, progress] = await Promise.all([
        fetchUserFavorites(userEmail),
        fetchReadingProgress(userEmail)
      ]);
      setFavorites(favs);
      setReadingProgress(progress);
    } catch (e) {
      console.warn('User data fetch failure', e);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initApp = async () => {
      setLoading(true);
      await fetchBooks(false);
      const manualUser = await getManualSession();
      if (manualUser) {
        setUser(manualUser);
        await fetchUserData(manualUser.email);
      }
      setLoading(false);
    };
    initApp();
  }, [fetchBooks, fetchUserData]);

  useEffect(() => {
    localStorage.setItem('mochi_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleReadBook = (book: Book) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveBook(book);
    setLatestRead(prev => {
      const filtered = prev.filter(id => id !== book.id);
      const updated = [book.id, ...filtered].slice(0, 10);
      localStorage.setItem('mochi_latest', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleFavorite = async (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    playSound('pop');
    const isFav = favorites.includes(bookId);
    setFavorites(prev => isFav ? prev.filter(id => id !== bookId) : [...prev, bookId]);
    if (!isFav) playSound('tada');
    await toggleFavoriteInDb(user.email, bookId, isFav);
  };

  const handleNavigate = (v: ViewType) => {
    const protectedViews: ViewType[] = ['creator', 'favorites', 'latest', 'recommendations', 'progress', 'achievements'];
    if (!user && protectedViews.includes(v)) {
      setIsAuthModalOpen(true);
      return;
    }
    setView(v);
  };

  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [books, searchQuery]);

  // Curated Shelf Logic
  const shelves = useMemo(() => {
    const featured = books.filter(b => b.tags.includes('Top Pick')).slice(0, 12);
    const magicLab = books.filter(b => b.author === 'The Magic Lab' || b.tags.includes('Magic Lab')).slice(0, 12);
    const langSpecific = books.filter(b => b.language.toLowerCase().includes(selectedLanguageFilter.toLowerCase() === 'all' ? 'english' : selectedLanguageFilter.toLowerCase())).slice(0, 12);
    
    return { featured, magicLab, langSpecific };
  }, [books, selectedLanguageFilter]);

  const finishedCount = readingProgress.filter(p => p.is_finished).length;
  const exploredLanguages = new Set(readingProgress.map(p => {
    const b = books.find(book => book.id === p.book_id);
    return b?.language;
  })).size;

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-[#fdfbff] text-slate-800'}`}>
        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center animate-bounce shadow-xl mb-8">
          <BookOpen size={48} className="text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold animate-pulse">Magicking the Library...</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#fdfbff] text-slate-900'}`}>
      <Navbar 
        onNavigate={handleNavigate}
        onUploadClick={() => setIsUploadModalOpen(true)}
        onSeedClick={triggerSeed}
        activeView={view}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        favoritesCount={favorites.length}
        theme={theme}
        toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        language={language}
        setLanguage={setLanguage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        books={books}
        onReadBook={handleReadBook}
      />

      {/* Floating Global Progress / Achievements shortcut */}
      <div className="fixed top-24 left-6 z-[60] flex flex-col gap-4 pointer-events-none sm:pointer-events-auto">
        <button 
          onClick={() => handleNavigate('achievements')}
          className={`group flex items-center gap-3 px-6 py-3 rounded-[2rem] border-4 transition-all hover:scale-105 active:scale-95 tactile-button shadow-xl ${
            view === 'achievements' 
              ? 'bg-amber-400 border-amber-300 text-white' 
              : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-amber-100 text-amber-500')
          }`}
        >
          <Trophy size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest hidden md:inline">My Map</span>
          {finishedCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white animate-pulse">
              {finishedCount}
            </span>
          )}
        </button>
      </div>

      <main className="w-full">
        {view === 'library' && (
          <div className="relative">
            <Hero onStartCreating={() => handleNavigate('creator')} language={language} theme={theme} />
            
            <div id="library-section" className="pt-20 px-4 sm:px-8 lg:px-12 space-y-24">
              {/* Only show curated shelves if no search/filter is active */}
              {searchQuery === '' && selectedCategory === 'All' && selectedLevel === 'All' && (
                <div className="space-y-20">
                  <BookShelf 
                    title="Featured Stories" 
                    books={shelves.featured} 
                    onRead={handleReadBook} 
                    onToggleFavorite={handleToggleFavorite}
                    favorites={favorites}
                    theme={theme}
                    icon={<TrendingUp size={24} />}
                  />

                  <BookShelf 
                    title={`New in ${selectedLanguageFilter === 'All' ? 'English' : selectedLanguageFilter}`} 
                    books={shelves.langSpecific} 
                    onRead={handleReadBook} 
                    onToggleFavorite={handleToggleFavorite}
                    favorites={favorites}
                    theme={theme}
                    icon={<Globe size={24} />}
                    onSeeAll={() => {
                       document.getElementById('main-grid')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />

                  <BookShelf 
                    title="Created in Magic Lab" 
                    books={shelves.magicLab} 
                    onRead={handleReadBook} 
                    onToggleFavorite={handleToggleFavorite}
                    favorites={favorites}
                    theme={theme}
                    icon={<Sparkles size={24} />}
                  />
                </div>
              )}

              <div id="main-grid" className="scroll-mt-32">
                <BookGrid 
                  books={filteredBySearch}
                  onRead={handleReadBook}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedLevel={selectedLevel}
                  setSelectedLevel={setSelectedLevel}
                  selectedLanguageFilter={selectedLanguageFilter}
                  setSelectedLanguageFilter={setSelectedLanguageFilter}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                  theme={theme}
                  language={language}
                  onSeed={triggerSeed}
                />
              </div>
            </div>
          </div>
        )}

        {view === 'achievements' && (
          <Achievements finishedCount={finishedCount} languageCount={exploredLanguages} theme={theme} />
        )}

        {view === 'creator' && (
          <div className="px-4 sm:px-8 lg:px-12 min-h-screen">
            <StoryGenerator onStoryGenerated={(b) => { handleReadBook(b); fetchBooks(); }} language={language} theme={theme} />
          </div>
        )}

        {view === 'favorites' && (
          <div className="py-12 px-4 sm:px-8 lg:px-12 min-h-screen">
            <div className="flex items-center gap-4 mb-12">
               <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg">
                 <Heart size={32} fill="currentColor" />
               </div>
               <h2 className="text-4xl font-display font-bold">{t('myFavorites')}</h2>
            </div>
            <BookGrid books={filteredBySearch.filter(b => favorites.includes(b.id))} onRead={handleReadBook} hideFilters theme={theme} language={language} onToggleFavorite={handleToggleFavorite} favorites={favorites} />
          </div>
        )}

        {view === 'latest' && (
           <div className="py-12 px-4 sm:px-8 lg:px-12 min-h-screen">
             <div className="flex items-center gap-4 mb-12">
               <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg">
                 <Clock size={32} />
               </div>
               <h2 className="text-4xl font-display font-bold">{t('recent')}</h2>
            </div>
            <BookGrid books={books.filter(b => latestRead.includes(b.id))} onRead={handleReadBook} hideFilters theme={theme} language={language} onToggleFavorite={handleToggleFavorite} favorites={favorites} />
           </div>
        )}

        {view === 'progress' && (
          <div className="py-12 px-4 sm:px-8 lg:px-12 min-h-screen">
            <h2 className="text-4xl font-display font-bold mb-12">My Reading Journey</h2>
            <ReadingProgressTable progressRecords={readingProgress} books={books} onRead={handleReadBook} theme={theme} />
          </div>
        )}
      </main>

      <Footer theme={theme} language={language} onAdminSeed={() => triggerSeed()} />
      <Mascot theme={theme} language={language} />

      {activeBook && (
        <BookReader 
          book={activeBook}
          theme={theme}
          onClose={() => setActiveBook(null)}
          userId={user?.email}
          initialPage={readingProgress.find(p => p.book_id === activeBook.id)?.current_page || 0}
        />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={(u) => { setUser(u); fetchUserData(u.email); setIsAuthModalOpen(false); }} theme={theme} />
      <BookUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={() => fetchBooks(false)} theme={theme} language={language} />
    </div>
  );
};

export default App;
