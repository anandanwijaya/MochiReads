import { MOCK_BOOKS } from '../constants';
import { supabase, uploadImageFromUrl, uploadImageFromBase64 } from './supabase';

export interface SeedProgress {
  status: 'idle' | 'testing' | 'uploading' | 'finishing' | 'error' | 'success';
  currentBook?: string;
  count: number;
  total: number;
  message: string;
}

/**
 * Tests the storage bucket connection.
 */
export const testStorage = async (): Promise<boolean> => {
  try {
    const testBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const fileName = `test/connection-check-${Date.now()}.png`;
    await uploadImageFromBase64(testBase64, fileName);
    return true;
  } catch (err) {
    console.error("Storage test failed:", err);
    return false;
  }
};

/**
 * Seeds the library with 10 books.
 * @param onProgress Callback to update UI with current status
 */
export const seedLibrary = async (onProgress: (p: SeedProgress) => void) => {
  const totalBooks = MOCK_BOOKS.length;
  
  onProgress({ status: 'testing', count: 0, total: totalBooks, message: 'Testing magical storage connection...' });
  
  const canUpload = await testStorage();
  if (!canUpload) {
    onProgress({ 
      status: 'error', 
      count: 0, 
      total: totalBooks, 
      message: "Storage Error: Bucket 'images' not found or not public. Go to Supabase -> Storage -> Create public 'images' bucket." 
    });
    return;
  }

  onProgress({ status: 'uploading', count: 0, total: totalBooks, message: 'Waking up the storytellers...' });

  for (let i = 0; i < totalBooks; i++) {
    const book = MOCK_BOOKS[i];
    onProgress({ 
      status: 'uploading', 
      count: i + 1, 
      total: totalBooks, 
      currentBook: book.title,
      message: `Painting covers for "${book.title}"...` 
    });

    try {
      // Add a small delay between books to prevent network congestion
      await new Promise(resolve => setTimeout(resolve, 300));

      const timestamp = Date.now();
      
      // 1. Upload Cover
      const coverFileName = `library/${book.id}/cover-${timestamp}.jpg`;
      const coverUpload = await uploadImageFromUrl(book.coverImage, coverFileName, book.title);

      // 2. Upload Pages (Placeholder images to storage)
      const pageImageUrls: string[] = [];
      for (let pIdx = 0; pIdx < book.pages.length; pIdx++) {
        const pageFileName = `library/${book.id}/page-${pIdx}-${timestamp}.jpg`;
        const sourceUrl = `https://picsum.photos/seed/mochi-${book.id}-${pIdx}/800/600`;
        const pageUpload = await uploadImageFromUrl(sourceUrl, pageFileName, `Page ${pIdx + 1}`);
        pageImageUrls.push(pageUpload.url);
      }

      // 3. Insert to DB using your exact schema
      const { error: dbError } = await supabase
        .from('books')
        .insert([{
          title: book.title,
          author: book.author,
          illustrator: book.illustrator,
          description: book.description,
          cover_image_url: coverUpload.url,
          cover_image_path: coverUpload.path,
          language: book.language,
          level: book.level,
          tags: book.tags,
          pages: book.pages,
          page_images: pageImageUrls,
          is_public: true
        }]);

      if (dbError) throw dbError;

    } catch (err: any) {
      console.error(`Error seeding "${book.title}":`, err);
      const isRls = err.message?.includes('row-level security');
      onProgress({ 
        status: 'error', 
        count: i, 
        total: totalBooks, 
        message: isRls 
          ? `RLS ERROR: You need to enable INSERT policies for the 'books' table in Supabase.`
          : `Failed at "${book.title}": ${err.message}` 
      });
      return;
    }
  }

  onProgress({ status: 'success', count: totalBooks, total: totalBooks, message: 'The library is officially magical!' });
};