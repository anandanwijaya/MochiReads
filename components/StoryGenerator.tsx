
import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, BookOpen, Star, Rocket, Palette, RefreshCw, CheckCircle, ChevronLeft, Type as TypeIcon } from 'lucide-react';
import { generateStory, generateIllustration } from '../services/geminiService';
import { StoryGenerationResult, Book, AppLanguage } from '../types';
import { playSound } from './SoundEffects';
import { supabase, uploadImageFromBase64 } from '../services/supabase';
import { getTranslation } from '../i18n';

interface StoryGeneratorProps {
  onStoryGenerated: (book: Book) => void;
  language: AppLanguage;
  theme: 'light' | 'dark';
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
      
      // Auto-generate cover using the first page's prompt
      handleGenerateImage(0, result.title + ": " + result.pages[0].imagePrompt);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'The magic sparkles missed! Let\'s try a different idea.');
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

  const handleSaveAndPublish = async () => {
    if (!storyData) return;
    setIsSaving(true);
    setError(null);
    playSound('pop');

    try {
      // 1. Upload all generated images to Supabase Storage (images bucket)
      const uploadedAssets = await Promise.all(
        pageImages.map(async (img, idx) => {
          if (img && img.startsWith('data:image')) {
            const fileName = `stories/${Date.now()}-page-${idx}.png`;
            return await uploadImageFromBase64(img, fileName);
          }
          // Fallback placeholder if image generation was skipped
          return { url: `https://picsum.photos/seed/fallback-${Date.now()}-${idx}/400/600`, path: '' };
        })
      );

      const finalImageUrls = uploadedAssets.map(asset => asset.url);
      const pagesText = storyData.pages.map(p => p.text);

      // 2. Insert the book into the Database
      const { data, error: dbError } = await supabase
        .from('books')
        .insert([{
          title: storyData.title,
          author: 'The Magic Lab',
          illustrator: 'Gemini AI',
          description: `A magical story created in the Lab based on: ${prompt}`,
          cover_image_url: finalImageUrls[0],
          cover_image_path: uploadedAssets[0].path,
          language: language === 'en' ? 'English' : language === 'ms' ? 'Malay' : 'Indonesian',
          level: 1,
          tags: ['Magic Lab', 'AI Story', language.toUpperCase()],
          pages: pagesText,
          page_images: finalImageUrls,
          is_public: true
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
      <div className="w-full max-w-none px-4 sm:px-8 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => { playSound('pop'); setStage('input'); }}
            className={`flex items-center gap-2 font-black text-sm uppercase tracking-widest transition-colors ${
              theme === 'dark' ? 'text-slate-500 hover:text-purple-400' : 'text-slate-400 hover:text-purple-600'
            }`}
          >
            <ChevronLeft size={20} strokeWidth={3} />
            Back
          </button>
          <div className="flex flex-col items-center">
            <h2 className={`text-4xl font-display font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {t('reviewTale')}
            </h2>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="space-y-12">
          <div className={`rounded-[2.5rem] p-8 sm:p-12 border-4 shadow-sm flex flex-col md:flex-row items-center gap-8 transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-50'
          }`}>
            <div className="w-full md:w-1/4 max-w-[300px] aspect-[3/4] rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-inner relative group flex-shrink-0">
              {pageImages[0] ? (
                <img src={pageImages[0]} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-300">
                  <Palette size={48} className="mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Generating Magic...</p>
                </div>
              )}
              {imageLoadingStates[0] && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-purple-600" />
                </div>
              )}
              <button 
                onClick={() => handleGenerateImage(0, storyData.title + ": " + storyData.pages[0].imagePrompt)}
                className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 text-purple-600 p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
              >
                <RefreshCw size={20} />
              </button>
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Book Title</label>
              <input 
                type="text"
                value={storyData.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                className={`text-4xl sm:text-6xl font-display font-bold w-full rounded-2xl px-4 py-4 outline-none transition-all border-4 focus:border-purple-500 ${
                  theme === 'dark' ? 'bg-slate-800 border-transparent text-white' : 'bg-slate-50 border-transparent text-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {storyData.pages.map((page, idx) => (
              <div key={idx} className={`rounded-[2.5rem] p-6 sm:p-8 border-4 shadow-sm flex flex-col gap-6 transition-colors ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">Page {idx + 1}</span>
                  <button 
                    onClick={() => handleGenerateImage(idx, storyData.title + ": " + page.imagePrompt)}
                    className="text-purple-400 hover:text-purple-600 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                  >
                    <RefreshCw size={12} /> {pageImages[idx] ? 'Regenerate' : 'Manifest'}
                  </button>
                </div>

                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-inner relative">
                  {pageImages[idx] ? (
                    <img src={pageImages[idx]!} className="w-full h-full object-cover" alt={`Page ${idx + 1}`} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-300">
                      <Palette size={32} className="opacity-40" />
                    </div>
                  )}
                  {imageLoadingStates[idx] && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-purple-600" />
                    </div>
                  )}
                </div>

                <textarea 
                  value={page.text}
                  onChange={(e) => handleUpdatePageText(idx, e.target.value)}
                  className={`w-full rounded-2xl p-6 font-medium resize-none h-40 outline-none transition-all border-4 focus:border-purple-500 text-lg ${
                    theme === 'dark' ? 'bg-slate-800 border-transparent text-slate-200' : 'bg-slate-50 border-transparent text-slate-700'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center py-12 gap-6">
            <button 
              onClick={handleSaveAndPublish}
              disabled={isSaving}
              className="px-16 py-6 bg-purple-600 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_10px_0_0_#7e22ce] hover:bg-purple-700 hover:translate-y-[2px] active:translate-y-[10px] active:shadow-none transition-all disabled:opacity-50 flex items-center gap-4"
            >
              {isSaving ? <><Loader2 size={32} className="animate-spin" /> {t('saving')}</> : <><CheckCircle size={32} strokeWidth={3} /> {t('publishStory')}</>}
            </button>
            {error && <p className="text-red-500 font-bold">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-4 sm:px-8 py-20">
      <div className={`rounded-[3rem] shadow-2xl overflow-hidden border-8 p-8 sm:p-24 text-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-purple-900/10' : 'bg-white border-purple-50 shadow-purple-100/50'
      }`}>
        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner animate-pulse ${
          theme === 'dark' ? 'bg-slate-800 text-purple-400' : 'bg-purple-50 text-purple-600'
        }`}>
          <Wand2 size={48} strokeWidth={2.5} />
        </div>
        
        <h2 className={`text-5xl sm:text-7xl lg:text-8xl font-display font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          {t('magicLab')}
        </h2>
        
        <p className={`text-xl sm:text-2xl font-bold mb-12 max-w-3xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Tell us a little bit about your hero, and our magic wand will write a whole book for you!
        </p>

        <div className="relative mb-12 group w-full max-w-6xl mx-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="..."
            className={`w-full h-64 p-8 sm:p-12 rounded-[2.5rem] border-4 outline-none text-2xl sm:text-3xl font-bold resize-none transition-all ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500 focus:ring-8 focus:ring-purple-900/20' 
                : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-purple-300 focus:ring-8 focus:ring-purple-500/10'
            }`}
            disabled={isGenerating}
          />
          <button
            onClick={handleInitialGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 bg-purple-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-[0_8px_0_0_#7e22ce] hover:bg-purple-700 hover:translate-y-[2px] active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-50 flex items-center gap-3 text-xl"
          >
            {isGenerating ? <><Loader2 size={24} className="animate-spin" /> {t('magicking')}</> : <><Sparkles size={24} /> {t('letsGo')}</>}
          </button>
        </div>

        {error && <div className="mb-10 p-6 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-[2rem] text-sm font-black border-2 border-red-100 animate-bounce max-w-xl mx-auto">{error}</div>}

        <div className="space-y-8">
          <p className="text-sm font-black text-purple-400 uppercase tracking-[0.2em]">{t('tryTheseIdeas')}</p>
          <div className="flex flex-wrap justify-center gap-6">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { playSound('pop'); setPrompt(s); }}
                className={`px-8 py-4 rounded-2xl text-lg font-black transition-all border-2 hover:scale-105 ${
                  theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                    : 'bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100'
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
