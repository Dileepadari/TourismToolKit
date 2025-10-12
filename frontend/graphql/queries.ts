import { gql } from '@apollo/client';

// Authentication Mutations
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      token
      user {
        id
        email
        username
        fullName
        preferredLanguage
        preferredTheme
        homeCountry
        isVerified
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      token
      user {
        id
        email
        username
        fullName
        preferredLanguage
        preferredTheme
        homeCountry
        isVerified
      }
    }
  }
`;

// Language & Translation
export const GET_SUPPORTED_LANGUAGES = gql`
  query GetSupportedLanguages {
    getSupportedLanguages {
      languages {
        code
        name
      }
    }
  }
`;

export const GET_SUPPORTED_MT_LANGUAGES = gql`
  query GetSupportedMtLanguages {
    supportedMtLanguages {
      code
      name
    }
  }
`;

export const TRANSLATE_TEXT_MUTATION = gql`
  mutation TranslateText($input: MTInput!) {
    translateText(input: $input) {
      success
      translatedText
      message
      sourceLang
      targetLang
    }
  }
`;

// Text-to-Speech
export const GENERATE_SPEECH_MUTATION = gql`
  mutation GenerateSpeech($input: TTSInput!) {
    generateSpeech(input: $input) {
      success
      message
      audioContent
    }
  }
`;

// OCR
export const EXTRACT_TEXT_FROM_IMAGE_MUTATION = gql`
  mutation ExtractTextFromImage($input: OCRInput!) {
    extractTextFromImage(input: $input) {
      success
      message
      extractedText
      language
      error
    }
  }
`;

// Get supported OCR languages
export const GET_SUPPORTED_OCR_LANGUAGES = gql`
  query GetSupportedOcrLanguages {
    supportedOcrLanguages {
      languages {
        code
        name
      }
    }
  }
`;

// Speech-to-Text (ASR)
export const TRANSCRIBE_AUDIO_MUTATION = gql`
  mutation TranscribeAudio($input: ASRInput!) {
    transcribeAudio(input: $input) {
      success
      message
      transcribedText
      language
      error
    }
  }
`;

// Get supported ASR languages
export const GET_SUPPORTED_ASR_LANGUAGES = gql`
  query GetSupportedAsrLanguages {
    supportedAsrLanguages {
      code
      name
    }
  }
`;

// Places & Tourism
export const GET_PLACES_QUERY = gql`
  query GetPlaces($country: String, $category: String, $limit: Int) {
    getPlaces(country: $country, category: $category, limit: $limit) {
      id
      name
      description
      country
      state
      city
      latitude
      longitude
      category
      images
      languagesSpoken
      bestTimeToVisit
      entryFee
      rating
    }
  }
`;

// Dictionary
export const GET_USER_DICTIONARY = gql`
  query GetUserDictionary($userId: Int!, $languageFrom: String, $languageTo: String) {
    getUserDictionary(userId: $userId, languageFrom: $languageFrom, languageTo: $languageTo) {
      id
      word
      translation
      languageFrom
      languageTo
      pronunciation
      usageExample
      tags
      isFavorite
      createdAt
    }
  }
`;

export const ADD_DICTIONARY_ENTRY_MUTATION = gql`
  mutation AddDictionaryEntry($userId: Int!, $input: DictionaryInput!) {
    addDictionaryEntry(userId: $userId, input: $input) {
      id
      word
      translation
      languageFrom
      languageTo
      pronunciation
      usageExample
      tags
      isFavorite
      createdAt
    }
  }
`;

// Travel History
export const GET_TRAVEL_HISTORY = gql`
  query GetTravelHistory($userId: Int!) {
    getTravelHistory(userId: $userId) {
      id
      destination
      country
      visitDate
      notes
      photos
      favoritePhrases
      createdAt
    }
  }
`;

export const ADD_TRAVEL_HISTORY_MUTATION = gql`
  mutation AddTravelHistory($userId: Int!, $input: TravelHistoryInput!) {
    addTravelHistory(userId: $userId, input: $input) {
      id
      destination
      country
      visitDate
      notes
      photos
      favoritePhrases
      createdAt
    }
  }
