import { gql } from '@apollo/client';

// Authentication Mutations
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
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

export const GET_PLACE_BY_ID_QUERY = gql`
  query GetPlaceById($placeId: Int!) {
    getPlaceById(placeId: $placeId) {
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
  query GetUserDictionary($languageFrom: String, $languageTo: String) {
    getUserDictionary(languageFrom: $languageFrom, languageTo: $languageTo) {
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
  query GetTravelHistory {
    getTravelHistory {
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
  mutation AddTravelHistory($input: TravelHistoryInput!) {
    addTravelHistory(input: $input) {
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

// User Preferences
export const UPDATE_USER_PREFERENCES_MUTATION = gql`
  mutation UpdateUserPreferences($preferredLanguage: String, $preferredTheme: String) {
    updateUserPreferences(preferredLanguage: $preferredLanguage, preferredTheme: $preferredTheme) {
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
    $isFavorite: Boolean
    $limit: Int
  ) {
    getDictionaryEntries(
      languageFrom: $languageFrom
      languageTo: $languageTo
      searchWord: $searchWord
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
  ) {
    searchDictionary(
      query: $query
      languageFrom: $languageFrom
      languageTo: $languageTo
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
  mutation AddDictionaryEntry($input: DictionaryInput!) {
    addDictionaryEntry(input: $input) {
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
  mutation UpdateDictionaryEntry($entryId: Int!, $input: DictionaryInput!) {
    updateDictionaryEntry(entryId: $entryId, input: $input) {
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
  mutation DeleteDictionaryEntry($entryId: Int!) {
    deleteDictionaryEntry(entryId: $entryId) {
      success
      message
    }
  }
`;

export const TOGGLE_FAVORITE_ENTRY = gql`
  mutation ToggleFavoriteEntry($entryId: Int!) {
    toggleFavoriteEntry(entryId: $entryId) {
      success
      message
      entry {
        id
        isFavorite
      }
    }
  }
`;

// Session - tokens live in HttpOnly cookies, so these carry no credential.
export const ME_QUERY = gql`
  query Me {
    me {
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
`;

export const REFRESH_SESSION_MUTATION = gql`
  mutation RefreshSession {
    refreshSession {
      success
      message
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

export const LOGOUT_MUTATION = gql`
  mutation Logout($everywhere: Boolean) {
    logout(everywhere: $everywhere) {
      success
      message
      sessionsEnded
    }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

// Saved places
export const TOGGLE_FAVORITE_PLACE_MUTATION = gql`
  mutation ToggleFavoritePlace($placeId: Int!) {
    toggleFavoritePlace(placeId: $placeId) {
      success
      message
      isFavorite
    }
  }
`;

export const GET_FAVORITE_PLACE_IDS = gql`
  query GetFavoritePlaceIds {
    getFavoritePlaceIds
  }
`;

export const GET_FAVORITE_PLACES = gql`
  query GetFavoritePlaces {
    getFavoritePlaces {
      id
      name
      description
      country
      state
      city
      category
      rating
      images
    }
  }
`;

// Profile
export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($fullName: String, $homeCountry: String) {
    updateProfile(fullName: $fullName, homeCountry: $homeCountry) {
      success
      message
      user {
        id
        email
        username
        fullName
        homeCountry
        preferredLanguage
        preferredTheme
        isVerified
      }
    }
  }
`;

// Travel history
export const DELETE_TRAVEL_HISTORY_MUTATION = gql`
  mutation DeleteTravelHistory($entryId: Int!) {
    deleteTravelHistory(entryId: $entryId) {
      success
      message
    }
  }
`;

// Sessions
export const GET_ACTIVE_SESSIONS = gql`
  query GetActiveSessions {
    getActiveSessions {
      id
      userAgent
      createdAt
      expiresAt
      isCurrent
    }
  }
`;
