import { createClient } from '@supabase/supabase-js';
import * as jose from 'jose';

const supabaseUrl = 'https://pjijqlzkvnmweocctdbo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaWpxbHprdm5td2VvY2N0ZGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDI5MTUsImV4cCI6MjA4MTYxODkxNX0.ymlSxkTpJQPoWyKCoubO2gpyzl4TgKbx913AoB1yaAI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const JWT_SECRET = new TextEncoder().encode('mochi_reads_magic_secret_key_2024');
const TOKEN_KEY = 'mochi_auth_token';

// --- PASSWORD HASHING ---
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- MANUAL AUTH FUNCTIONS ---

export const manualSignUp = async (email: string, password: string, fullName: string = '') => {
  try {
    const password_hash = await hashPassword(password);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email: email.toLowerCase(), 
        password_hash, 
        full_name: fullName 
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Email already registered');
      throw error;
    }

    const token = await new jose.SignJWT({ id: data.id, email: data.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    localStorage.setItem(TOKEN_KEY, token);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const manualSignIn = async (email: string, password: string) => {
  try {
    const password_hash = await hashPassword(password);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password_hash', password_hash)
      .maybeSingle();

    if (error) throw error;
    if (!user) throw new Error('Invalid email or password');

    const token = await new jose.SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    localStorage.setItem(TOKEN_KEY, token);
    return { data: user, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const getManualSession = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.id)
      .single();

    if (error || !user) throw new Error('Session expired');
    return user;
  } catch (err) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const signOut = () => {
  localStorage.removeItem(TOKEN_KEY);
  return Promise.resolve();
};

// Placeholder for Google (Removed as requested for strictly manual flow)
export const signInWithGoogle = () => {
  return Promise.resolve({ error: { message: 'OAuth disabled. Please use email/password.' } });
};

export const syncGoogleUser = (user: any) => Promise.resolve(user);

// --- FAVORITES (Using user email for identity) ---
export const fetchUserFavorites = async (userEmail: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('book_id')
    .eq('user_email', userEmail);
  
  if (error) return [];
  return data.map(f => f.book_id);
};

export const toggleFavoriteInDb = async (userEmail: string, bookId: string, isCurrentlyFav: boolean) => {
  if (isCurrentlyFav) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_email', userEmail)
      .eq('book_id', bookId);
    return !error;
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_email: userEmail, book_id: bookId });
    return !error;
  }
};

// --- PROGRESS ---
export const fetchReadingProgress = async (userEmail: string) => {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_email', userEmail)
    .order('last_read_at', { ascending: false });
  
  if (error) return [];
  return data;
};

export const updateReadingProgress = async (userEmail: string, bookId: string, currentPage: number, isFinished: boolean) => {
  const { error } = await supabase
    .from('reading_progress')
    .upsert({
      user_email: userEmail,
      book_id: bookId,
      current_page: currentPage,
      is_finished: isFinished,
      last_read_at: new Date().toISOString()
    }, {
      onConflict: 'user_email,book_id'
    });
  
  return !error;
};

export interface UploadResponse {
  url: string;
  path: string;
}

export const uploadImageFromBase64 = async (base64String: string, fileName: string): Promise<UploadResponse> => {
  try {
    const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/png' });
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, { contentType: 'image/png', cacheControl: '3600', upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path);
    return { url: publicUrl, path: data.path };
  } catch (err) {
    console.error('Base64 Upload Error:', err);
    throw err;
  }
};

export const uploadImageFromUrl = async (url: string, fileName: string, fallbackTitle: string = 'Story'): Promise<UploadResponse> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path);
    return { url: publicUrl, path: data.path };
  } catch (err) {
    console.error('URL Upload Error:', err);
    return { url: url, path: '' }; // Fallback to original URL
  }
};
