
import { MOCK_BOOKS } from '../constants';
import { supabase, uploadImageFromUrl, uploadImageFromBase64 } from './supabase';

export interface SeedProgress {
  status: 'idle' | 'testing' | 'uploading' | 'finishing' | 'error' | 'success';
  currentBook?: string;
  currentLanguage?: string;
  count: number;
  total: number;
  message: string;
}

/**
 * Checks if the storage bucket is accessible before starting bulk operations.
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
 * seedLibrary: Deploys the full 76-book collection (4 per language).
 */
export const seedLibrary = async (onProgress: (p: SeedProgress) => void) => {
  const totalBooks = MOCK_BOOKS.length;
  
  onProgress({ 
    status: 'testing', 
    count: 0, 
    total: totalBooks, 
    message: 'Initializing Global Library Seed (76 Books)...' 
  });
  
  const canUpload = await testStorage();
  if (!canUpload) {
    onProgress({ 
      status: 'error', 
      count: 0, 
      total: totalBooks, 
      message: "Storage bucket access failed. Please ensure the 'images' bucket exists and is public." 
    });
    return;
  }

  for (let i = 0; i < totalBooks; i++) {
    const book = MOCK_BOOKS[i];
    onProgress({ 
      status: 'uploading', 
      count: i + 1, 
      total: totalBooks, 
      currentBook: book.title,
      currentLanguage: book.language,
      message: `Deploying ${book.language} Story ${((i % 4) + 1)}/4: "${book.title}"` 
    });

    try {
      // Small stagger to manage API throughput
      await new Promise(resolve => setTimeout(resolve, 200));

      const timestamp = Date.now();
      
      // 1. Upload Cover via the requested uploadImage pattern
      const coverFileName = `library/${book.id}/cover-${timestamp}.jpg`;
      const coverUpload = await uploadImageFromUrl(book.coverImage, coverFileName, book.title);

      // 2. Upload Page Images (Mocking diverse illustrations for each page)
      const pageImageUrls: string[] = [];
      const pageImagePaths: string[] = [];
      
      for (let pIdx = 0; pIdx < book.pages.length; pIdx++) {
        const pageFileName = `library/${book.id}/page-${pIdx}-${timestamp}.jpg`;
        // High-quality cartoon illustration storybook keywords
        const sourceUrl = `https://loremflickr.com/800/600/cartoon,illustration,storybook,kids?lock=${book.id.length + pIdx + i + 1000}`;
        const pageUpload = await uploadImageFromUrl(sourceUrl, pageFileName, `Page ${pIdx + 1}`);
        pageImageUrls.push(pageUpload.url);
        pageImagePaths.push(pageUpload.path);
      }

      // 3. Insert Book Record to Database
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
      console.error(`Seed failure for "${book.title}":`, err);
      onProgress({ 
        status: 'error', 
        count: i, 
        total: totalBooks, 
        message: `Deployment failed at "${book.title}" (${book.language}): ${err.message}` 
      });
      return;
    }
  }

  onProgress({ 
    status: 'success', 
    count: totalBooks, 
    total: totalBooks, 
    message: `Magical deployment complete! 76 localized books are now live in the library.` 
  });
};
