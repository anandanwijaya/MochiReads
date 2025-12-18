
export interface Book {
  id: string;
  title: string;
  author: string;
  illustrator: string;
  description: string;
  coverImage: string;
  coverImagePath?: string;
  language: string;
  level: number;
  tags: string[];
  pages: string[];
  pageImages?: string[];
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
export type LanguageFilter = 'All' | 'English' | 'Malay' | 'Indonesian';
export type ViewType = 'library' | 'creator' | 'favorites' | 'latest' | 'recommendations';
export type AppLanguage = 'en' | 'ms' | 'id';
