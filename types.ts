
export interface Book {
  id: string;
  title: string;
  author: string;
  illustrator: string;
  description: string;
  coverImage: string;
  coverImagePath?: string;
  pdfUrl?: string; // New field for PDF download link
  language: string;
  level: number;
  tags: string[];
  pages: string[];
  pageImages?: string[];
  created_by?: string;
}

export interface ReadingProgressRecord {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  is_finished: boolean;
  last_read_at: string;
}

export interface StoryGenerationResult {
  title: string;
  pages: {
    text: string;
    imagePrompt: string;
    imageUrl?: string;
  }[];
}

export type Category = 'All' | 'Animal Stories' | 'Science' | 'Adventure' | 'Folk Tales' | 'Life Skills';
export type Level = 'All' | '1' | '2' | '3' | '4' | '5';
export type LanguageFilter = 'All' | 'English' | 'Malay' | 'Indonesian' | 'Chinese' | 'Thai' | 'Japanese' | 'Korean' | 'Tagalog' | 'Lao' | 'Khmer' | 'Arabic' | 'German' | 'French' | 'Spanish' | 'Dutch' | 'Russian' | 'Italian' | 'Portuguese' | 'Turkish' | 'Vietnamese';
export type AppLanguage = 'en' | 'ms' | 'id' | 'zh' | 'th' | 'ja' | 'ko' | 'tl' | 'lo' | 'km' | 'ar' | 'de' | 'fr' | 'es' | 'nl' | 'ru' | 'it' | 'pt' | 'tr' | 'vi';

export type ViewType = 'library' | 'creator' | 'favorites' | 'latest' | 'recommendations' | 'progress' | 'achievements' | 'my-stories';
