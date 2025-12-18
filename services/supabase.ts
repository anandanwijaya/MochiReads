
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = 'https://pjijqlzkvnmweocctdbo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaWpxbHprdm5td2VvY2N0ZGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDI5MTUsImV4cCI6MjA4MTYxODkxNX0.ymlSxkTpJQPoWyKCoubO2gpyzl4TgKbx913AoB1yaAI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export interface UploadResponse {
  url: string;
  path: string;
}

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  return { error };
};

export const signInWithEmail = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  return { error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Uploads a base64 encoded image to the specified bucket
 */
export const uploadImageFromBase64 = async (base64String: string, fileName: string): Promise<UploadResponse> => {
  try {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: 'image/png' });

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, path: data.path };
  } catch (err) {
    console.error('Error uploading base64 image:', err);
    throw err;
  }
};

/**
 * Fetches an image from a URL and uploads it to the specified bucket
 */
export const uploadImageFromUrl = async (url: string, fileName: string): Promise<UploadResponse> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        contentType: blob.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, path: data.path };
  } catch (err) {
    console.error('Error uploading image from URL:', err);
    throw err;
  }
};
