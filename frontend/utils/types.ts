// Auth Types
export interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  preferredLanguage: string;
  preferredTheme: string;
  homeCountry?: string;
  isVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// GraphQL Input Types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  preferredLanguage?: string;
  preferredTheme?: string;
  homeCountry?: string;
}

// Tourism Types
export interface Place {
  id: number;
  name: string;
  description?: string;
  country: string;
  category: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  rating?: number;
}

export interface DictionaryEntry {
  id: number;
  userId: number;
  originalText: string;
  translatedText: string;
  languageFrom: string;
  languageTo: string;
  category?: string;
  createdAt: string;
}

export interface Language {
  code: string;
  name: string;
}

// API Response Types
export interface LanguagesResponse {
  languages: Language[];
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  message?: string;
}