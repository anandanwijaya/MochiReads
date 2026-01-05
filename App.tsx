
import { BookOpen, Clock, Globe, Heart, Sparkles, TrendingUp, Trophy, Trash2, PenTool, Upload, Loader2, FileDown } from 'lucide-react';
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
import { fetchReadingProgress, fetchUserFavorites, fetchUserCreatedBooks, getManualSession, supabase, toggleFavoriteInDb } from './services/supabase';
import { AppLanguage, Book, Category, LanguageFilter, Level, ViewType } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('library');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [shouldAutoPrint, setShouldAutoPrint] = useState(false);
  const [books, setBooks] = useState<Book[]>([]); 
  const [userCreatedBooks, setUserCreatedBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedLevel, setSelectedLevel] = useState<Level>('All');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<LanguageFilter>('All');
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const initialized = useRef(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('mochi_theme') as 'light' | 'dark') || 'light');
  const [language, setLanguage] = useState<AppLanguage>(() => (localStorage.getItem('mochi_lang') as AppLanguage) || 'en');

  const [favorites, setFavorites] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState<any[]>([]);
  const [latestRead, setLatestRead] = useState<string[]>(() => {
    const saved = localStorage.getItem('mochi_latest');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSeedViewOpen, setIsSeedViewOpen] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress>({ status: 'idle', count: 0, total: 76, message: '' });

  const t = useCallback((key: any) => getTranslation(language, key), [language]);

  useEffect(() => {
    document.body.style.overflow = activeBook || isSeedViewOpen || isDownloading ? 'hidden' : 'unset';
  }, [activeBook, isSeedViewOpen, isDownloading]);

  const fetchBooks = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const { data, error } = await supabase.from('books').select('id, title, author, illustrator, description, cover_image_url, language, level, tags, pages, page_images, created_by, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setBooks(data.map((b: any) => ({
          id: b.id.toString(),
          title: b.title || 'Untitled',
          author: b.author || 'Unknown',
          illustrator: b.illustrator || 'AI',
          description: b.description || '',
          coverImage: b.cover_image_url || 'https://loremflickr.com/600/450/storybook',
          language: b.language || 'English',
          level: b.level || 1,
          tags: b.tags || [],
          pages: b.pages || [],
          pageImages: b.page_images || [],
          created_by: b.created_by
        })));
      }
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setBooks([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  const triggerSeed = async () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    setIsSeedViewOpen(true);
    playSound('pop');
    await seedLibrary((progress) => {
      setSeedProgress(progress);
      if (progress.status === 'success') {
        playSound('tada');
        setTimeout(() => { setIsSeedViewOpen(false); fetchBooks(false); }, 3000);
      }
    });
  };

  const fetchUserData = useCallback(async (userEmail: string) => {
    try {
      const [favs, progress, created] = await Promise.all([
        fetchUserFavorites(userEmail), 
        fetchReadingProgress(userEmail),
        fetchUserCreatedBooks(userEmail)
      ]);
      setFavorites(favs);
      setReadingProgress(progress);
      setUserCreatedBooks(created.map((b: any) => ({
        id: b.id.toString(),
        title: b.title || 'Untitled',
        author: b.author || 'Unknown',
        illustrator: b.illustrator || 'AI',
        description: b.description || '',
        coverImage: b.cover_image_url || 'https://loremflickr.com/600/450/storybook',
        language: b.language || 'English',
        level: b.level || 1,
        tags: b.tags || [],
        pages: b.pages || [],
        pageImages: b.page_images || []
      })));
    } catch (e) { console.warn('User data fetch failure', e); }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const initApp = async () => {
      setLoading(true);
      await fetchBooks(false);
      const manualUser = await getManualSession();
      if (manualUser) { setUser(manualUser); await fetchUserData(manualUser.email); }
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
    if (!user) { setIsAuthModalOpen(true); return; }
    setShouldAutoPrint(false);
    setActiveBook(book);
    setLatestRead(prev => {
      const updated = [book.id, ...prev.filter(id => id !== book.id)].slice(0, 10);
      localStorage.setItem('mochi_latest', JSON.stringify(updated));
      return updated;
    });
  };

  const clearLatestRead = () => {
    if (confirm("Clear your reading history?")) {
      playSound('woosh');
      setLatestRead([]);
      localStorage.removeItem('mochi_latest');
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    if (!user) { setIsAuthModalOpen(true); return; }
    playSound('pop');
    const isFav = favorites.includes(bookId);
    setFavorites(prev => isFav ? prev.filter(id => id !== bookId) : [...prev, bookId]);
    if (!isFav) playSound('tada');
    await toggleFavoriteInDb(user.email, bookId, isFav);
  };

  const handleNavigate = (v: ViewType) => {
    if (!user && ['creator', 'favorites', 'latest', 'progress', 'achievements', 'my-stories'].includes(v)) { setIsAuthModalOpen(true); return; }
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setUser(null);
    setFavorites([]);
    setReadingProgress([]);
    setUserCreatedBooks([]);
    setView('library');
  };

  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [books, searchQuery]);

  const shelves = useMemo(() => ({
    featured: books.filter(b => b.tags.includes('Top Pick')).slice(0, 15),
    magicLab: books.filter(b => b.author === 'The Magic Lab' || b.tags.includes('Magic Lab')).slice(0, 15),
    langSpecific: books.filter(b => b.language.toLowerCase().includes(selectedLanguageFilter === 'All' ? 'english' : selectedLanguageFilter.toLowerCase())).slice(0, 15)
  }), [books, selectedLanguageFilter]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-brand-softPurple text-brand-purple'}`}>
        <div className="w-24 h-24 bg-brand-purple rounded-[2.5rem] flex items-center justify-center animate-bounce-slow shadow-[0_20px_40px_rgba(124,58,237,0.3)] mb-10 border-4 border-white">
          <BookOpen size={48} className="text-white" strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-display font-black animate-pulse tracking-widest text-brand-purple uppercase text-center px-6">Summoning Magic Library...</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col w-full overflow-x-hidden ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      <Navbar 
        onNavigate={handleNavigate} onUploadClick={() => user ? setIsUploadModalOpen(true) : setIsAuthModalOpen(true)}
        onSeedClick={triggerSeed} activeView={view} user={user} onLogout={handleLogout} onLoginClick={() => setIsAuthModalOpen(true)}
        favoritesCount={favorites.length} theme={theme} toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        language={language} setLanguage={setLanguage} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        books={books} onReadBook={handleReadBook}
      />

      {isDownloading && (
        <div className="fixed inset-0 z-[300] bg-brand-purple/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-10 animate-in fade-in duration-300">
           <div className="relative mb-12">
             <div className="absolute inset-0 bg-white/20 blur-3xl animate-pulse rounded-full" />
             <div className="relative w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-brand-purple shadow-2xl border-4 border-white/50 animate-bounce-slow">
               <FileDown size={64} strokeWidth={3} />
             </div>
           </div>
           <h2 className="text-5xl font-display font-black mb-4 tracking-tight uppercase text-center">Preparing Magic PDF...</h2>
           <p className="text-xl font-bold opacity-80 max-w-md text-center">Our story pixies are gathering the pages for your offline adventure!</p>
        </div>
      )}

      <div className="fixed top-28 left-6 sm:left-12 z-[60] pointer-events-none sm:pointer-events-auto transition-all duration-300">
        <button 
          onClick={() => handleNavigate('achievements')}
          className={`group flex items-center gap-4 px-6 py-4 rounded-[1.5rem] border-4 transition-all hover:scale-110 active:scale-95 tactile-button shadow-2xl ${
            view === 'achievements' 
              ? 'bg-brand-purple border-white text-white' 
              : (theme === 'dark' ? 'bg-slate-800/80 border-slate-700 text-brand-purple backdrop-blur-md' : 'bg-white/80 border-brand-lavender text-brand-purple backdrop-blur-md')
          }`}
        >
          <Trophy size={22} className="group-hover:rotate-12 transition-transform text-brand-amber" />
          <span className="text-xs font-black uppercase tracking-[0.2em] hidden lg:inline">Adventure Map</span>
          {readingProgress.filter(p => p.is_finished).length > 0 && (
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-brand-rose text-white text-[11px] font-black flex items-center justify-center rounded-full border-4 border-white shadow-lg">
              {readingProgress.filter(p => p.is_finished).length}
            </span>
          )}
        </button>
      </div>

      <main className="flex-1 w-full flex flex-col pt-24 sm:pt-28">
        <div className="animate-in fade-in duration-500">
          {view === 'library' && (
            <div className="flex flex-col w-full">
              <Hero onStartCreating={() => handleNavigate('creator')} language={language} theme={theme} />
              
              <div id="library-section" className="space-y-32 py-16 w-full">
                {searchQuery === '' && selectedCategory === 'All' && selectedLevel === 'All' && (
                  <div className="space-y-32">
                    <BookShelf title="Magical Picks" books={shelves.featured} onRead={handleReadBook} onToggleFavorite={handleToggleFavorite} favorites={favorites} theme={theme} icon={<TrendingUp />} />
                    <BookShelf title={`${selectedLanguageFilter === 'All' ? 'English' : selectedLanguageFilter} Adventures`} books={shelves.langSpecific} onRead={handleReadBook} onToggleFavorite={handleToggleFavorite} favorites={favorites} theme={theme} icon={<Globe />} />
                    <BookShelf title="AI Lab Creations" books={shelves.magicLab} onRead={handleReadBook} onToggleFavorite={handleToggleFavorite} favorites={favorites} theme={theme} icon={<Sparkles />} />
                  </div>
                )}
                
                <div className="w-full">
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
                    user={user} 
                  />
                </div>
              </div>
            </div>
          )}

          {view === 'achievements' && <div className="py-24 px-6 sm:px-12 w-full"><Achievements finishedCount={readingProgress.filter(p => p.is_finished).length} languageCount={new Set(readingProgress.map(p => books.find(b => b.id === p.book_id)?.language)).size} theme={theme} /></div>}
          {view === 'creator' && <div className="py-24 px-6 sm:px-12 w-full"><StoryGenerator onStoryGenerated={(b) => { handleReadBook(b); fetchBooks(); fetchUserData(user.email); }} language={language} theme={theme} /></div>}
          
          {view === 'favorites' && (
            <div className="py-24 px-6 sm:px-12 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
                <h2 className="text-5xl sm:text-6xl font-display font-black flex items-center gap-6">
                  <div className="p-4 bg-brand-rose/10 text-brand-rose rounded-3xl border-4 border-brand-rose/20">
                    <Heart fill="currentColor" size={48} />
                  </div>
                  {t('myFavorites')}
                </h2>
                <div className="text-slate-400 font-bold tracking-widest text-sm uppercase">
                  {favorites.length} stories saved
                </div>
              </div>
              <BookGrid books={books.filter(b => favorites.includes(b.id))} onRead={handleReadBook} hideFilters theme={theme} language={language} onToggleFavorite={handleToggleFavorite} favorites={favorites} user={user} />
            </div>
          )}

          {view === 'latest' && (
            <div className="py-24 px-6 sm:px-12 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
                <h2 className="text-5xl sm:text-6xl font-display font-black flex items-center gap-6">
                  <div className="p-4 bg-brand-purple/10 text-brand-purple rounded-3xl border-4 border-brand-purple/20">
                    <Clock size={48} strokeWidth={3} />
                  </div>
                  {t('recent')}
                </h2>
                {latestRead.length > 0 && (
                  <button 
                    onClick={clearLatestRead}
                    className="flex items-center gap-3 px-6 py-3 bg-brand-lavender text-brand-purple rounded-2xl font-black text-sm transition-all hover:bg-brand-rose hover:text-white"
                  >
                    <Trash2 size={18} />
                    CLEAR HISTORY
                  </button>
                )}
              </div>
              {latestRead.length > 0 ? (
                <BookGrid 
                  books={latestRead.map(id => books.find(b => b.id === id)).filter((b): b is Book => b !== undefined)} 
                  onRead={handleReadBook} 
                  hideFilters 
                  theme={theme} 
                  language={language} 
                  onToggleFavorite={handleToggleFavorite} 
                  favorites={favorites} 
                  user={user} 
                />
              ) : (
                <div className="text-center py-32 rounded-[4rem] border-8 border-dashed border-brand-lavender animate-in zoom-in duration-500">
                  <BookOpen size={60} className="mx-auto mb-6 text-brand-purple opacity-30" />
                  <h3 className="text-3xl font-display font-black text-brand-violet mb-4">Your Shelf is Empty</h3>
                  <p className="text-slate-400 font-bold mb-10 max-w-md mx-auto">You haven't read any magical stories yet.</p>
                  <button onClick={() => handleNavigate('library')} className="px-12 py-4 bg-brand-purple text-white rounded-[2rem] font-black text-xl shadow-lg tactile-button">Go to Library</button>
                </div>
              )}
            </div>
          )}

          {view === 'my-stories' && (
            <div className="py-24 px-6 sm:px-12 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
                <h2 className="text-5xl sm:text-6xl font-display font-black flex items-center gap-6">
                  <div className="p-4 bg-brand-cyan/10 text-brand-cyan rounded-3xl border-4 border-brand-cyan/20">
                    <PenTool size={48} strokeWidth={3} />
                  </div>
                  My Stories
                </h2>
                <div className="flex gap-4">
                  <button onClick={() => user ? setIsUploadModalOpen(true) : setIsAuthModalOpen(true)} className="px-8 py-3 bg-brand-lavender text-brand-purple rounded-2xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <Upload size={18} /> UPLOAD MANUALLY
                  </button>
                  <button onClick={() => handleNavigate('creator')} className="px-8 py-3 bg-brand-cyan text-white rounded-2xl font-black text-sm shadow-lg tactile-button flex items-center gap-2">
                    <Sparkles size={18} /> CREATE WITH AI
                  </button>
                </div>
              </div>
              {userCreatedBooks.length > 0 ? (
                <BookGrid books={userCreatedBooks} onRead={handleReadBook} hideFilters theme={theme} language={language} onToggleFavorite={handleToggleFavorite} favorites={favorites} user={user} />
              ) : (
                <div className="text-center py-32 rounded-[4rem] border-8 border-dashed border-brand-cyan animate-in zoom-in duration-500">
                  <PenTool size={60} className="mx-auto mb-6 text-brand-cyan opacity-30" />
                  <h3 className="text-3xl font-display font-black text-brand-violet mb-4">You haven't created any stories!</h3>
                  <p className="text-slate-400 font-bold mb-10 max-w-md mx-auto">Visit the Magic Lab to author your very first book or upload one manually.</p>
                  <div className="flex justify-center gap-6">
                    <button onClick={() => user ? setIsUploadModalOpen(true) : setIsAuthModalOpen(true)} className="px-12 py-4 bg-white text-brand-cyan border-4 border-brand-cyan/20 rounded-[2rem] font-black text-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                      <Upload size={24} /> Upload Manual
                    </button>
                    <button onClick={() => handleNavigate('creator')} className="px-12 py-4 bg-brand-cyan text-white rounded-[2rem] font-black text-xl shadow-lg tactile-button">Go to Magic Lab</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'progress' && <div className="py-24 px-6 sm:px-12 w-full"><h2 className="text-4xl font-display font-black mb-12 flex items-center gap-6"><TrendingUp size={40} className="text-brand-purple" /> My Adventure Map</h2><ReadingProgressTable progressRecords={readingProgress} books={books} onRead={handleReadBook} theme={theme} /></div>}
        </div>
      </main>

      <Footer theme={theme} language={language} onAdminSeed={triggerSeed} user={user} />
      <Mascot theme={theme} language={language} />

      {activeBook && (
        <BookReader 
          book={activeBook} theme={theme} onClose={() => { setActiveBook(null); setShouldAutoPrint(false); }} userId={user?.email}
          initialPage={readingProgress.find(p => p.book_id === activeBook.id)?.current_page || 0}
          autoPrint={shouldAutoPrint}
        />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={(u) => { setUser(u); fetchUserData(u.email); setIsAuthModalOpen(false); }} theme={theme} />
      <BookUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={() => { fetchBooks(false); if (user) fetchUserData(user.email); }} theme={theme} language={language} />
    </div>
  );
};

export default App;
