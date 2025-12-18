
import { MOCK_BOOKS } from '../constants';
import { supabase, uploadImageFromUrl, uploadImageFromBase64 } from './supabase';

/**
 * Tests if the storage bucket 'images' is accessible by performing a tiny test upload.
 */
export const testUploadFunctionality = async (): Promise<boolean> => {
  try {
    const testBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const fileName = `test/connection-test-${Date.now()}.png`;
    await uploadImageFromBase64(testBase64, fileName);
    console.log("Storage connection test: SUCCESS");
    return true;
  } catch (err) {
    console.error("Storage connection test: FAILED", err);
    return false;
  }
};

/**
 * Seeds the library with 10 books, including uploading their assets to Supabase Storage.
 */
export const seedLibrary = async () => {
  console.log('Initiating library seed...');
  
  // 1. Test upload first as requested
  const canUpload = await testUploadFunctionality();
  if (!canUpload) {
    throw new Error("Cannot proceed with seeding: Storage upload test failed. Check if 'images' bucket exists and has public access.");
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[]
  };

  // 2. Iterate through all 10 books in MOCK_BOOKS
  for (const book of MOCK_BOOKS) {
    try {
      console.log(`Seeding: ${book.title}...`);
      
      // Upload Cover
      const coverFileName = `library/${book.id}/cover.jpg`;
      const coverUpload = await uploadImageFromUrl(book.coverImage, coverFileName);

      // Upload Page Placeholders
      const pageImageUrls: string[] = [];
      const pageImagePaths: string[] = [];

      for (let i = 0; i < book.pages.length; i++) {
        const pageFileName = `library/${book.id}/page-${i}.jpg`;
        const sourceUrl = `https://picsum.photos/seed/mochi-${book.id}-${i}/800/600`;
        const pageUpload = await uploadImageFromUrl(sourceUrl, pageFileName);
        pageImageUrls.push(pageUpload.url);
        pageImagePaths.push(pageUpload.path);
      }

      // 3. Insert into DB
      const { error } = await supabase
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

      if (error) throw error;
      
      results.success++;
      console.log(`Finished: ${book.title}`);
    } catch (err) {
      results.failed++;
      results.errors.push(err);
      console.error(`Failed to seed "${book.title}":`, err);
    }
  }

  console.log('Seed process completed.', results);
  return results;
};
