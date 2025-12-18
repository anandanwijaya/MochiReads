
import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, BookOpen, Loader2, Image as ImageIcon, Type, Globe, Star } from 'lucide-react';
import { supabase, uploadImageFromBase64 } from '../services/supabase';
import { playSound } from './SoundEffects';
import { AppLanguage } from '../types';

interface BookUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  theme: 'light' | 'dark';
  language: AppLanguage;
}

const BookUploadModal: React.FC<BookUploadModalProps> = ({ isOpen, onClose, onUploadSuccess, theme, language }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [bookLanguage, setBookLanguage] = useState('English');
  const [level, setLevel] = useState(1);
  const [tags, setTags] = useState('');
  
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [pages, setPages] = useState<{ text: string; image: string | null }[]>([{ text: '', image: null }]);

  const coverInputRef = useRef<HTMLInputElement>(null);

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
    setPages([...pages, { text: '', image: null }]);
  };

  const removePage = (index: number) => {
    if (pages.length > 1) {
      playSound('woosh');
      setPages(pages.filter((_, i) => i !== index));
    }
  };

  const handlePageTextChange = (index: number, text: string) => {
    const newPages = [...pages];
    newPages[index].text = text;
    setPages(newPages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      setError("Please upload a cover image!");
      return;
    }

    setIsLoading(true);
    setError(null);
    playSound('pop');

    try {
      // 1. Upload Cover
      const coverRes = await uploadImageFromBase64(coverImage, `user-uploads/covers/${Date.now()}.png`);
      
      // 2. Upload Page Images
      const pageImageUrls = await Promise.all(
        pages.map(async (p, i) => {
          if (p.image) {
            const res = await uploadImageFromBase64(p.image, `user-uploads/pages/${Date.now()}-${i}.png`);
            return res.url;
          }
          return `https://picsum.photos/seed/${Date.now()}-${i}/800/600`;
        })
      );

      // 3. Insert Book
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
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden border-8 flex flex-col animate-in zoom-in-95 duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
        {/* Header */}
        <div className={`p-8 flex items-center justify-between border-b-4 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
              <Upload size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Contribution Lab</h2>
              <p className="text-sm font-bold text-slate-500">Share your story with the world!</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-3 rounded-full transition-all ${isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <form id="upload-form" onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Left Column: Cover */}
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Book Cover</label>
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className={`aspect-[3/4] rounded-3xl border-4 border-dashed cursor-pointer relative group overflow-hidden transition-all ${
                    coverImage ? 'border-transparent' : (isDark ? 'bg-slate-800 border-slate-700 hover:border-orange-500' : 'bg-slate-50 border-slate-200 hover:border-orange-400')
                  }`}
                >
                  {coverImage ? (
                    <img src={coverImage} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 group-hover:text-orange-400 p-6 text-center">
                      <ImageIcon size={48} className="mb-4 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">Click to Upload</p>
                    </div>
                  )}
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e)} />
                </div>
              </div>

              {/* Right Column: Metadata */}
              <div className="col-span-2 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Title</label>
                  <input 
                    required 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-6 py-4 rounded-2xl outline-none border-4 transition-all font-bold text-xl ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-orange-600' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-orange-200'}`}
                    placeholder="E.g. The Brave Little Seed"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Author</label>
                    <input 
                      type="text" 
                      value={author} 
                      onChange={(e) => setAuthor(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-orange-600' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-orange-200'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Language</label>
                    <select 
                      value={bookLanguage} 
                      onChange={(e) => setBookLanguage(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-orange-600' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-orange-200'}`}
                    >
                      <option>English</option>
                      <option>Malay</option>
                      <option>Indonesian</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Level (1-5)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(l => (
                        <button 
                          key={l}
                          type="button"
                          onClick={() => setLevel(l)}
                          className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${level === l ? 'bg-orange-500 text-white shadow-md' : (isDark ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:bg-orange-50')}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={tags} 
                      onChange={(e) => setTags(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-orange-600' : 'bg-slate-50 border-slate-50 text-slate-700 focus:border-orange-200'}`}
                      placeholder="Nature, Friendship, Magic"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pages Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Story Pages</h3>
                <button 
                  type="button" 
                  onClick={addPage}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-[0_4px_0_0_#c2410c] hover:translate-y-[1px] active:translate-y-[4px] active:shadow-none transition-all"
                >
                  <Plus size={18} strokeWidth={3} /> Add Page
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pages.map((page, idx) => (
                  <div key={idx} className={`rounded-[2.5rem] p-6 border-4 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-3 py-1 bg-orange-50 rounded-full">Page {idx + 1}</span>
                      <button 
                        type="button"
                        onClick={() => removePage(idx)}
                        disabled={pages.length === 1}
                        className="p-2 text-red-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div 
                        className={`w-full sm:w-28 aspect-square rounded-2xl border-2 border-dashed flex-shrink-0 relative cursor-pointer overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700 hover:border-orange-500' : 'bg-white border-slate-200 hover:border-orange-400'}`}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => handleImageChange(e as any, idx);
                          input.click();
                        }}
                      >
                        {page.image ? (
                          <img src={page.image} className="w-full h-full object-cover" alt="Page" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-2 text-center">
                            <ImageIcon size={20} className="mb-1 opacity-20" />
                            <span className="text-[8px] font-black uppercase">Art</span>
                          </div>
                        )}
                      </div>
                      <textarea 
                        required
                        value={page.text}
                        onChange={(e) => handlePageTextChange(idx, e.target.value)}
                        placeholder="Once upon a time..."
                        className={`flex-1 min-h-[100px] p-4 rounded-2xl border-4 outline-none resize-none font-bold transition-all ${isDark ? 'bg-slate-800 border-transparent text-slate-200 focus:border-orange-600' : 'bg-white border-transparent text-slate-700 focus:border-orange-100'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`p-8 border-t-4 flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
          <div className="max-w-xs">
            {error && <p className="text-red-500 text-xs font-bold animate-pulse">{error}</p>}
          </div>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className={`px-8 py-3 rounded-2xl font-black transition-all ${isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Discard
            </button>
            <button 
              form="upload-form"
              type="submit"
              disabled={isLoading}
              className="px-12 py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-[0_6px_0_0_#c2410c] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Publish Book"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookUploadModal;
