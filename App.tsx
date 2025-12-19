
import { BookOpen, Clock, Globe, Heart, Sparkles, TrendingUp, Trophy } from 'lucide-react';
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
    document.body.style.overflow = activeBook || isSeedViewOpen ? 'hidden' : 'unset';
  }, [activeBook, isSeedViewOpen]);

  const fetchBooks = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
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
          pageImages: b.page_images || []
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
      const [favs, progress] = await Promise.all([fetchUserFavorites(userEmail), fetchReadingProgress(userEmail)]);
      setFavorites(favs);
      setReadingProgress(progress);
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
    setActiveBook(book);
    setLatestRead(prev => {
      const updated = [book.id, ...prev.filter(id => id !== book.id)].slice(0, 10);
      localStorage.setItem('mochi_latest', JSON.stringify(updated));
      return updated;
    });
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
    if (!user && ['creator', 'favorites', 'latest', 'progress', 'achievements'].includes(v)) { setIsAuthModalOpen(true); return; }
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-brand-lavender text-brand-purple'}`}>
        <div className="w-20 h-20 bg-brand-purple rounded-[2rem] flex items-center justify-center animate-bounce shadow-xl mb-10 border-4 border-white">
          <BookOpen size={40} className="text-white" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-display font-black animate-pulse tracking-tight text-brand-purple">Summoning Stories...</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 flex flex-col w-full overflow-x-hidden ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      <Navbar 
        onNavigate={handleNavigate} onUploadClick={() => user ? setIsUploadModalOpen(true) : setIsAuthModalOpen(true)}
        onSeedClick={triggerSeed} activeView={view} user={user} onLoginClick={() => setIsAuthModalOpen(true)}
        favoritesCount={favorites.length} theme={theme} toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        language={language} setLanguage={setLanguage} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        books={books} onReadBook={handleReadBook}
      />

      {/* Persistent Floating Badge - Purple Theme */}
      <div className="fixed top-28 left-6 sm:left-10 z-[60] pointer-events-none sm:pointer-events-auto transition-all duration-500">
        <button 
          onClick={() => handleNavigate('achievements')}
          className={`group flex items-center gap-3 px-5 py-3 rounded-2xl border-4 transition-all hover:scale-110 active:scale-95 tactile-button shadow-2xl ${
            view === 'achievements' 
              ? 'bg-brand-purple border-white text-white' 
              : (theme === 'dark' ? 'bg-slate-800/80 border-slate-700 text-brand-purple backdrop-blur-md' : 'bg-white/80 border-brand-lavender text-brand-purple backdrop-blur-md')
          }`}
        >
          <Trophy size={18} className="group-hover:rotate-6 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden lg:inline">Adventure Map</span>
          {readingProgress.filter(p => p.is_finished).length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
              {readingProgress.filter(p => p.is_finished).length}
            </span>
          )}
        </button>
      </div>

      <main className="flex-1 w-full flex flex-col">
        <div className="animate-in fade-in slide-up duration-500">
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

          {view === 'achievements' && <div className="py-24 px-4 sm:px-12 w-full"><Achievements finishedCount={readingProgress.filter(p => p.is_finished).length} languageCount={new Set(readingProgress.map(p => books.find(b => b.id === p.book_id)?.language)).size} theme={theme} /></div>}
          {view === 'creator' && <div className="py-24 px-4 sm:px-12 w-full"><StoryGenerator onStoryGenerated={(b) => { handleReadBook(b); fetchBooks(); }} language={language} theme={theme} /></div>}
          {view === 'favorites' && <div className="py-24 px-4 sm:px-12 w-full"><h2 className="text-3xl font-display font-black mb-12 flex items-center gap-6"><Heart fill="currentColor" size={32} className="text-rose-500" /> {t('myFavorites')}</h2><BookGrid books={filteredBySearch.filter(b => favorites.includes(b.id))} onRead={handleReadBook} hideFilters theme={theme} language={language} onToggleFavorite={handleToggleFavorite} favorites={favorites} user={user} /></div>}
          {view === 'latest' && <div className="py-24 px-4 sm:px-12 w-full"><h2 className="text-3xl font-display font-black mb-12 flex items-center gap-6"><Clock size={32} className="text-brand-purple" /> {t('recent')}</h2><BookGrid books={books.filter(b => latestRead.includes(b.id))} onRead={handleReadBook} hideFilters theme={theme} language={language} onToggleFavorite={handleToggleFavorite} favorites={favorites} user={user} /></div>}
          {view === 'progress' && <div className="py-24 px-4 sm:px-12 w-full"><h2 className="text-3xl font-display font-black mb-12 flex items-center gap-6"><TrendingUp size={32} className="text-brand-purple" /> My Adventure Map</h2><ReadingProgressTable progressRecords={readingProgress} books={books} onRead={handleReadBook} theme={theme} /></div>}
        </div>
      </main>

      <Footer theme={theme} language={language} onAdminSeed={triggerSeed} user={user} />
      <Mascot theme={theme} language={language} />

      {activeBook && (
        <BookReader 
          book={activeBook} theme={theme} onClose={() => setActiveBook(null)} userId={user?.email}
          initialPage={readingProgress.find(p => p.book_id === activeBook.id)?.current_page || 0}
        />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={(u) => { setUser(u); fetchUserData(u.email); setIsAuthModalOpen(false); }} theme={theme} />
      <BookUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={() => fetchBooks(false)} theme={theme} language={language} />
    </div>
  );
};

export default App;
