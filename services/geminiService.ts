
import { GoogleGenAI, Type } from "@google/genai";
import { StoryGenerationResult, AppLanguage } from "../types";

// Supported languages mapping for AI prompts
const languageNames: Record<AppLanguage, string> = { 
  en: 'English', 
  ms: 'Bahasa Melayu', 
  id: 'Bahasa Indonesia',
  zh: 'Simplified Chinese (Mandarin)',
  th: 'Thai',
  ja: 'Japanese',
  ko: 'Korean',
  tl: 'Tagalog (Filipino)',
  lo: 'Lao',
  km: 'Khmer (Cambodian)',
  ar: 'Arabic',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  nl: 'Dutch',
  ru: 'Russian',
  it: 'Italian',
  pt: 'Portuguese',
  tr: 'Turkish'
};

export const generateStory = async (prompt: string, lang: AppLanguage = 'en'): Promise<StoryGenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const targetLang = languageNames[lang] || 'English';

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a children's story based on the prompt: "${prompt}". 
    The story should be written entirely in ${targetLang}.
    The story should have exactly 5 pages. Each page should have a short text (1-2 sentences) and a detailed illustration prompt in English for an image generation model.
    The tone should be positive, engaging, and suitable for kids aged 4-8.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: `Story text in ${targetLang}` },
                imagePrompt: { type: Type.STRING, description: "A detailed visual description for the illustration (written in English)" }
              },
              required: ["text", "imagePrompt"]
            }
          }
        },
        required: ["title", "pages"]
      }
    }
  });

  const result = JSON.parse(response.text || '{}') as StoryGenerationResult;
  return result;
};

export const generateIllustration = async (visualPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A vibrant, high-quality, professional children's book illustration of: ${visualPrompt}. Soft colors, whimsical style, no text in image.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3"
      }
    }
  });

  let imageUrl = '';
  if (response.candidates && response.candidates.length > 0) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  return imageUrl || 'https://picsum.photos/600/450';
};
