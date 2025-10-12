# Dynamic Language Support Implementation

## Summary

Successfully implemented dynamic language loading for the translator page using the backend GraphQL query `supportedMtLanguages`.

## What Was Changed

### 1. **GraphQL Query Added** (`frontend/graphql/queries.ts`)

```typescript
export const GET_SUPPORTED_MT_LANGUAGES = gql`
  query GetSupportedMtLanguages {
    supportedMtLanguages {
      code
      name
    }
  }
`;
```

This query fetches the list of languages supported by the Bhashini Machine Translation API from the backend.

### 2. **Translator Page Updated** (`frontend/app/translator/page.tsx`)

#### Import Updated
Changed from `GET_SUPPORTED_LANGUAGES` to `GET_SUPPORTED_MT_LANGUAGES`

#### Query Implementation
```typescript
const { data: languagesData, loading: languagesLoading } = useQuery(GET_SUPPORTED_MT_LANGUAGES);

const languages = languagesData?.supportedMtLanguages || [
  // 13 fallback languages for offline/error scenarios
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' }
];
```

#### Loading State UI
Added loading spinner and message while fetching languages:
```tsx
{languagesLoading ? (
  <div className="flex items-center justify-center py-8">
    <Loader className="w-6 h-6 animate-spin text-primary" />
    <span className="ml-2 text-muted-foreground">Loading languages...</span>
  </div>
) : (
  // Language selection UI
)}
```

#### Disabled States
Language dropdowns and swap button are disabled during loading:
```tsx
<select
  value={sourceLang}
  onChange={(e) => setSourceLang(e.target.value)}
  disabled={languagesLoading}
  // ... other props
>
```

## How It Works

### Backend Flow
1. **Backend Query**: `supported_mt_languages()` in `mt_queries.py`
2. **Service Call**: `MachineTranslationService.get_supported_languages()`
3. **API Integration**: Calls Bhashini API to get current language support
4. **Response Format**: Returns array of `Language_tts` objects with `code` and `name`

### Frontend Flow
1. **Page Load**: Component mounts, `useQuery` executes
2. **GraphQL Request**: Sends query to backend
3. **Loading State**: Shows spinner, disables UI elements
4. **Success**: Populates dropdowns with backend languages
5. **Error/Offline**: Falls back to hardcoded 13 languages
6. **Ready**: User can select languages and translate

## Benefits

✅ **Always Up-to-Date**: Languages reflect current Bhashini API support
✅ **Dynamic**: No need to update frontend when backend adds languages
✅ **Resilient**: Fallback ensures app works even if backend is down
✅ **Better UX**: Loading states inform users what's happening
✅ **Accurate**: Only shows languages that actually work with translation API

## Backend Schema Reference

```python
@strawberry.field
def supported_mt_languages() -> List[Language_tts]:
    """
    Get list of supported languages for Machine Translation.
    """
    languages_data = MachineTranslationService.get_supported_languages()
    
    return [
        Language_tts(code=lang["code"], name=lang["name"]) 
        for lang in languages_data.get("languages", [])
    ]
```

```python
@strawberry.type
class Language_tts:
    code: str
    name: str
```

## Testing

To test this feature:

1. **Start backend**: `pm2 restart all`
2. **Open translator page**: Navigate to `/translator`
3. **Observe loading**: Should see spinner briefly
4. **Check dropdowns**: Should be populated with languages from Bhashini
5. **Test offline**: Stop backend, verify fallback languages work
6. **Test translation**: Select languages and translate text

## Future Enhancements

- Cache language list in localStorage to reduce API calls
- Add error message if language fetch fails
- Show last updated timestamp for language list
- Filter languages by source/target compatibility
- Add language search/filter in dropdown for many languages
