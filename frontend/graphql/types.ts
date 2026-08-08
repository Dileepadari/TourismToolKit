/**
 * Result and variable types for the GraphQL operations in `queries.ts`.
 *
 * Apollo Client 4 types `data` as `unknown` unless the hook is given explicit
 * type parameters, so these are what make `data.login.success` and friends
 * checkable instead of silently `any` as they were under v3.
 *
 * These mirror `backend/schema.graphql`. A schema/document mismatch is caught by
 * the backend's `test_frontend_documents` test, which validates every document
 * here against the real schema.
 */

// --- Shared entities -------------------------------------------------------

export interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string | null;
  preferredLanguage: string;
  preferredTheme: string;
  homeCountry?: string | null;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface DictionaryEntry {
  id: number;
  word: string;
  translation: string;
  languageFrom: string;
  languageTo: string;
  pronunciation?: string | null;
  usageExample?: string | null;
  tags?: string[] | null;
  isFavorite: boolean;
  createdAt: string;
}

export interface Place {
  id: number;
  name: string;
  description?: string | null;
  country: string;
  state?: string | null;
  city: string;
  // Fetched by GET_PLACES_QUERY but previously absent here, so the coordinates
  // could not be used - which is why the directions control did nothing.
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
  images?: string[] | null;
  languagesSpoken?: string[] | null;
  bestTimeToVisit?: string | null;
  entryFee?: number | null;
  rating?: number | null;
}

export interface TravelHistory {
  id: number;
  destination: string;
  country: string;
  visitDate?: string | null;
  notes?: string | null;
  photos?: string[] | null;
  favoritePhrases?: string[] | null;
  createdAt: string;
}

export interface EmergencyContact {
  id: number;
  country?: string;
  serviceType: string;
  number: string;
  description?: string | null;
}

export interface CultureTip {
  id: number;
  country?: string;
  tipCategory: string;
  tipText: string;
  language?: string;
}

// --- Auth ------------------------------------------------------------------

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string | null;
  user?: User | null;
}

export interface LoginData {
  login: AuthResponse;
}
export interface LoginVars {
  input: { email: string; password: string };
}

export interface RegisterData {
  register: AuthResponse;
}
export interface RegisterVars {
  input: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    preferredLanguage?: string;
    preferredTheme?: string;
    homeCountry?: string;
  };
}

export interface PasswordResetData {
  requestPasswordReset: { success: boolean; message: string };
}

export interface ResetPasswordData {
  resetPassword: { success: boolean; message: string };
}

export interface FavoritePlaceData {
  toggleFavoritePlace: { success: boolean; message: string; isFavorite: boolean };
}

export interface FavoritePlaceIdsData {
  getFavoritePlaceIds: number[];
}

export interface FavoritePlacesData {
  getFavoritePlaces: Place[];
}

export interface UpdateProfileData {
  updateProfile: { success: boolean; message: string; user?: User | null };
}

export interface AddTravelHistoryData {
  // The resolver returns null when the caller is not authenticated.
  addTravelHistory: TravelHistory | null;
}

export interface DeleteTravelHistoryData {
  deleteTravelHistory: { success: boolean; message: string };
}

export interface SessionInfo {
  id: number;
  userAgent?: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface ActiveSessionsData {
  getActiveSessions: SessionInfo[];
}

export interface MeData {
  me: User | null;
}

export interface RefreshSessionData {
  refreshSession: AuthResponse;
}

export interface LogoutData {
  logout: { success: boolean; message: string; sessionsEnded: number };
}

export interface UpdateUserPreferencesData {
  updateUserPreferences: AuthResponse;
}
export interface UpdateUserPreferencesVars {
  preferredLanguage?: string;
  preferredTheme?: string;
}

// --- Languages -------------------------------------------------------------

export interface SupportedLanguagesData {
  getSupportedLanguages: { languages: Language[] };
}
export interface SupportedMtLanguagesData {
  supportedMtLanguages: Language[];
}
export interface SupportedOcrLanguagesData {
  supportedOcrLanguages: { languages: Language[] };
}
export interface SupportedAsrLanguagesData {
  supportedAsrLanguages: Language[];
}

// --- AI services -----------------------------------------------------------

export interface TranslateTextData {
  translateText: {
    success: boolean;
    translatedText?: string | null;
    message?: string | null;
    sourceLang: string;
    targetLang: string;
  };
}
export interface TranslateTextVars {
  input: { text: string; sourceLang: string; targetLang: string };
}

export interface GenerateSpeechData {
  generateSpeech: {
    success: boolean;
    message?: string | null;
    audioContent?: string | null;
  };
}
export interface GenerateSpeechVars {
  input: { text: string; gender: string };
}

export interface ExtractTextData {
  extractTextFromImage: {
    success: boolean;
    message?: string | null;
    extractedText?: string | null;
    language?: string | null;
    error?: string | null;
  };
}
export interface ExtractTextVars {
  input: { imageData: string; language?: string };
}

export interface TranscribeAudioData {
  transcribeAudio: {
    success: boolean;
    message: string;
    transcribedText?: string | null;
    language?: string | null;
    error?: string | null;
  };
}
export interface TranscribeAudioVars {
  input: { audioData: string; language?: string };
}

// --- Dictionary ------------------------------------------------------------

export interface DictionaryResponse {
  success: boolean;
  message: string;
  entry?: DictionaryEntry | null;
}

export interface DictionaryEntriesData {
  getDictionaryEntries: DictionaryEntry[];
}
export interface DictionaryEntriesVars {
  languageFrom?: string;
  languageTo?: string;
  searchWord?: string;
  isFavorite?: boolean;
  limit?: number;
}

export interface UserDictionaryData {
  getUserDictionary: DictionaryEntry[];
}
export interface UserDictionaryVars {
  languageFrom?: string;
  languageTo?: string;
}

export interface AddDictionaryEntryData {
  addDictionaryEntry: DictionaryResponse;
}
export interface UpdateDictionaryEntryData {
  updateDictionaryEntry: DictionaryResponse;
}
export interface DeleteDictionaryEntryData {
  deleteDictionaryEntry: DictionaryResponse;
}
export interface ToggleFavoriteData {
  toggleFavoriteEntry: DictionaryResponse;
}

export interface DictionaryInput {
  word: string;
  translation: string;
  languageFrom: string;
  languageTo: string;
  pronunciation?: string;
  usageExample?: string;
  tags?: string[];
  isFavorite?: boolean;
}

// --- Places, travel, guide -------------------------------------------------

export interface PlacesData {
  getPlaces: Place[];
}
export interface PlaceByIdData {
  getPlaceById: Place | null;
}

export interface PlacesVars {
  country?: string;
  category?: string;
  limit?: number;
}

export interface TravelHistoryData {
  getTravelHistory: TravelHistory[];
}
// The authenticated user is derived from the bearer token.
export type TravelHistoryVars = Record<string, never>;

export interface EmergencyContactsData {
  getEmergencyContacts: EmergencyContact[];
}
export interface CultureTipsData {
  getCultureTips: CultureTip[];
}
