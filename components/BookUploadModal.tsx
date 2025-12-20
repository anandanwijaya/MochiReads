
import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, BookOpen, Loader2, Image as ImageIcon, Type, Globe, Star, ChevronLeft, ChevronRight, Settings2, Layout, CheckCircle, PawPrint, Atom, Compass, Scroll, Heart } from 'lucide-react';
import { supabase, uploadImageFromBase64 } from '../services/supabase';
import { playSound } from './SoundEffects';
import { AppLanguage, Category } from '../types';

interface BookUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  theme: 'light' | 'dark';
  language: AppLanguage;
}

const CATEGORIES: { id: Exclude<Category, 'All'>; icon: React.ReactNode; color: string }[] = [
  { id: 'Animal Stories', icon: <PawPrint size={18} />, color: 'bg-brand-rose' },
  { id: 'Science', icon: <Atom size={18} />, color: 'bg-brand-cyan' },
  { id: 'Adventure', icon: <Compass size={18} />, color: 'bg-brand-amber' },
  { id: 'Folk Tales', icon: <Scroll size={18} />, color: 'bg-brand-purple' },
  { id: 'Life Skills', icon: <Heart size={18} />, color: 'bg-brand-pink' },
];

const BookUploadModal: React.FC<BookUploadModalProps> = ({ isOpen, onClose, onUploadSuccess, theme, language }) => {
  const [step, setStep] = useState<'info' | 'pages'>('info');
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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

  // Story Pages
  const [pages, setPages] = useState<{ text: string; image: string | null }[]>([
    { text: '', image: null }
  ]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pageImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (index === undefined) {
          setCoverImage(base64);
        } else {
          const newPages = [...pages];
          newPages[index].image = base64;
          setPages(newPages);
        }
        playSound('pop');
      };
      reader.readAsDataURL(file);
    }
  };

  const addPage = () => {
    playSound('pop');
    const newPages = [...pages, { text: '', image: null }];
    setPages(newPages);
    setActivePageIndex(newPages.length - 1);
  };

  const removePage = (index: number) => {
    if (pages.length > 1) {
      playSound('woosh');
      const newPages = pages.filter((_, i) => i !== index);
      const newActiveIndex = Math.max(0, index - 1);
      setPages(newPages);
      setActivePageIndex(newActiveIndex);
    }
  };

  const handlePageTextChange = (text: string) => {
    const newPages = [...pages];
    newPages[activePageIndex].text = text;
    setPages(newPages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      setStep('info');
      setError("Please upload a cover image!");
      return;
    }

    setIsLoading(true);
    setError(null);
    playSound('pop');

    try {
      const coverRes = await uploadImageFromBase64(coverImage, `user-uploads/covers/${Date.now()}.png`);
      
      const pageImageUrls = await Promise.all(
        pages.map(async (p, i) => {
          if (p.image) {
            const res = await uploadImageFromBase64(p.image, `user-uploads/pages/${Date.now()}-${i}.png`);
            return res.url;
          }
          return `https://picsum.photos/seed/${Date.now()}-${i}/800/600`;
        })
      );

      const finalTags = [selectedCategory, ...tags.split(',').map(t => t.trim()).filter(t => t && t !== selectedCategory)];

      const { error: dbError } = await supabase
        .from('books')
        .insert([{
          title,
          author: author || 'Anonymous',
          illustrator: 'Guest Artist',
          description,
          cover_image_url: coverRes.url,
          cover_image_path: coverRes.path,
          language: bookLanguage,
          level,
          tags: finalTags,
          pages: pages.map(p => p.text),
          page_images: pageImageUrls,
          is_public: true
        }]);

      if (dbError) throw dbError;

      playSound('tada');
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong during the upload.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl h-[95vh] sm:h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden border-8 flex flex-col animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
        
        <div className={`p-6 sm:p-8 flex items-center justify-between border-b-4 shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 shrink-0">
              <Upload size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-xl sm:text-2xl font-display font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>Creation Lab</h2>
              <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest truncate">
                {step === 'info' ? 'Story Details' : `Editing Page ${activePageIndex + 1}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border-2 dark:border-slate-700">
               <button 
                 onClick={() => { playSound('pop'); setStep('info'); }}
                 className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step === 'info' ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 1. Info
               </button>
               <button 
                 onClick={() => { playSound('pop'); setStep('pages'); }}
                 className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step === 'pages' ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 2. Pages
               </button>
             </div>
             <button onClick={onClose} className={`p-2 rounded-full transition-all ${isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}>
               <X size={24} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
          {step === 'info' ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-left-4 duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Book Cover</label>
                  <div 
                    onClick={() => coverInputRef.current?.click()}
                    className={`aspect-[3/4] rounded-[2.5rem] border-4 border-dashed cursor-pointer relative group overflow-hidden transition-all tactile-button ${
                      coverImage ? 'border-transparent shadow-xl' : (isDark ? 'bg-slate-800 border-slate-700 hover:border-brand-blue' : 'bg-slate-50 border-slate-100 hover:border-brand-blue')
                    }`}
                  >
                    {coverImage ? (
                      <img src={coverImage} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 group-hover:text-brand-blue p-8 text-center">
                        <ImageIcon size={48} className="mb-4 opacity-10" />
                        <p className="text-xs font-black uppercase tracking-widest">Click to Upload Cover</p>
                      </div>
                    )}
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e)} />
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Story Title</label>
                    <input 
                      required 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-6 py-4 rounded-2xl outline-none border-4 transition-all font-bold text-xl sm:text-2xl ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-brand-purple focus:bg-slate-900' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-brand-blue focus:bg-white'}`}
                      placeholder="e.g. The Brave Little Kitten"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Select Category</label>
                    <div className="flex flex-wrap gap-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => { playSound('pop'); setSelectedCategory(cat.id); }}
                          className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-4 transition-all font-bold text-sm tactile-button ${
                            selectedCategory === cat.id 
                              ? `${isDark ? 'bg-brand-purple border-purple-400' : 'bg-brand-blue border-blue-200'} text-white shadow-lg scale-105` 
                              : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-500')
                          }`}
                        >
                          {cat.icon}
                          {cat.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Author Name</label>
                      <input 
                        type="text" 
                        value={author} 
                        onChange={(e) => setAuthor(e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-brand-purple' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-brand-blue'}`}
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Language</label>
                      <select 
                        value={bookLanguage} 
                        onChange={(e) => setBookLanguage(e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl outline-none border-4 transition-all font-bold appearance-none bg-no-repeat bg-[right_1rem_center] ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-brand-purple' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-brand-blue'}`}
                      >
                        <option>English</option>
                        <option>Malay</option>
                        <option>Indonesian</option>
                        <option>Thai</option>
                        <option>Chinese</option>
                        <option>Japanese</option>
                        <option>Korean</option>
                        <option>Vietnamese</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Reading Level</label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(l => (
                          <button 
                            key={l}
                            type="button"
                            onClick={() => { playSound('pop'); setLevel(l); }}
                            className={`w-11 h-11 rounded-xl font-black transition-all border-4 tactile-button ${level === l ? 'bg-brand-blue border-blue-400 text-white shadow-lg' : (isDark ? 'bg-slate-800 border-slate-800 text-slate-500 hover:border-slate-700' : 'bg-white border-slate-50 text-slate-400 hover:border-blue-50')}`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Extra Tags (comma separated)</label>
                      <input 
                        type="text" 
                        value={tags} 
                        onChange={(e) => setTags(e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-brand-purple' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-brand-blue'}`}
                        placeholder="funny, cats, space"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Quick Description</label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this magical story about?"
                      className={`w-full px-5 py-3 rounded-2xl outline-none border-4 transition-all font-bold h-24 resize-none ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-brand-purple' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-brand-blue'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-200 overflow-hidden">
              <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                 <div className="lg:w-1/2 aspect-[4/3] lg:aspect-auto rounded-[2.5rem] border-4 border-dashed overflow-hidden relative group tactile-button shrink-0 shadow-inner">
                    <div 
                      onClick={() => pageImageInputRef.current?.click()}
                      className={`w-full h-full flex flex-col items-center justify-center cursor-pointer ${pages[activePageIndex].image ? '' : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100')}`}
                    >
                      {pages[activePageIndex].image ? (
                        <img src={pages[activePageIndex].image!} className="w-full h-full object-cover" alt={`Page ${activePageIndex + 1}`} />
                      ) : (
                        <div className="text-center p-6 text-slate-300">
                           <ImageIcon size={48} className="mx-auto mb-3 opacity-10" />
                           <p className="text-xs font-black uppercase tracking-widest">Add Image for P{activePageIndex + 1}</p>
                        </div>
                      )}
                    </div>
                    <input 
                      ref={pageImageInputRef} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageChange(e, activePageIndex)} 
                    />
                    
                    <button 
                      onClick={() => removePage(activePageIndex)}
                      disabled={pages.length === 1}
                      className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-90 disabled:hidden"
                    >
                      <Trash2 size={20} />
                    </button>
                 </div>

                 <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between px-2">
                      <label className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em]">Story Text (Page {activePageIndex + 1})</label>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pages[activePageIndex].text.length} chars</span>
                    </div>
                    <textarea 
                      value={pages[activePageIndex].text}
                      onChange={(e) => handlePageTextChange(e.target.value)}
                      placeholder="Write your story here..."
                      className={`flex-1 w-full p-6 sm:p-8 rounded-[2.5rem] outline-none border-4 transition-all font-display font-bold text-xl sm:text-2xl lg:text-3xl resize-none shadow-inner leading-relaxed ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-brand-purple' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-brand-blue'}`}
                    />
                 </div>
              </div>

              <div className={`shrink-0 p-3 rounded-[2rem] border-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-white'}`}>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 px-1 snap-x">
                  {pages.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => { playSound('pop'); setActivePageIndex(idx); }}
                      className={`relative w-16 sm:w-20 aspect-square shrink-0 rounded-2xl border-4 transition-all snap-start overflow-hidden tactile-button ${
                        activePageIndex === idx 
                          ? 'border-brand-blue scale-105 shadow-xl ring-4 ring-brand-blue/10' 
                          : (isDark ? 'border-slate-800 bg-slate-800/50 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-brand-blue/30')
                      }`}
                    >
                      {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover" alt={`P${idx+1}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">P{idx + 1}</div>
                      )}
                      <div className={`absolute inset-x-0 bottom-0 text-white text-[8px] font-black py-0.5 text-center ${activePageIndex === idx ? 'bg-brand-blue' : 'bg-black/30'}`}>P{idx + 1}</div>
                    </button>
                  ))}
                  
                  <button 
                    onClick={addPage}
                    className="w-16 sm:w-20 aspect-square shrink-0 rounded-2xl border-4 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all tactile-button group"
                  >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[8px] font-black uppercase mt-1">Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`p-6 sm:p-8 border-t-4 flex items-center justify-between gap-4 shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
          <div className="flex-1 min-w-0">
            {error && <p className="text-red-500 text-xs font-bold animate-shake truncate">{error}</p>}
          </div>
          
          <div className="flex gap-4">
            {step === 'pages' ? (
              <button 
                onClick={() => { playSound('woosh'); setStep('info'); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Settings2 size={18} /> <span className="hidden sm:inline">Edit Details</span>
              </button>
            ) : (
              <button 
                onClick={onClose}
                className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Cancel
              </button>
            )}

            {step === 'info' ? (
              <button 
                onClick={() => { playSound('pop'); setStep('pages'); }}
                className="px-8 sm:px-12 py-3 sm:py-4 bg-brand-blue text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-base sm:text-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 tactile-button"
              >
                Add Pages <ChevronRight size={20} strokeWidth={3} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 sm:px-12 py-3 sm:py-4 bg-brand-purple text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-base sm:text-xl shadow-brand-purple/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 tactile-button"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <><CheckCircle size={20} strokeWidth={3} /> Publish Book</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookUploadModal;
