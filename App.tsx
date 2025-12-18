import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import BookReader from './components/BookReader';
import StoryGenerator from './components/StoryGenerator';
import ReadingProgressTable from './components/ReadingProgressTable';
import Footer from './components/Footer';
import Mascot from './components/Mascot';
import AuthModal from './components/AuthModal';
import BookUploadModal from './components/BookUploadModal';
import { Book, Category, Level, LanguageFilter, ViewType, AppLanguage } from './types';
import { supabase, getManualSession, fetchUserFavorites, toggleFavoriteInDb, fetchReadingProgress } from './services/supabase';
import { seedLibrary, SeedProgress } from './services/seed';
import { playSound } from './components/SoundEffects';
import { getTranslation } from './i18n';
import { BookOpen, Star, AlertCircle, Copy, Check, Construction, Sparkles, Loader2, Database, ShieldAlert, TableProperties, ArrowRight, Zap } from 'lucide-react';

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

  // Seeding State
  const [isSeedViewOpen, setIsSeedViewOpen] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress>({ status: 'idle', count: 0, total: 10, message: '' });

  const [dbError, setDbError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    setDbError(null);
    playSound('pop');
    await seedLibrary((progress) => {
      setSeedProgress(progress);
      if (progress.status === 'success') {
        playSound('tada');
        setTimeout(() => {
          setIsSeedViewOpen(false);
          fetchBooks(false);
        }, 2000);
      }
      if (progress.status === 'error') {
        playSound('woosh');
        if (progress.message.includes('RLS ERROR') || progress.message.includes('FK ERROR')) {
          setDbError(progress.message);
          setIsSeedViewOpen(false);
        }
      }
    });
  };

  const handleCopySql = () => {
    const sql = `-- !!! MANUAL AUTH SETUP SCRIPT !!!
-- Copy everything and run it in your Supabase SQL Editor.

BEGIN;
DROP TABLE IF EXISTS public.reading_progress CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Registration" ON public.users FOR INSERT WITH CHECK (true);

CREATE TABLE public.favorites (
  user_email text REFERENCES public.users(email) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  PRIMARY KEY (user_email, book_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Favs access" ON public.favorites FOR ALL USING (true);

CREATE TABLE public.reading_progress (
  user_email text REFERENCES public.users(email) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  current_page integer DEFAULT 0,
  is_finished boolean DEFAULT false,
  last_read_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_email, book_id)
);
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Progress access" ON public.reading_progress FOR ALL USING (true);
COMMIT;`;
    // Fix: Removed redundant .clipboard property access to correctly call writeText on navigator.clipboard
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

    const channel = supabase
      .channel('public:books')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
        fetchBooks(false); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBooks, fetchUserData]);

  useEffect(() => { localStorage.setItem('mochi_latest', JSON.stringify(latestRead)); }, [latestRead]);
  useEffect(() => {
    localStorage.setItem('mochi_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => { localStorage.setItem('mochi_lang', language); }, [language]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'read' | 'create' | 'view', data?: any } | null>(null);

  const handleReadBook = (book: Book) => {
    if (!user) {
      setPendingAction({ type: 'read', data: book });
      setIsAuthModalOpen(true);
      return;
    }
    setActiveBook(book);
    setLatestRead(prev => {
      const filtered = prev.filter(id => id !== book.id);
      return [book.id, ...filtered].slice(0, 10);
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

    const success = await toggleFavoriteInDb(user.email, bookId, isFav);
    if (!success) {
      setFavorites(prev => isFav ? [...prev, bookId] : prev.filter(id => id !== bookId));
    }
  };

  const handleNavigate = (v: ViewType) => {
    const protectedViews: ViewType[] = ['creator', 'favorites', 'latest', 'recommendations', 'progress'];
    if (!user && protectedViews.includes(v)) {
      setPendingAction({ type: 'view', data: v });
      setIsAuthModalOpen(true);
      return;
    }
    setView(v);
  };

  const handleStoryGenerated = (newBook: Book) => {
    setActiveBook(newBook);
    setView('library');
    fetchBooks(false);
  };

  const handleAuthSuccess = async (userData: any) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    
    if (userData) {
      await fetchUserData(userData.email);
    }

    if (pendingAction) {
      if (pendingAction.type === 'read') handleReadBook(pendingAction.data);
      else if (pendingAction.type === 'view') setView(pendingAction.data);
      setPendingAction(null);
    }
  };

  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [books, searchQuery]);

  const favoriteBooks = useMemo(() => filteredBySearch.filter(b => favorites.includes(b.id)), [filteredBySearch, favorites]);
  const recentBooks = useMemo(() => latestRead.map(id => filteredBySearch.find(b => b.id === id)).filter((b): b is Book => !!b), [filteredBySearch, latestRead]);
  
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-[#fdfbff] text-slate-800'}`}>
        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center animate-bounce shadow-xl mb-8">
          <BookOpen size={48} className="text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold">Magicking the Library...</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#fdfbff] text-slate-900'}`}>
      <Navbar 
        onNavigate={handleNavigate}
        onUploadClick={() => setIsUploadModalOpen(true)}
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

      <main className="w-full">
        {view === 'library' && (
          <>
            <Hero 
              onStartCreating={() => handleNavigate('creator')}
              language={language}
              theme={theme}
            />
            <div id="library-section" className="pt-20 px-4 sm:px-8 lg:px-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg">
                  <Star size={24} fill="currentColor" />
                </div>
                <h2 className={`text-3xl font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {t('magicalStories')}
                </h2>
              </div>
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
          </>
        )}

        {view === 'creator' && (
          <div className="px-4 sm:px-8 lg:px-12">
            <StoryGenerator 
              onStoryGenerated={handleStoryGenerated}
              language={language}
              theme={theme}
            />
          </div>
        )}

        {view === 'favorites' && (
          <div className="py-12 px-4 sm:px-8 lg:px-12">
            <h2 className="text-4xl font-display font-bold mb-12">{t('myFavorites')}</h2>
            <BookGrid books={favoriteBooks} onRead={handleReadBook} hideFilters theme={theme} language={language} onToggleFavorite={handleToggleFavorite} favorites={favorites} />
          </div>
        )}

        {view === 'latest' && (
          <div className="py-12 px-4 sm:px-8 lg:px-12">
            <h2 className="text-4xl font-display font-bold mb-12">{t('recent')}</h2>
            <BookGrid books={recentBooks} onRead={handleReadBook} hideFilters theme={theme} language={language} onToggleFavorite={handleToggleFavorite} favorites={favorites} />
          </div>
        )}

        {view === 'progress' && (
          <div className="py-12 px-4 sm:px-8 lg:px-12">
            <h2 className="text-4xl font-display font-bold mb-12">My Reading Journey</h2>
            <ReadingProgressTable progressRecords={readingProgress} books={books} onRead={handleReadBook} theme={theme} />
          </div>
        )}
      </main>

      <Footer 
        theme={theme} 
        language={language} 
        onAdminSeed={() => triggerSeed()}
      />
      <Mascot theme={theme} language={language} />

      {isSeedViewOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border-8 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-100'}`}>
            <div className="p-8 sm:p-12 text-center">
              {seedProgress.status === 'error' ? (
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
              ) : seedProgress.status === 'success' ? (
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Check size={40} />
                </div>
              ) : (
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Loader2 size={40} className="animate-spin" />
                </div>
              )}
              <h2 className="text-2xl font-display font-bold mb-2">
                {seedProgress.status === 'error' ? 'Magic Interrupted' : seedProgress.status === 'success' ? 'Library Ready!' : 'Initializing Library'}
              </h2>
              <p className="text-slate-500 mb-8 font-medium">{seedProgress.message}</p>
              {seedProgress.status === 'error' && (
                <button onClick={() => setIsSeedViewOpen(false)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black mt-4">Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeBook && (
        <BookReader 
          book={activeBook}
          theme={theme}
          onClose={() => setActiveBook(null)}
          userId={user?.email}
          initialPage={readingProgress.find(p => p.book_id === activeBook.id)?.current_page || 0}
        />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        theme={theme}
      />

      <BookUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => fetchBooks(false)}
        theme={theme}
        language={language}
      />
    </div>
  );
};

export default App;