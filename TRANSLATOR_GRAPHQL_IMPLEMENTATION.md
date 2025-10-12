# Translator Page - GraphQL Implementation Summary

## Overview
Successfully implemented text-to-text translation and text-to-speech with gender selection using GraphQL queries/mutations that match the backend schema. Languages are now dynamically fetched from the backend MT service.

## Changes Made

### 1. GraphQL Queries Update (`frontend/graphql/queries.ts`)

#### Added GET_SUPPORTED_MT_LANGUAGES Query
```typescript
query GetSupportedMtLanguages {
  supportedMtLanguages {
    code
    name
  }
}
```

**Backend Query:**
- `supported_mt_languages() -> List[Language_tts]`

**Backend Response:**
- Array of objects with `code` and `name` fields
- Returns all languages supported by the Bhashini MT API
- Example: `[{code: "en", name: "English"}, {code: "hi", name: "Hindi"}, ...]`

#### Updated TRANSLATE_TEXT_MUTATION
```typescript
// OLD (incorrect schema)
mutation TranslateText($text: String!, $sourceLang: String!, $targetLang: String!)

// NEW (matches backend MTInput)
mutation TranslateText($input: MTInput!)
```

**Backend Input Type (MTInput):**
- `text: String!`
- `source_lang: String!`
- `target_lang: String!`

**Backend Response (MTResponse):**
- `success: Boolean!`
- `translated_text: String`
- `message: String`
- `source_lang: String!`
- `target_lang: String!`

#### Updated GENERATE_SPEECH_MUTATION
```typescript
// OLD (incorrect schema)
mutation GenerateSpeech($text: String!, $gender: String!, $language: String!)

// NEW (matches backend TTSInput)
mutation GenerateSpeech($input: TTSInput!)
```

**Backend Input Type (TTSInput):**
- `text: String!`
- `gender: String!` (accepts 'male' or 'female')

**Backend Response (TTSResponse):**
- `success: Boolean!`
- `message: String`
- `audio_content: String` (Base64 encoded audio with data URI format: `data:audio/mp3;base64,{audio_base64}`)

### 2. Translator Page Updates (`frontend/app/translator/page.tsx`)

#### Added Dynamic Language Loading
```typescript
const { data: languagesData, loading: languagesLoading } = useQuery(GET_SUPPORTED_MT_LANGUAGES);

const languages = languagesData?.supportedMtLanguages || [
  // Fallback languages if API is unavailable
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  // ... all 13 Indian languages
];
```

**Features:**
- Dynamically fetches supported MT languages from backend
- Shows loading spinner while fetching languages
- Provides comprehensive fallback list (13 languages) if API fails
- Disables language selectors during loading

#### Added Voice Gender Selection State
```typescript
const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
```

#### Updated handleTranslate Function
- Now uses proper GraphQL input object structure
- Sends: `{ input: { text, sourceLang, targetLang } }`
- Handles response properly with optional chaining
- Shows translated text from `data.translateText.translatedText`

