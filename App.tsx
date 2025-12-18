
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import BookReader from './components/BookReader';
import StoryGenerator from './components/StoryGenerator';
import Footer from './components/Footer';
import Mascot from './components/Mascot';
import AuthModal from './components/AuthModal';
import { Book, Category, Level, LanguageFilter, ViewType, AppLanguage } from './types';
import { supabase } from './services/supabase';
import { playSound } from './components/SoundEffects';
import { getTranslation } from './i18n';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('library');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedLevel, setSelectedLevel] = useState<Level>('All');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<LanguageFilter>('All');
  const [loading, setLoading] = useState(true);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('mochi_theme') as 'light' | 'dark') || 'light';
  });
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('mochi_lang') as AppLanguage) || 'en';
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('mochi_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [latestRead, setLatestRead] = useState<string[]>(() => {
    const saved = localStorage.getItem('mochi_latest');
    return saved ? JSON.parse(saved) : [];
  });

  const t = (key: any) => getTranslation(language, key);

  useEffect(() => {
    localStorage.setItem('mochi_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('mochi_latest', JSON.stringify(latestRead));
  }, [latestRead]);

  useEffect(() => {
    localStorage.setItem('mochi_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mochi_lang', language);
  }, [language]);

  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'read' | 'create' | 'view', data?: any } | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching books:', error);
    } else if (data) {
      const mappedBooks: Book[] = data.map((b: any) => ({
        id: b.id.toString(),
        title: b.title,
        author: b.author,
        illustrator: b.illustrator,
        description: b.description,
        coverImage: b.cover_image_url,
        coverImagePath: b.cover_image_path,
        language: b.language,
        level: b.level,
        tags: b.tags || [],
        pages: Array.isArray(b.pages) ? b.pages : [],
        pageImages: Array.isArray(b.page_images) ? b.page_images : []
      }));
      setBooks(mappedBooks);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial Session Check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setIsAuthModalOpen(false);
        if (pendingAction) {
          if (pendingAction.type === 'read') {
            handleReadBook(pendingAction.data);
          } else if (pendingAction.type === 'create') {
            setView('creator');
          } else if (pendingAction.type === 'view') {
            setView(pendingAction.data);
          }
          setPendingAction(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setView('library');
        setPendingAction(null);
        setActiveBook(null);
        setIsAuthModalOpen(false);
      }
    });

    fetchBooks();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
        fetchBooks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [pendingAction]);

  useEffect(() => {
    if (view !== 'library') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

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

  const handleToggleFavorite = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    playSound('pop');
    setFavorites(prev => {
      if (prev.includes(bookId)) return prev.filter(id => id !== bookId);
      playSound('tada');
      return [...prev, bookId];
    });
  };

  const handleNavigate = (v: ViewType) => {
    const protectedViews: ViewType[] = ['creator', 'favorites', 'latest', 'recommendations'];
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
  };

  const favoriteBooks = useMemo(() => books.filter(b => favorites.includes(b.id)), [books, favorites]);
  const recentBooks = useMemo(() => latestRead.map(id => books.find(b => b.id === id)).filter((b): b is Book => !!b), [books, latestRead]);
  const recommendedBooks = useMemo(() => {
    if (recentBooks.length === 0) return books.slice(0, 4);
    const lastLevel = recentBooks[0].level;
    return books.filter(b => b.level === lastLevel && !latestRead.includes(b.id)).slice(0, 8);
  }, [books, recentBooks, latestRead]);

  const displayedBooks = useMemo(() => {
    let list: Book[] = [];
    switch (view) {
      case 'favorites': list = favoriteBooks; break;
      case 'latest': list = recentBooks; break;
      case 'recommendations': list = recommendedBooks; break;
      default: list = books; break;
    }
    return list;
  }, [view, books, favoriteBooks, recentBooks, recommendedBooks]);

  const getPageTitle = () => {
    switch (view) {
      case 'favorites': return { title: t('myFavorites'), subtitle: 'Stories you loved the most!' };
      case 'latest': return { title: t('readAgain'), subtitle: 'Pick up where you left off!' };
      case 'recommendations': return { title: t('magicalLabPicks'), subtitle: 'Stories we think you will love!' };
      default: return { title: t('magicalStories'), subtitle: 'Pick a story and start your adventure!' };
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-purple-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#fdfbff] text-slate-900'
    }`}>
      <Navbar 
        onNavigate={handleNavigate} 
        activeView={view} 
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        favoritesCount={favorites.length}
        theme={theme}
        toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        language={language}
        setLanguage={setLanguage}
      />
      
      <main className="pb-20">
        {view === 'creator' ? (
          <StoryGenerator onStoryGenerated={handleStoryGenerated} language={language} theme={theme} />
        ) : (
          <>
            {view === 'library' && <Hero onStartCreating={() => handleNavigate('creator')} language={language} theme={theme} />}
            
            <div className="max-w-7xl mx-auto px-4 mt-12 animate-in fade-in duration-700">
              <div className="mb-12">
                <h2 className={`text-4xl font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {getPageTitle().title}
                </h2>
                <p className={`text-xl font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {getPageTitle().subtitle}
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className={`w-16 h-16 border-4 border-t-purple-600 rounded-full animate-spin ${
                    theme === 'dark' ? 'border-slate-800' : 'border-purple-200'
                  }`}></div>
                </div>
              ) : (
                <BookGrid 
                  books={displayedBooks} 
                  onRead={handleReadBook} 
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedLevel={selectedLevel}
                  setSelectedLevel={setSelectedLevel}
                  selectedLanguageFilter={selectedLanguageFilter}
                  setSelectedLanguageFilter={setSelectedLanguageFilter}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                  hideFilters={view !== 'library'}
                  theme={theme}
                  language={language}
                />
              )}
            </div>
          </>
        )}
      </main>

      <Footer theme={theme} language={language} />
      <Mascot theme={theme} language={language} />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        theme={theme}
        onClose={() => { setIsAuthModalOpen(false); setPendingAction(null); }} 
      />

      {activeBook && (
        <BookReader 
          book={activeBook} 
          theme={theme}
          onClose={() => setActiveBook(null)} 
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 15s infinite alternate ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default App;
