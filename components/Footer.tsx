
import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Database, Loader2, CheckCircle, ExternalLink, Trash2 } from 'lucide-react';
import { playSound } from './SoundEffects';
import { AppLanguage } from '../types';
import { getTranslation } from '../i18n';

interface FooterProps {
  theme: 'light' | 'dark';
  language: AppLanguage;
  onAdminSeed?: (clearExisting: boolean) => Promise<any>;
  user?: any;
}

const Footer: React.FC<FooterProps> = ({ theme, language, onAdminSeed, user }) => {
  const [seeding, setSeeding] = useState(false);
  const [seedComplete, setSeedComplete] = useState(false);
  const t = (key: any) => getTranslation(language, key);

  const handleSeed = async (clear: boolean) => {
    if (!onAdminSeed) return;
    const msg = clear 
      ? 'This will CLEAR the library and upload the mock books. Continue?' 
      : 'This will add the mock books to your library. Continue?';
    
    if (confirm(msg)) {
      setSeeding(true);
      playSound('pop');
      try {
        await onAdminSeed(clear);
        setSeedComplete(true);
        playSound('tada');
        setTimeout(() => setSeedComplete(false), 5000);
      } catch (err) {
        console.error('Seed failed:', err);
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <footer className={`transition-colors duration-500 border-t pt-20 pb-12 ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-100'
    }`}>
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <h2 className={`text-3xl font-bold mb-6 font-playful ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              Mochi<span className="text-purple-600">Reads</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-lg leading-relaxed">
              Empowering children with magical stories and high-quality reading experiences. Our mission is to foster a lifelong love of reading across Asia and beyond.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <Facebook size={22} />, href: 'https://facebook.com/mochireads' },
                { icon: <Twitter size={22} />, href: 'https://twitter.com/mochireads' },
                { icon: <Instagram size={22} />, href: 'https://instagram.com/mochireads' },
                { icon: <Youtube size={22} />, href: 'https://youtube.com/@mochireads' }
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-purple-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all hover:scale-110 active:scale-90 shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className={`font-bold mb-6 uppercase tracking-wider text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
              {t('library')}
            </h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-bold text-lg">
              <li><a href="https://ai.google.dev/gemini-api/docs" target="_blank" className="hover:text-purple-600 transition-colors flex items-center gap-2">API Docs <ExternalLink size={14} /></a></li>
              <li><a href="https://github.com/google-gemini" target="_blank" className="hover:text-purple-600 transition-colors flex items-center gap-2">GitHub <ExternalLink size={14} /></a></li>
              <li><a href="https://ai.google.dev/pricing" target="_blank" className="hover:text-purple-600 transition-colors flex items-center gap-2">Gemini Pricing <ExternalLink size={14} /></a></li>
            </ul>
          </div>
          
          <div>
            <h4 className={`font-bold mb-6 uppercase tracking-wider text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
              {t('magicLab')}
            </h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-bold text-lg">
              <li><a href="https://deepmind.google/technologies/gemini/" target="_blank" className="hover:text-fuchsia-600 transition-colors">Gemini Models</a></li>
              <li><a href="https://imagen.research.google/" target="_blank" className="hover:text-fuchsia-600 transition-colors">Imagen Research</a></li>
              <li><a href="https://ai.google.dev/examples" target="_blank" className="hover:text-fuchsia-600 transition-colors">Lab Examples</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className={`font-bold mb-6 uppercase tracking-wider text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
              Newsletter
            </h4>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-lg leading-relaxed">Join 50,000+ parents and kids getting magical book recommendations every week.</p>
            <div className="flex gap-2 max-w-md">
              <input 
                type="email" 
                placeholder="mochi@reading.com" 
                className={`flex-1 border-none rounded-xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 ${
                  theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100'
                }`}
              />
              <button className="bg-purple-600 text-white px-4 rounded-xl hover:bg-purple-700 transition-colors group">
                <Mail size={22} className="group-hover:rotate-12" />
              </button>
            </div>
          </div>
        </div>
        
        <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400 font-bold ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex flex-col items-start gap-2">
            <p>© 2024 MochiReads. Powered by Google Gemini AI.</p>
            {onAdminSeed && user && (
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => handleSeed(false)}
                  disabled={seeding}
                  className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black transition-colors ${
                    theme === 'dark' ? 'text-slate-600 hover:text-purple-400' : 'text-slate-300 hover:text-purple-400'
                  }`}
                >
                  {seeding ? (
                    <><Loader2 size={12} className="animate-spin" /> Seeding...</>
                  ) : seedComplete ? (
                    <><CheckCircle size={12} className="text-green-500" /> Success!</>
                  ) : (
                    <><Database size={12} /> Seed Library</>
                  )}
                </button>
                <button 
                  onClick={() => handleSeed(true)}
                  disabled={seeding}
                  className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black transition-colors ${
                    theme === 'dark' ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-400'
                  }`}
                  title="Clear library and seed fresh"
                >
                  <Trash2 size={12} /> Clear & Seed
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-8 text-base">
            <a href="https://ai.google.dev/terms" target="_blank" className="hover:text-purple-600">Privacy</a>
            <a href="https://ai.google.dev/gemini-api/terms" target="_blank" className="hover:text-purple-600">Terms</a>
            <a href="https://support.google.com/" target="_blank" className="hover:text-purple-600">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