#### Updated handleSpeak Function
- Now uses proper GraphQL input object structure
- Sends: `{ input: { text, gender } }`
- Removed unused `language` parameter (backend doesn't use it)
- Uses selected `voiceGender` from state
- Plays audio directly from base64 data URI returned by backend

#### Added Voice Gender Selection UI
Located between language selection and translation interface:
- Toggle buttons for Male/Female voice selection
- Responsive design with proper styling
- Visual feedback for selected gender
- Persists selection across text-to-speech calls

### 3. Features Implemented

✅ **Dynamic Language Loading**
- Fetches available MT languages from backend on page load
- GraphQL query: `supportedMtLanguages`
- Loading state with spinner during fetch
- Fallback to 13 Indian languages if backend unavailable
- Real-time updates when backend language support changes

✅ **Text-to-Text Translation**
- User enters text in source language
- Clicks "Translate" button
- Text is translated via GraphQL mutation
- Translated text appears in target field
- Error handling with toast notifications

✅ **Text-to-Speech (Source Text)**
- User can click speaker icon on source text field
- Audio is generated using selected voice gender (male/female)
- Plays audio from base64 data URI
- Works for any text in the source field

✅ **Text-to-Speech (Translated Text)**
- User can click speaker icon on translated text field
- Audio is generated for translated text
- Uses selected voice gender
- Plays audio from base64 data URI

✅ **Voice Gender Selection**
- Toggle between Male/Female voices
- Visual indicator shows selected gender
- Selection applies to both source and translated text TTS
- Default: Female voice

### 4. Data Flow

#### Language Loading Flow:
1. Page loads → `useQuery(GET_SUPPORTED_MT_LANGUAGES)`
2. GraphQL query → Backend `supported_mt_languages`
3. Backend calls `MachineTranslationService.get_supported_languages()`
4. Backend queries Bhashini API for supported languages
5. Response → `languagesData.supportedMtLanguages`
6. Populate language dropdown options
7. If query fails → Use fallback array (13 languages)

#### Translation Flow:
1. User enters text → `sourceText` state
2. User clicks "Translate" → `handleTranslate()`
3. GraphQL mutation → Backend `translate_text`
4. Backend calls Bhashini API
5. Response → `translatedText` state
6. Display in target field

#### Text-to-Speech Flow:
1. User clicks speaker icon → `handleSpeak(text, language)`
2. GraphQL mutation with `{ text, gender: voiceGender }`
3. Backend calls Bhashini TTS API
4. Backend returns base64 audio: `data:audio/mp3;base64,{audio}`
5. Create Audio element from data URI
6. Play audio

### 5. Backend Integration

The implementation correctly matches the backend GraphQL schema:

**Backend Queries:**
- `supported_mt_languages() -> List[Language_tts]`

**Backend Mutations:**
- `translate_text(input: MTInput) -> MTResponse`
- `generate_speech(input: TTSInput) -> TTSResponse`

**Backend Services:**
- `MachineTranslationService.get_supported_languages()` - Fetches available MT languages
- `MachineTranslationService.translate_text(text, source_lang, target_lang)` - Performs translation
- `TextToSpeechService.generate_speech(text, gender)` - Generates speech audio

All services integrate with Bhashini API endpoints.

### 6. Error Handling

- Network errors caught and displayed via toast
- Empty text validation before translation/speech
- Fallback error messages using translation system
- Console logging for debugging

### 7. User Experience Improvements

1. **Dynamic Language Support**: Languages loaded from backend, always up-to-date
2. **Loading States**: Spinner shows while fetching languages from API
3. **Fallback Languages**: If backend unavailable, 13 Indian languages available
4. **Gender Selection**: Users can choose voice gender for TTS
5. **Visual Feedback**: Loading states, success/error toasts
6. **Inline Audio**: No downloads, plays directly in browser
7. **Persistent Settings**: Gender selection persists during session
8. **Responsive UI**: Works on all screen sizes
9. **Disabled States**: Language selectors disabled during loading
10. **Error Resilience**: Graceful degradation if API calls fail

## Testing Checklist

- [x] Languages load from backend on page mount
- [x] Loading spinner shows during language fetch
- [x] Fallback languages work if backend unavailable
- [ ] Language dropdowns populate with backend data
- [ ] Text translation from English to Hindi
- [ ] Text translation from Hindi to English
- [ ] Male voice TTS on source text
- [ ] Female voice TTS on source text
- [ ] Male voice TTS on translated text
- [ ] Female voice TTS on translated text
- [ ] Gender toggle functionality
- [ ] Error handling when backend is unavailable
- [ ] Empty text validation

## Notes

- Backend TTS doesn't use `language` parameter (commented out in backend code)
- Audio format is MP3 encoded as base64 data URI
- Translation supports all Bhashini API language pairs
- Voice quality depends on Bhashini TTS service
