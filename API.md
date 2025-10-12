# 📡 TourismToolKit - API Documentation

Complete GraphQL API reference for TourismToolKit backend services.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Translation Services](#translation-services)
4. [Dictionary Management](#dictionary-management)
5. [Places & Tourism](#places--tourism)
6. [Guide Services](#guide-services)
7. [User Management](#user-management)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

---

## Overview

### Base URLs

- **Development**: http://localhost:8000
- **GraphQL Endpoint**: http://localhost:8000/graphql
- **REST API Docs**: http://localhost:8000/docs

### Authentication

All authenticated requests require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### GraphQL Playground

Access the interactive GraphQL IDE at:
```
http://localhost:8000/graphql
```

---

## Authentication

### Register

Create a new user account.

**Mutation:**
```graphql
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
```

**Variables:**
```json
{
  "input": {
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "preferredLanguage": "en",
    "preferredTheme": "light",
    "homeCountry": "India"
  }
}
```

**Response:**
```json
{
  "data": {
    "register": {
      "success": true,
      "message": "User registered successfully",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "johndoe",
        "fullName": "John Doe",
        "preferredLanguage": "en",
        "preferredTheme": "light",
        "homeCountry": "India",
        "isVerified": false
      }
    }
  }
}
```

### Login

Authenticate an existing user.

**Mutation:**
```graphql
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
```

**Variables:**
```json
{
  "input": {
    "email": "test@example.com",
    "password": "password123"
  }
}
```

**Response:**
```json
{
  "data": {
    "login": {
      "success": true,
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 2,
        "email": "test@example.com",
        "username": "testuser",
        "fullName": "Test User",
        "preferredLanguage": "en",
        "preferredTheme": "dark",
        "homeCountry": "India",
        "isVerified": true
      }
    }
  }
}
```

---

## Translation Services

### Get Supported Languages

Retrieve list of all supported languages for translation.

**Query:**
```graphql
query GetSupportedLanguages {
  getSupportedLanguages {
    languages {
      code
      name
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "getSupportedLanguages": {
      "languages": [
        { "code": "en", "name": "English" },
        { "code": "hi", "name": "Hindi" },
        { "code": "te", "name": "Telugu" },
        { "code": "ta", "name": "Tamil" }
      ]
    }
  }
}
```

### Translate Text

Translate text between supported Indian languages.

**Mutation:**
```graphql
mutation TranslateText($input: MTInput!) {
  translateText(input: $input) {
    success
    translatedText
    message
    sourceLang
    targetLang
  }
}
```

**Variables:**
```json
{
  "input": {
    "text": "Hello, how are you?",
    "sourceLang": "en",
    "targetLang": "hi"
  }
}
```

**Response:**
```json
{
  "data": {
    "translateText": {
      "success": true,
      "translatedText": "नमस्ते, आप कैसे हैं?",
      "message": "Translation successful",
      "sourceLang": "en",
      "targetLang": "hi"
    }
  }
}
```

### Text-to-Speech (TTS)

Generate audio from text.

**Mutation:**
```graphql
mutation GenerateSpeech($input: TTSInput!) {
  generateSpeech(input: $input) {
    success
    message
    audioContent
  }
}
```

**Variables:**
```json
{
  "input": {
    "text": "नमस्ते",
    "gender": "female"
  }
}
```

**Response:**
```json
{
  "data": {
    "generateSpeech": {
      "success": true,
      "message": "Speech generated successfully",
      "audioContent": "data:audio/wav;base64,UklGRiQAAABXQVZFZm10..."
    }
  }
}
```

### Speech-to-Text (STT)

Transcribe audio to text.

**Mutation:**
```graphql
mutation TranscribeAudio($audioData: String!, $language: String!) {
  transcribeAudio(audioData: $audioData, language: $language) {
    success
    transcribedText
    error
  }
}
```

**Variables:**
```json
{
  "audioData": "base64_encoded_audio_data...",
  "language": "hi"
}
```

**Response:**
```json
{
  "data": {
    "transcribeAudio": {
      "success": true,
      "transcribedText": "नमस्ते, आप कैसे हैं?",
      "error": null
    }
  }
}
```

### OCR - Extract Text from Image

Extract text from images.

**Mutation:**
```graphql
mutation ExtractTextFromImage($imageData: String!, $language: String!) {
  extractTextFromImage(imageData: $imageData, language: $language) {
    success
    extractedText
    error
  }
}
```

**Variables:**
```json
{
  "imageData": "base64_encoded_image_data...",
  "language": "en"
}
```

**Response:**
```json
{
  "data": {
    "extractTextFromImage": {
      "success": true,
      "extractedText": "Welcome to India",
      "error": null
    }
  }
}
```

---

## Dictionary Management

### Get Dictionary Entries

Retrieve dictionary entries with optional filtering.

**Query:**
```graphql
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
```

**Variables (All Optional):**
```json
{
  "languageFrom": "en",
  "languageTo": "hi",
  "searchWord": "hello",
  "userId": 1,
  "isFavorite": true,
  "limit": 50
}
```

**Response:**
```json
{
  "data": {
    "getDictionaryEntries": [
      {
        "id": 1,
        "word": "Hello",
        "translation": "नमस्ते",
        "languageFrom": "en",
        "languageTo": "hi",
        "pronunciation": "namaste",
        "usageExample": "Hello, how are you?",
        "tags": ["greeting", "common"],
        "isFavorite": true,
        "createdAt": "2025-10-12T10:30:00Z"
      }
    ]
  }
}
```

### Add Dictionary Entry

Add a new word to personal dictionary.

**Mutation:**
```graphql
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
```

**Variables:**
```json
{
  "userId": 1,
  "input": {
    "word": "Thank you",
    "translation": "धन्यवाद",
    "languageFrom": "en",
    "languageTo": "hi",
    "pronunciation": "dhanyavaad",
    "usageExample": "Thank you for your help",
    "tags": ["gratitude", "common"],
    "isFavorite": false
  }
}
```

**Response:**
```json
{
  "data": {
    "addDictionaryEntry": {
      "success": true,
      "message": "Dictionary entry added successfully",
      "entry": {
        "id": 121,
        "word": "Thank you",
        "translation": "धन्यवाद",
        "languageFrom": "en",
        "languageTo": "hi",
        "pronunciation": "dhanyavaad",
        "usageExample": "Thank you for your help",
        "tags": ["gratitude", "common"],
        "isFavorite": false,
        "createdAt": "2025-10-12T11:00:00Z"
      }
    }
  }
}
```

### Update Dictionary Entry

Update an existing dictionary entry.

**Mutation:**
```graphql
mutation UpdateDictionaryEntry($entryId: Int!, $userId: Int!, $input: DictionaryInput!) {
  updateDictionaryEntry(entryId: $entryId, userId: $userId, input: $input) {
    success
    message
    entry {
      id
      word
      translation
      pronunciation
      usageExample
      tags
      isFavorite
    }
  }
}
```

**Variables:**
```json
{
  "entryId": 121,
  "userId": 1,
  "input": {
    "word": "Thank you very much",
    "translation": "बहुत धन्यवाद",
    "languageFrom": "en",
    "languageTo": "hi",
    "pronunciation": "bahut dhanyavaad",
    "usageExample": "Thank you very much for your kindness",
    "tags": ["gratitude", "polite"],
    "isFavorite": true
  }
}
```

### Delete Dictionary Entry

Remove an entry from personal dictionary.

**Mutation:**
```graphql
mutation DeleteDictionaryEntry($entryId: Int!, $userId: Int!) {
  deleteDictionaryEntry(entryId: $entryId, userId: $userId) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "entryId": 121,
  "userId": 1
}
```

**Response:**
```json
{
  "data": {
    "deleteDictionaryEntry": {
      "success": true,
      "message": "Dictionary entry deleted successfully"
    }
  }
}
```

### Toggle Favorite

Mark/unmark an entry as favorite.

**Mutation:**
```graphql
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
```

**Variables:**
```json
{
  "entryId": 1,
  "userId": 1
}
```

**Response:**
```json
{
  "data": {
    "toggleFavoriteEntry": {
      "success": true,
      "message": "Favorite status updated",
      "entry": {
        "id": 1,
        "isFavorite": true
      }
    }
  }
}
```

---

## Places & Tourism

### Get Places

Retrieve tourist destinations with optional filtering.

**Query:**
```graphql
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
```

**Variables:**
```json
{
  "country": "India",
  "category": "historical",
  "limit": 10
}
```

**Response:**
```json
{
  "data": {
    "getPlaces": [
      {
        "id": 1,
        "name": "Taj Mahal",
        "description": "An ivory-white marble mausoleum...",
        "country": "India",
        "state": "Uttar Pradesh",
        "city": "Agra",
        "latitude": 27.1751,
        "longitude": 78.0421,
        "category": "historical",
        "images": ["taj1.jpg", "taj2.jpg"],
        "languagesSpoken": ["Hindi", "English"],
        "bestTimeToVisit": "October to March",
        "entryFee": "₹50 (Indians), ₹1300 (Foreigners)",
        "rating": 4.9
      }
    ]
  }
}
```

---

## Guide Services

### Get Emergency Contacts

Retrieve emergency contact numbers by country.

**Query:**
```graphql
query GetEmergencyContacts($country: String!) {
  getEmergencyContacts(country: $country) {
    id
    country
    serviceType
    number
    description
  }
}
```

**Variables:**
```json
{
  "country": "India"
}
```

**Response:**
```json
{
  "data": {
    "getEmergencyContacts": [
      {
        "id": 1,
        "country": "India",
        "serviceType": "police",
        "number": "100",
        "description": "National Emergency Number for Police"
      },
      {
        "id": 2,
        "country": "India",
        "serviceType": "medical",
        "number": "108",
        "description": "Emergency Ambulance Service"
      }
    ]
  }
}
```

### Get Culture Tips

Retrieve cultural tips and etiquette for travelers.

**Query:**
```graphql
query GetCultureTips(
  $country: String!
  $language: String
  $category: String
  $importance: String
  $limit: Int
) {
  getCultureTips(
    country: $country
    language: $language
    category: $category
    importance: $importance
    limit: $limit
  ) {
    id
    country
    tipCategory
    tipText
    language
    importance
  }
}
```

**Variables:**
```json
{
  "country": "India",
  "category": "greeting",
  "importance": "high",
  "limit": 5
}
```

**Response:**
```json
{
  "data": {
    "getCultureTips": [
      {
        "id": 1,
        "country": "India",
        "tipCategory": "greeting",
        "tipText": "Use 'Namaste' with folded hands as a respectful greeting",
        "language": "en",
        "importance": "high"
      }
    ]
  }
}
```

---

## User Management

### Update User Preferences

Update user's language and theme preferences.

**Mutation:**
```graphql
mutation UpdateUserPreferences(
  $userId: Int!
  $preferredLanguage: String
  $preferredTheme: String
) {
  updateUserPreferences(
    userId: $userId
    preferredLanguage: $preferredLanguage
    preferredTheme: $preferredTheme
  ) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "userId": 1,
  "preferredLanguage": "hi",
  "preferredTheme": "dark"
}
```

**Response:**
```json
{
  "data": {
    "updateUserPreferences": {
      "success": true,
      "message": "Preferences updated successfully"
    }
  }
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "errors": [
    {
      "message": "Error description",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["fieldName"]
    }
  ],
  "data": null
}
```

### Common Error Codes

| HTTP Code | GraphQL Error | Description |
|-----------|---------------|-------------|
| 400 | `BAD_REQUEST` | Invalid input data |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

### Error Examples

**Authentication Error:**
```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**Validation Error:**
```json
{
  "errors": [
    {
      "message": "Email already exists",
      "extensions": {
        "code": "BAD_REQUEST",
        "field": "email"
      }
    }
  ]
}
```

---

## Rate Limiting

### Limits

| Endpoint Type | Requests | Time Window |
|---------------|----------|-------------|
| Authentication | 5 | 1 minute |
| Translation | 60 | 1 minute |
| General Queries | 100 | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1634567890
```

### Rate Limit Exceeded Response

```json
{
  "errors": [
    {
      "message": "Rate limit exceeded. Try again in 30 seconds.",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED",
        "retryAfter": 30
      }
    }
  ]
}
```

---

## Best Practices

### 1. Use Persisted Queries

Pre-register frequently used queries for better performance:

```javascript
const client = new ApolloClient({
  link: createPersistedQueryLink().concat(httpLink),
  cache: new InMemoryCache()
});
```

### 2. Request Only Needed Fields

```graphql
# ✅ Good - Only request what you need
query GetUser($id: Int!) {
  getUser(id: $id) {
    id
    username
    email
  }
}

# ❌ Bad - Requesting all fields
query GetUser($id: Int!) {
  getUser(id: $id) {
    id
    username
    email
    fullName
    preferredLanguage
    # ... all other fields
  }
}
```

### 3. Use Variables for Dynamic Queries

```graphql
# ✅ Good
query GetPlaces($category: String!) {
  getPlaces(category: $category) { ... }
}

# ❌ Bad - String interpolation
query GetPlaces {
  getPlaces(category: "historical") { ... }
}
```

### 4. Handle Errors Gracefully

```javascript
try {
  const { data } = await client.query({ query: GET_PLACES });
} catch (error) {
  if (error.networkError) {
    // Handle network errors
  } else if (error.graphQLErrors) {
    // Handle GraphQL errors
    error.graphQLErrors.forEach(({ message }) => {
      console.error(message);
    });
  }
}
```

### 5. Use Pagination

For large datasets, use limit and offset:

```graphql
query GetDictionaryEntries($limit: Int!, $offset: Int!) {
  getDictionaryEntries(limit: $limit, offset: $offset) {
    id
    word
    translation
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:8000/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${token}`
  }
});

// Query
const { data } = await client.query({
  query: gql`
    query GetPlaces {
      getPlaces(country: "India", limit: 10) {
        id
        name
        description
      }
    }
  `
});

// Mutation
const { data } = await client.mutate({
  mutation: gql`
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        success
        token
      }
    }
  `,
  variables: {
    input: {
      email: "test@example.com",
      password: "password123"
    }
  }
});
```

### Python

```python
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

transport = RequestsHTTPTransport(
    url='http://localhost:8000/graphql',
    headers={'Authorization': f'Bearer {token}'}
)

client = Client(transport=transport, fetch_schema_from_transport=True)

# Query
query = gql('''
    query GetPlaces {
        getPlaces(country: "India", limit: 10) {
            id
            name
            description
        }
    }
''')

result = client.execute(query)
```

### cURL

```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "query GetPlaces { getPlaces(country: \"India\", limit: 10) { id name description } }"
  }'
```

---

## Additional Resources

- **Main README**: [README.md](./README.md)
- **Setup Guide**: [SETUP.md](./SETUP.md)
- **GraphQL Playground**: http://localhost:8000/graphql
- **Swagger Docs**: http://localhost:8000/docs

---

**Need Help?** Open an issue on [GitHub](https://github.com/yourusername/TourismToolKit/issues)