`;

// Emergency & Culture
export const GET_EMERGENCY_CONTACTS = gql`
  query GetEmergencyContacts($country: String!) {
    getEmergencyContacts(country: $country) {
      id
      country
      serviceType
      number
      description
    }
  }
`;

export const GET_CULTURE_TIPS = gql`
  query GetCultureTips($country: String!, $language: String) {
    getCultureTips(country: $country, language: $language) {
      id
      country
      tipCategory
      tipText
      language
    }
  }
`;

// Phrases
export const GET_EMERGENCY_PHRASES = gql`
  query GetEmergencyPhrases($language: String!) {
    getEmergencyPhrases(language: $language) {
      phrases {
        phrase
        category
      }
    }
  }
`;

export const GET_COMMON_PHRASES = gql`
  query GetCommonPhrases($language: String!) {
    getCommonPhrases(language: $language) {
      phrases {
        phrase
        category
      }
    }
  }
`;

// User Preferences
export const UPDATE_USER_PREFERENCES_MUTATION = gql`
  mutation UpdateUserPreferences($userId: Int!, $preferredLanguage: String, $preferredTheme: String) {
    updateUserPreferences(userId: $userId, preferredLanguage: $preferredLanguage, preferredTheme: $preferredTheme) {
      success
      message
    }
  }
`;

// Dictionary Queries
export const GET_DICTIONARY_ENTRIES = gql`
  query GetDictionaryEntries(
    $languageFrom: String
    $languageTo: String
    $searchWord: String
    $userId: Int
    $isFavorite: Boolean
    $limit: Int
  ) {
    getDictionaryEntries(
      languageFrom: $languageFrom
      languageTo: $languageTo
      searchWord: $searchWord
      userId: $userId
      isFavorite: $isFavorite
      limit: $limit
    ) {
      id
      word
      translation
      languageFrom
      languageTo
      pronunciation
      usageExample
      tags
      isFavorite
      createdAt
    }
  }
`;

export const SEARCH_DICTIONARY = gql`
  query SearchDictionary(
    $query: String!
    $languageFrom: String!
    $languageTo: String!
    $userId: Int
  ) {
    searchDictionary(
      query: $query
      languageFrom: $languageFrom
      languageTo: $languageTo
      userId: $userId
    ) {
      id
      word
      translation
      languageFrom
      languageTo
      pronunciation
      usageExample
      tags
      isFavorite
      createdAt
    }
  }
`;

export const GET_DICTIONARY_ENTRY = gql`
  query GetDictionaryEntry($entryId: Int!) {
    getDictionaryEntry(entryId: $entryId) {
      id
      word
      translation
      languageFrom
      languageTo
      pronunciation
      usageExample
      tags
      isFavorite
      createdAt
    }
  }
`;

// Dictionary Mutations
export const ADD_DICTIONARY_ENTRY = gql`
  mutation AddDictionaryEntry($userId: Int!, $input: DictionaryInput!) {
    addDictionaryEntry(userId: $userId, input: $input) {
      success
      message
      entry {
        id
        word
        translation
        languageFrom
        languageTo
        pronunciation
        usageExample
        tags
        isFavorite
        createdAt
      }
    }
  }
`;

export const UPDATE_DICTIONARY_ENTRY = gql`
  mutation UpdateDictionaryEntry($entryId: Int!, $userId: Int!, $input: DictionaryInput!) {
    updateDictionaryEntry(entryId: $entryId, userId: $userId, input: $input) {
      success
      message
      entry {
        id
        word
        translation
        languageFrom
        languageTo
        pronunciation
        usageExample
        tags
        isFavorite
        createdAt
      }
    }
  }
`;

export const DELETE_DICTIONARY_ENTRY = gql`
  mutation DeleteDictionaryEntry($entryId: Int!, $userId: Int!) {
    deleteDictionaryEntry(entryId: $entryId, userId: $userId) {
      success
      message
    }
  }
`;

export const TOGGLE_FAVORITE_ENTRY = gql`
  mutation ToggleFavoriteEntry($entryId: Int!, $userId: Int!) {
    toggleFavoriteEntry(entryId: $entryId, userId: $userId) {
      success
      message
      entry {
        id
        isFavorite
      }
    }
  }
`;
