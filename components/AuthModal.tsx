import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Mail, Lock, User } from 'lucide-react';
import { manualSignIn, manualSignUp } from '../services/supabase';
import { playSound } from './SoundEffects';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  onRlsError?: (message: string) => void;
  theme?: 'light' | 'dark';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, onRlsError, theme }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);
    playSound('pop');

    try {
      const result = isRegister 
        ? await manualSignUp(email, password, fullName)
        : await manualSignIn(email, password);

      if (result.error) {
        setError(result.error.message || "Authentication failed");
        setIsLoading(false);
      } else {
        playSound('tada');
        setIsLoading(false);
        onAuthSuccess(result.data);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      setIsLoading(false);
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
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ${isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <Sparkles size={40} />
            </div>

            <h2 className={`text-3xl font-display font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {isRegister ? "Join the Adventure!" : "Welcome Back!"}
            </h2>
            <p className={`font-bold mb-8 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {isRegister ? "Create your account to save stories." : "Sign in to access your magical shelf."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6 text-left">
              {isRegister && (
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-purple-600 focus:bg-slate-900' : 'bg-slate-50 border-slate-100 text-slate-700 focus:border-purple-200 focus:bg-white'}`}
                  />
                </div>
              )}
              
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-purple-600 focus:bg-slate-900' : 'bg-slate-50 border-slate-100 text-slate-700 focus:border-purple-200 focus:bg-white'}`}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-4 transition-all font-bold ${isDark ? 'bg-slate-800 border-slate-800 text-white focus:border-purple-600 focus:bg-slate-900' : 'bg-slate-50 border-slate-100 text-slate-700 focus:border-purple-200 focus:bg-white'}`}
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-[0_6px_0_0_#7e22ce] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#7e22ce] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : (isRegister ? "Sign Up" : "Sign In")}
              </button>
            </form>

            {error && (
              <p className="mb-6 text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900 animate-shake">
                {error}
              </p>
            )}

            <button 
              onClick={() => { playSound('pop'); setIsRegister(!isRegister); setError(null); }}
              className={`text-sm font-black uppercase tracking-widest transition-colors ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'}`}
            >
              {isRegister ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
