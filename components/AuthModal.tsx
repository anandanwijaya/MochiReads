
import React, { useState } from 'react';
import { X, Sparkles, Loader2, Mail, CheckCircle } from 'lucide-react';
import { signInWithGoogle, signInWithEmail } from '../services/supabase';
import { playSound } from './SoundEffects';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, theme }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    playSound('pop');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    playSound('pop');

    const { error } = await signInWithEmail(email);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setIsSent(true);
      setIsLoading(false);
      playSound('tada');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border-8 animate-in zoom-in-95 duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
        <div className="relative p-8 sm:p-12">
          <button 
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-full transition-all ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <X size={24} />
          </button>

          <div className="text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner ${isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <Sparkles size={40} />
            </div>

            {isSent ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-500'}`}>
                  <CheckCircle size={32} />
                </div>
                <h2 className={`text-3xl font-display font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Check Your Email!</h2>
                <p className={`font-bold mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  We sent a magic link to <span className="text-purple-600">{email}</span>. Click it to log in instantly!
                </p>
                <button 
                  onClick={onClose}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Got it!
                </button>
              </div>
            ) : (
              <>
                <h2 className={`text-3xl font-display font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Welcome Back!</h2>
                <p className={`font-bold mb-10 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Sign in to start your reading adventure.</p>

                <form onSubmit={handleEmailSignIn} className="space-y-4 mb-8">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input 
                      type="email"
                      required
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-purple-600 focus:bg-slate-900' : 'bg-slate-50 border-slate-100 text-slate-700 focus:border-purple-200 focus:bg-white'}`}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-[0_6px_0_0_#7e22ce] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#7e22ce] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Send Magic Link"}
                  </button>
                </form>

                <div className="relative flex items-center justify-center mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}></div>
                  </div>
                  <span className={`relative px-4 text-xs font-black uppercase tracking-[0.2em] ${isDark ? 'bg-slate-900 text-slate-600' : 'bg-white text-slate-300'}`}>OR</span>
                </div>

                <div className="space-y-6">
                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className={`w-full py-4 border-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 ${isDark ? 'bg-slate-800 border-slate-800 text-slate-300 hover:border-purple-600 hover:bg-slate-900' : 'bg-white border-slate-100 text-slate-700 hover:border-purple-200 hover:bg-purple-50'}`}
                  >
                    {isLoading ? (
                      <Loader2 size={24} className="animate-spin text-purple-600" />
                    ) : (
                      <>
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            style={{ fill: '#4285F4' }}
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            style={{ fill: '#34A853' }}
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            style={{ fill: '#FBBC05' }}
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            style={{ fill: '#EA4335' }}
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>

                  {error && (
                    <p className="text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900">
                      {error}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 font-bold pt-4">
                    By signing in, you agree to our magic reading terms!
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
