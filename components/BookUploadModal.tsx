
import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight, Settings2, CheckCircle, FileText, MousePointer2, Layout, Sparkles, Wand2 } from 'lucide-react';
import { supabase, uploadImageFromBase64, uploadFile } from '../services/supabase';
import { playSound } from './SoundEffects';
import { AppLanguage, Category } from '../types';

// PDF.js integration
// @ts-ignore
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.10.38';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

interface BookUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  theme: 'light' | 'dark';
  language: AppLanguage;
}

const CATEGORIES: { id: Exclude<Category, 'All'>; icon: string }[] = [
  { id: 'Animal Stories', icon: '🐾' },
  { id: 'Science', icon: '🧪' },
  { id: 'Adventure', icon: '🗺️' },
  { id: 'Folk Tales', icon: '📜' },
  { id: 'Life Skills', icon: '❤️' },
];

const BookUploadModal: React.FC<BookUploadModalProps> = ({ isOpen, onClose, onUploadSuccess, theme, language }) => {
  const [step, setStep] = useState<'source' | 'info' | 'pages'>('source');
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPdf, setProcessingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Book Metadata
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [bookLanguage, setBookLanguage] = useState('English');
  const [level, setLevel] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Exclude<Category, 'All'>>('Adventure');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isPdfSource, setIsPdfSource] = useState(false);

  // Story Pages Data
  const [pages, setPages] = useState<{ text: string; image: string | null }[]>([
    { text: '', image: null }
  ]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const manualImageRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const handlePdfExtraction = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsPdfSource(true);
      setProcessingPdf(true);
      setError(null);
      playSound('pop');

      try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
          const typedArray = new Uint8Array(this.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          const extractedPages = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              const imageData = canvas.toDataURL('image/png');
              
              extractedPages.push({ 
                text: '', 
                image: imageData
              });
            }
          }

          setPages(extractedPages);
          if (extractedPages.length > 0 && !coverImage) {
            setCoverImage(extractedPages[0].image);
          }
          if (!title) setTitle(file.name.replace('.pdf', ''));
          
          setProcessingPdf(false);
          setStep('info');
          playSound('tada');
        };
        fileReader.readAsArrayBuffer(file);
      } catch (err) {
        setError("Could not process PDF.");
        setProcessingPdf(false);
      }
    }
  };

  const handleManualImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newPages = [...pages];
        newPages[activePageIndex].image = reader.result as string;
        setPages(newPages);
        playSound('pop');
      };
      reader.readAsDataURL(file);
    }
  };

  const addManualPage = () => {
    playSound('pop');
    const newPages = [...pages, { text: '', image: null }];
    setPages(newPages);
    setActivePageIndex(newPages.length - 1);
  };

  const removePage = (index: number) => {
    if (pages.length > 1) {
      playSound('woosh');
      const newPages = pages.filter((_, i) => i !== index);
      setPages(newPages);
      setActivePageIndex(Math.max(0, index - 1));
    }
  };

  const handleSubmit = async () => {
    // 1. Skip blank pages (only keep pages that have an image)
    const validPages = pages.filter(p => p.image !== null);
    
    if (!coverImage) { setStep('info'); setError("Cover image is required!"); return; }
    if (validPages.length === 0) { setStep('pages'); setError("You must have at least one page with an image!"); return; }
    
    setIsLoading(true);
    playSound('pop');

    try {
      // Upload cover
      const coverRes = await uploadImageFromBase64(coverImage, `covers/${Date.now()}.png`);

      // Upload page images
      const pageImageUrls = await Promise.all(validPages.map(async (p, i) => {
        if (p.image) {
          const res = await uploadImageFromBase64(p.image, `pages/${Date.now()}-${i}.png`);
          return res.url;
        }
        return '';
      }));

      // 2. Use description from text if blank
      const finalDescription = description || validPages[0].text || "A magical adventure waiting to be read.";

      // 3. Prepare tags (including 'PDF' marker to identify source without pdf_url column)
      // Added explicit string[] type to finalTags to fix "Argument of type 'string' is not assignable to parameter" errors
      const finalTags: string[] = [selectedCategory];
      if (isPdfSource) finalTags.push('PDF');
      if (tags.trim()) {
        tags.split(',').forEach(tag => {
          const t = tag.trim();
          if (t && !finalTags.includes(t)) finalTags.push(t);
        });
      }

      // 4. Insert into DB (matching the exact schema provided)
      const { error: dbError } = await supabase.from('books').insert([{
        title, 
        author: author || 'Guest', 
        illustrator: 'Guest Artist',
        description: finalDescription,
        cover_image_url: coverRes.url, 
        cover_image_path: coverRes.path,
        language: bookLanguage, 
        level: level.toString(), 
        tags: finalTags,
        pages: validPages.map(p => p.text), 
        page_images: pageImageUrls, 
        is_public: true
      }]);

      if (dbError) throw dbError;
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden border-8 flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
        
        <div className={`p-6 flex items-center justify-between border-b-4 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white rotate-3">
              <Upload size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Book Creator</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {step === 'source' ? 'Step 1: Choose Source' : step === 'info' ? 'Step 2: Details' : 'Step 3: Magic Pages'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {step === 'source' && (
            <div className="max-w-4xl mx-auto h-full flex flex-col justify-center gap-12 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-4">
                <h3 className="text-5xl sm:text-6xl font-display font-black text-brand-violet dark:text-white leading-tight">
                   Start your story <span className="magic-purple-text italic">your way!</span>
                </h3>
                <p className={`text-xl font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Choose how you'd like to bring your adventure to life.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <button 
                  onClick={() => { playSound('pop'); setStep('info'); setIsPdfSource(false); }}
                  className="p-12 rounded-[3.5rem] border-8 border-brand-lavender dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-blue hover:scale-105 active:scale-95 transition-all group flex flex-col items-center gap-8 shadow-xl"
                >
                  <div className="w-28 h-28 bg-brand-softPurple dark:bg-brand-blue/10 rounded-[2.5rem] flex items-center justify-center text-brand-blue group-hover:rotate-12 transition-transform shadow-inner">
                    <Wand2 size={56} strokeWidth={2.5} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-3xl font-black mb-3">Manual Upload</h4>
                    <p className="text-base font-bold text-slate-400 max-w-[200px]">Create from scratch, page by page.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { playSound('pop'); pdfInputRef.current?.click(); }}
                  disabled={processingPdf}
                  className="p-12 rounded-[3.5rem] border-8 border-brand-lavender dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-purple hover:scale-105 active:scale-95 transition-all group flex flex-col items-center gap-8 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-28 h-28 bg-purple-50 dark:bg-brand-purple/10 rounded-[2.5rem] flex items-center justify-center text-brand-purple group-hover:rotate-12 transition-transform shadow-inner">
                    {processingPdf ? <Loader2 size={56} className="animate-spin" /> : <FileText size={56} strokeWidth={2.5} />}
                  </div>
                  <div className="text-center">
                    <h4 className="text-3xl font-black mb-3">Extract PDF</h4>
                    <p className="text-base font-bold text-slate-400 max-w-[200px]">Magically turn your PDF into a book.</p>
                  </div>
                  <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfExtraction} />
                </button>
              </div>
            </div>
          )}

          {step === 'info' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-6 mb-8">
                 <button onClick={() => setStep('source')} className={`p-4 rounded-2xl border-4 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-50 border-white text-slate-400 hover:text-brand-purple'} transition-all`}>
                    <ChevronLeft size={24} strokeWidth={3} />
                 </button>
                 <h3 className="text-4xl font-display font-black">Book Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block px-2">Book Cover</label>
                  <div onClick={() => coverInputRef.current?.click()} className={`aspect-[3/4] rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all ${
                    isDark ? 'border-slate-700 hover:border-brand-blue bg-slate-800' : 'border-slate-200 hover:border-brand-blue bg-slate-50'
                  }`}>
                    {coverImage ? (
                      <img src={coverImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <ImageIcon size={56} className="text-slate-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Cover</span>
                      </div>
                    )}
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const reader = new FileReader();
                        reader.onload = () => setCoverImage(reader.result as string);
                        reader.readAsDataURL(f);
                      }
                    }} />
                  </div>
                </div>
                
                <div className="md:col-span-8 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block px-2">Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter a magical title..." className={`w-full p-6 rounded-[2rem] border-4 outline-none font-bold text-2xl transition-all ${
                      isDark ? 'bg-slate-800 border-transparent focus:border-brand-blue text-white' : 'bg-slate-50 border-transparent focus:border-brand-blue text-slate-900'
                    }`} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block px-2">Author</label>
                      <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Who wrote this?" className={`w-full p-5 rounded-[2rem] border-4 outline-none font-bold text-lg transition-all ${
                        isDark ? 'bg-slate-800 border-transparent focus:border-brand-blue text-white' : 'bg-slate-50 border-transparent focus:border-brand-blue text-slate-900'
                      }`} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block px-2">Category</label>
                      <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as any)} className={`w-full p-5 rounded-[2rem] border-4 outline-none font-bold text-lg appearance-none cursor-pointer transition-all ${
                        isDark ? 'bg-slate-800 border-transparent focus:border-brand-blue text-white' : 'bg-slate-50 border-transparent focus:border-brand-blue text-slate-900'
                      }`}>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block px-2">Story Description (Optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Leave blank to use text from the first page..." className={`w-full p-6 rounded-[2rem] border-4 outline-none font-bold text-lg h-32 resize-none transition-all ${
                      isDark ? 'bg-slate-800 border-transparent focus:border-brand-blue text-white' : 'bg-slate-50 border-transparent focus:border-brand-blue text-slate-900'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'pages' && (
            <div className="h-full flex flex-col gap-10 animate-in slide-in-from-right-8 duration-500">
              <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0">
                <div className="lg:w-1/2 flex flex-col gap-4">
                  <div className={`flex-1 rounded-[3.5rem] border-4 overflow-hidden relative shadow-inner flex items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-white'}`}>
                    {pages[activePageIndex].image ? (
                      <img src={pages[activePageIndex].image!} className="w-full h-full object-contain" />
                    ) : (
                      <button onClick={() => manualImageRef.current?.click()} className="text-center p-10 hover:scale-105 transition-transform">
                        <ImageIcon size={80} className="text-slate-300 mx-auto mb-6" />
                        <span className="font-black uppercase tracking-widest text-sm text-slate-400">Upload Page Image</span>
                      </button>
                    )}
                    <input ref={manualImageRef} type="file" accept="image/*" className="hidden" onChange={handleManualImageUpload} />
                    
                    {pages.length > 1 && (
                      <button onClick={() => removePage(activePageIndex)} className="absolute top-8 right-8 p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all">
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                  <div className="space-y-2 px-2">
                    <label className="text-[11px] font-black text-brand-purple uppercase tracking-[0.4em]">Story Text</label>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {activePageIndex + 1} of {pages.length}</p>
                  </div>
                  <textarea 
                    value={pages[activePageIndex].text}
                    onChange={e => {
                      const n = [...pages]; n[activePageIndex].text = e.target.value; setPages(n);
                    }}
                    placeholder="Describe what's happening in this magical scene..."
                    className={`flex-1 w-full p-10 rounded-[3rem] border-4 outline-none font-bold text-2xl resize-none shadow-inner leading-relaxed transition-all ${
                      isDark ? 'bg-slate-800 border-transparent focus:border-brand-purple text-white' : 'bg-slate-100 border-transparent focus:border-brand-purple text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-4 px-2">
                {pages.map((p, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { playSound('pop'); setActivePageIndex(idx); }}
                    className={`w-24 h-32 rounded-[1.5rem] border-4 shrink-0 overflow-hidden transition-all relative ${activePageIndex === idx ? 'border-brand-blue scale-110 shadow-xl z-10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    {p.image ? (
                      <img src={p.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800"><ImageIcon size={24} className="text-slate-400" /></div>
                    )}
                  </button>
                ))}
                <button 
                  onClick={addManualPage}
                  className={`w-24 h-32 rounded-[1.5rem] border-4 border-dashed shrink-0 flex flex-col items-center justify-center gap-2 transition-all ${
                    isDark ? 'border-slate-700 text-slate-500 hover:border-brand-blue' : 'border-slate-200 text-slate-400 hover:border-brand-blue'
                  }`}
                >
                  <Plus size={32} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`p-8 border-t-4 flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
          <div className="flex-1">
            {error && <p className="text-red-500 text-xs font-black animate-shake px-4">{error}</p>}
          </div>
          <div className="flex gap-4">
            {step !== 'source' && (
              <button 
                onClick={() => setStep(step === 'pages' ? 'info' : 'source')} 
                className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Back
              </button>
            )}
            
            {step !== 'pages' ? (
              <button 
                onClick={() => {
                  if (step === 'info') setStep('pages');
                }}
                disabled={step === 'source'}
                className="px-14 py-5 bg-brand-blue text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 tracking-[0.2em] uppercase text-xs disabled:opacity-0"
              >
                Next <ChevronRight size={18} strokeWidth={3} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={isLoading} 
                className="px-16 py-5 bg-brand-purple text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-4 tracking-[0.2em] uppercase text-xs disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle size={20} strokeWidth={3} /> Publish Book</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookUploadModal;
