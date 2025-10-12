import { gql } from '@apollo/client';

// Translation Types
export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  userId?: string;
}

export interface TranslationResponse {
  success: boolean;
  translatedText: string;
  confidence?: number;
  error?: string;
}

export interface VoiceToTextRequest {
  audioData: string; // Base64 encoded audio
  language: string;
  userId?: string;
}

export interface TextToSpeechRequest {
  text: string;
  language: string;
  voice?: string;
  speed?: number;
  userId?: string;
}

// GraphQL Mutations
export const TRANSLATE_TEXT = gql`
  mutation TranslateText($input: TranslationInput!) {
    translateText(input: $input) {
      success
      translatedText
      confidence
      error
      metadata {
        processingTime
        model
        sourceLangDetected
      }
    }
  }
`;

export const VOICE_TO_TEXT = gql`
  mutation VoiceToText($input: VoiceToTextInput!) {
    voiceToText(input: $input) {
      success
      text
      confidence
      language
      error
    }
  }
`;

export const TEXT_TO_SPEECH = gql`
  mutation TextToSpeech($input: TextToSpeechInput!) {
    textToSpeech(input: $input) {
      success
      audioUrl
      duration
      error
    }
  }
`;

export const DETECT_LANGUAGE = gql`
  mutation DetectLanguage($input: LanguageDetectionInput!) {
    detectLanguage(input: $input) {
      success
      detectedLanguage
      confidence
      possibleLanguages {
        code
        name
        confidence
      }
      error
    }
  }
`;

// GraphQL Queries
export const GET_SUPPORTED_LANGUAGES = gql`
  query GetSupportedLanguages {
    supportedLanguages {
      code
      name
      nativeName
      isRTL
      isSupported {
        translation
        voiceToText
        textToSpeech
      }
    }
  }
`;

export const GET_TRANSLATION_HISTORY = gql`
  query GetTranslationHistory($userId: String!, $limit: Int, $offset: Int) {
    translationHistory(userId: $userId, limit: $limit, offset: $offset) {
      translations {
        id
        sourceText
        translatedText
        sourceLang
        targetLang
        confidence
        createdAt
        isFavorite
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_VOICE_SETTINGS = gql`
  query GetVoiceSettings($language: String!) {
    voiceSettings(language: $language) {
      availableVoices {
        id
        name
        gender
        language
        isDefault
      }
      defaultSpeed
      supportedSpeeds
    }
  }
`;

// Utility Functions
export class TranslationService {
  static async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on script/characters
    const hindiRegex = /[\u0900-\u097F]/;
    const tamilRegex = /[\u0B80-\u0BFF]/;
    const teluguRegex = /[\u0C00-\u0C7F]/;
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    const malayalamRegex = /[\u0D00-\u0D7F]/;
    const bengaliRegex = /[\u0980-\u09FF]/;
    const gujaratiRegex = /[\u0A80-\u0AFF]/;
    const marathiRegex = /[\u0900-\u097F]/; // Same as Hindi (Devanagari)
    const urduRegex = /[\u0600-\u06FF]/;
    
    if (hindiRegex.test(text)) return 'hi';
    if (tamilRegex.test(text)) return 'ta';
    if (teluguRegex.test(text)) return 'te';
    if (kannadaRegex.test(text)) return 'kn';
    if (malayalamRegex.test(text)) return 'ml';
    if (bengaliRegex.test(text)) return 'bn';
    if (gujaratiRegex.test(text)) return 'gu';
    if (urduRegex.test(text)) return 'ur';
    
    return 'en'; // Default to English
  }

  static formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  static validateLanguageCode(code: string, supportedLanguages: any[]): boolean {
    return supportedLanguages.some(lang => lang.code === code);
  }

  static getLanguageName(code: string, supportedLanguages: any[]): string {
    const language = supportedLanguages.find(lang => lang.code === code);
    return language ? language.name : code.toUpperCase();
  }

  static isRTLLanguage(code: string): boolean {
    const rtlLanguages = ['ar', 'ur', 'fa', 'he'];
    return rtlLanguages.includes(code);
  }

  static generateTranslationId(): string {
    return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static estimateReadingTime(text: string, language: string = 'en'): number {
    // Words per minute by language (approximate)
    const wpmByLanguage: Record<string, number> = {
      en: 200, hi: 180, te: 170, ta: 170, kn: 170, 
      ml: 170, bn: 180, gu: 180, mr: 180, pa: 180, 
      ur: 180, as: 170, or: 170
    };
    
    const wordsPerMinute = wpmByLanguage[language] || 200;
    const wordCount = text.trim().split(/\s+/).length;
    
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  }

  static compressText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static validateAudioFormat(file: File): boolean {
    const supportedFormats = ['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];
    return supportedFormats.includes(file.type);
  }

  static convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Tourism-specific translation phrases
export const TOURISM_PHRASES = {
  common: [
    "Hello", "Thank you", "Please", "Excuse me", "Sorry",
    "Yes", "No", "Help", "Where is...?", "How much?"
  ],
  directions: [
    "Where is the nearest hotel?", "How do I get to the airport?",
    "Where is the bus station?", "Is this the right way?",
    "Can you show me on the map?", "How far is it?"
  ],
  accommodation: [
    "I have a reservation", "Do you have available rooms?",
    "What time is check-in?", "Where is the elevator?",
    "Can I have the Wi-Fi password?", "What time is breakfast?"
  ],
  dining: [
    "I would like to order", "What do you recommend?",
    "I'm vegetarian", "No spicy food please",
    "Can I have the bill?", "Is service charge included?"
  ],
  shopping: [
    "How much does this cost?", "Do you accept credit cards?",
    "Can I get a discount?", "Do you have this in another size?",
    "Can I return this?", "Where can I pay?"
  ],
  emergency: [
    "I need help", "Call the police", "Where is the hospital?",
    "I lost my passport", "I need a doctor", "Call an ambulance"
  ]
};