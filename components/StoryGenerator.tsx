
import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, BookOpen, Star, Rocket, Palette, RefreshCw, CheckCircle, ChevronLeft, Type as TypeIcon } from 'lucide-react';
import { generateStory, generateIllustration } from '../services/geminiService';
import { StoryGenerationResult, Book, AppLanguage } from '../types';
import { playSound } from './SoundEffects';
import { supabase, uploadImageFromBase64, getManualSession } from '../services/supabase';
import { getTranslation } from '../i18n';

interface StoryGeneratorProps {
  onStoryGenerated: (book: Book) => void;
  language: AppLanguage;
  theme: 'dark' | 'light';
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onStoryGenerated, language, theme }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = (key: any) => getTranslation(language, key);
  
  const [stage, setStage] = useState<'input' | 'review'>('input');
  const [storyData, setStoryData] = useState<StoryGenerationResult | null>(null);
  const [pageImages, setPageImages] = useState<(string | null)[]>([null, null, null, null, null]);
  const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>([false, false, false, false, false]);

  const handleInitialGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    playSound('pop');
    
    try {
      const result = await generateStory(prompt, language);
      setStoryData(result);
      setStage('review');
      
      handleGenerateImage(0, result.title + ": " + result.pages[0].imagePrompt);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'The magic sparkles missed! Let\'s try a different idea.');
      playSound('woosh');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (index: number, visualPrompt: string) => {
    const newLoadingStates = [...imageLoadingStates];
    newLoadingStates[index] = true;
    setImageLoadingStates(newLoadingStates);
    
    try {
      const imageUrl = await generateIllustration(visualPrompt);
      const newImages = [...pageImages];
      newImages[index] = imageUrl;
      setPageImages(newImages);
      playSound('tada');
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setImageLoadingStates(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  };

  const handleUpdatePageText = (index: number, newText: string) => {
    if (!storyData) return;
    const updatedPages = [...storyData.pages];
    updatedPages[index].text = newText;
    setStoryData({ ...storyData, pages: updatedPages });
  };

  const handleUpdateTitle = (newTitle: string) => {
    if (!storyData) return;
    setStoryData({ ...storyData, title: newTitle });
  };

  const handleSaveAndPublish = async (e: React.MouseEvent) => {
    if (!storyData) return;
    
    const user = await getManualSession();
    if (!user) {
      setError("Please sign in to publish your story!");
      return;
    }

    const btn = e.currentTarget as HTMLElement;
    btn.classList.add('animate-squish');
    setTimeout(() => btn.classList.remove('animate-squish'), 200);

    setIsSaving(true);
    setError(null);
    playSound('pop');

    try {
      const uploadedAssets = await Promise.all(
        pageImages.map(async (img, idx) => {
          if (img && img.startsWith('data:image')) {
            const fileName = `stories/${Date.now()}-page-${idx}.png`;
            return await uploadImageFromBase64(img, fileName);
          }
          return { url: `https://loremflickr.com/600/450/illustration,drawing,cartoon,kids,storybook?lock=${idx}`, path: '' };
        })
      );

      const finalImageUrls = uploadedAssets.map(asset => asset.url);
      const pagesText = storyData.pages.map(p => p.text);

      const { data, error: dbError } = await supabase
        .from('books')
        .insert([{
          title: storyData.title,
          author: user.full_name || 'A Magic Author',
          illustrator: 'Gemini AI',
          description: `A magical story created in the Lab based on: ${prompt}`,
          cover_image_url: finalImageUrls[0],
          cover_image_path: uploadedAssets[0].path,
          language: t('languageName'),
          level: 1,
          tags: ['Magic Lab', 'AI Story', language.toUpperCase()],
          pages: pagesText,
          page_images: finalImageUrls,
          is_public: true,
          created_by: user.email // Ownership Tracking
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      const newBook: Book = {
        id: data.id.toString(),
        title: data.title,
        author: data.author,
        illustrator: data.illustrator,
        description: data.description,
        coverImage: data.cover_image_url,
        coverImagePath: data.cover_image_path,
        language: data.language,
        level: data.level,
        tags: data.tags || [],
        pages: data.pages,
        pageImages: data.page_images
      };
      
      playSound('tada');
      onStoryGenerated(newBook);
    } catch (err: any) {
      console.error('Save failed:', err);
      setError('The magic failed to save! ' + (err.message || 'Check your internet connection.'));
      playSound('woosh');
    } finally {
      setIsSaving(false);
    }
  };

  const suggestions = [
    "A brave kitten in space",
    "A magical talking toaster",
    "Dinosaur baking cupcakes",
    "Giant watermelon adventure"
  ];

  if (stage === 'review' && storyData) {
    return (
      <div className="w-full max-w-none px-4 sm:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => { playSound('pop'); setStage('input'); }}
            className={`flex items-center gap-3 font-black text-sm uppercase tracking-[0.3em] transition-all hover:translate-x-[-4px] active:scale-90 ${
              theme === 'dark' ? 'text-slate-300 hover:text-brand-purple' : 'text-slate-800 hover:text-brand-purple'
            }`}
          >
            <ChevronLeft size={24} strokeWidth={3} />
            BACK
          </button>
          <h2 className={`text-4xl sm:text-5xl font-display font-black text-center leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
            {t('reviewTale')}
          </h2>
          <div className="w-24"></div>
        </div>

        <div className="space-y-12">
          <div className={`rounded-[3rem] p-8 sm:p-12 border-4 shadow-xl flex flex-col md:flex-row items-center gap-10 transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-brand-lavender'
          }`}>
            <div className={`w-full md:w-1/4 max-w-[320px] aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-50 dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 shadow-inner relative group flex-shrink-0 transition-transform hover:scale-105 duration-300`}>
              {pageImages[0] ? (
                <img src={pageImages[0]} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <Palette size={56} className="mb-6 opacity-20" />
                  <p className="text-[12px] font-black uppercase tracking-widest animate-pulse">Generating...</p>
                </div>
              )}
              {imageLoadingStates[0] && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 size={40} className="animate-spin text-brand-purple" />
                </div>
              )}
              <button 
                onClick={() => handleGenerateImage(0, storyData.title + ": " + storyData.pages[0].imagePrompt)}
                className="absolute bottom-6 right-6 bg-white/95 dark:bg-slate-800/95 text-brand-purple p-4 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all tactile-button"
              >
                <RefreshCw size={24} />
              </button>
            </div>
            <div className="flex-1 w-full">
              <label className="text-[12px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-[0.4em] block mb-4 px-4">BOOK TITLE</label>
              <input 
                type="text"
                value={storyData.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                className={`text-4xl sm:text-6xl lg:text-7xl font-display font-black w-full rounded-[2rem] px-8 py-6 outline-none transition-all border-4 focus:border-brand-purple shadow-inner leading-tight ${
                  theme === 'dark' ? 'bg-slate-800 border-transparent text-white' : 'bg-slate-100 border-transparent text-slate-950'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {storyData.pages.map((page, idx) => (
              <div key={idx} className={`rounded-[3rem] p-8 border-4 shadow-lg flex flex-col gap-8 transition-all hover:shadow-2xl ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-brand-lavender'
              }`}>
                <div className="flex items-center justify-between px-2">
                  <span className="text-[12px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-[0.4em] bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-full">PAGE {idx + 1}</span>
                  <button 
                    onClick={() => handleGenerateImage(idx, storyData.title + ": " + page.imagePrompt)}
                    className="text-brand-purple hover:text-brand-violet transition-all flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.3em] hover:scale-105"
                  >
                    <RefreshCw size={14} className={imageLoadingStates[idx] ? 'animate-spin' : ''} /> RE-GENERATE
                  </button>
                </div>

                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700 shadow-inner relative group">
                  {pageImages[idx] ? (
                    <img src={pageImages[idx]!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Page ${idx + 1}`} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <Palette size={40} className="opacity-40 animate-pulse" />
                    </div>
                  )}
                  {imageLoadingStates[idx] && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 size={32} className="animate-spin text-brand-purple" />
                    </div>
                  )}
                </div>

                <textarea 
                  value={page.text}
                  onChange={(e) => handleUpdatePageText(idx, e.target.value)}
                  className={`w-full rounded-[2rem] p-8 font-bold resize-none h-48 outline-none transition-all border-4 focus:border-brand-purple text-xl shadow-inner leading-relaxed tracking-wide ${
                    theme === 'dark' ? 'bg-slate-800 border-transparent text-slate-200' : 'bg-slate-100 border-transparent text-slate-800'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center py-12 gap-8">
            <button 
              onClick={handleSaveAndPublish}
              disabled={isSaving}
              className="group relative px-20 py-7 bg-brand-purple text-white rounded-[2.5rem] font-black text-2xl shadow-[0_10px_0_0_#6d28d9] hover:bg-brand-violet active:translate-y-[10px] active:shadow-none transition-all disabled:opacity-50 flex items-center gap-6 tracking-widest"
            >
              {isSaving ? <><Loader2 size={32} className="animate-spin" /> SAVING...</> : <><CheckCircle size={32} strokeWidth={3} /> PUBLISH STORY</>}
            </button>
            {error && <p className="text-brand-rose font-black text-lg animate-shake">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-4 sm:px-8 py-16">
      <div className={`rounded-[4rem] shadow-3xl overflow-hidden border-8 p-10 sm:p-24 text-center transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-brand-lavender shadow-purple-200/50'
      }`}>
        <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-14 shadow-inner animate-pulse ${
          theme === 'dark' ? 'bg-slate-800 text-brand-purple' : 'bg-brand-lavender text-brand-purple'
        }`}>
          <Wand2 size={56} strokeWidth={2.5} />
        </div>
        
        <h2 className={`text-6xl sm:text-8xl lg:text-9xl font-display font-black mb-8 leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
          {t('magicLab')}
        </h2>
        
        <p className={`text-2xl sm:text-3xl font-bold mb-16 max-w-4xl mx-auto leading-loose tracking-wide ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>
          Tell us a little bit about your hero, and our magic wand will write a whole book for you!
        </p>

        <div className="relative mb-16 group w-full max-w-7xl mx-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="..."
            className={`w-full h-72 p-10 sm:p-14 rounded-[3rem] border-4 outline-none text-2xl sm:text-4xl font-black resize-none transition-all shadow-inner leading-relaxed ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 text-white focus:border-brand-purple' 
                : 'bg-slate-100 border-slate-100 text-slate-950 focus:border-brand-blue focus:bg-white'
            }`}
            disabled={isGenerating}
          />
          <button
            onClick={handleInitialGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 bg-brand-purple text-white px-10 py-5 rounded-[2rem] font-black shadow-[0_8px_0_0_#6d28d9] hover:bg-brand-violet active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-50 flex items-center gap-4 text-2xl tracking-widest"
          >
            {isGenerating ? <><Loader2 size={28} className="animate-spin" /> MAGICKING...</> : <><Sparkles size={28} /> LETS GO!</>}
          </button>
        </div>

        <div className="space-y-12">
          <p className="text-[12px] font-black text-brand-purple uppercase tracking-[0.4em]">{t('tryTheseIdeas')}</p>
          <div className="flex flex-wrap justify-center gap-6">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { playSound('pop'); setPrompt(s); }}
                className={`px-10 py-5 rounded-[2rem] text-xl font-black transition-all border-4 tactile-button tracking-wider ${
                  theme === 'dark' 
                    ? 'bg-slate-800 border-slate-800 text-slate-200 hover:bg-slate-700 hover:border-brand-purple' 
                    : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50 hover:border-brand-blue shadow-sm'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;
