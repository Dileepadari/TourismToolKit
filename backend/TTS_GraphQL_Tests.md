# TTS GraphQL Test Queries

## 🔍 QUERIES (Read Operations)

### 1. Hello World Test
```graphql
query HelloWorld {
  helloWorld
}
```

### 2. Get Supported Languages
```graphql
query GetSupportedLanguages {
  supportedLanguages {
    code
    name
  }
}
```

### 3. Get API URL for Specific Language
```graphql
query GetApiUrl($language: String!) {
  getApiUrlForLanguage(language: $language) {
    url
    language
    found
  }
}
```

**Variables for query 3:**
```json
{
  "language": "hi"
}
```

### 4. Combined Query - Get multiple data in one request
```graphql
query GetTTSInfo($language: String!) {
  helloWorld
  supportedLanguages {
    code
    name
  }
  getApiUrlForLanguage(language: $language) {
    url
    language
    found
  }
}
```

**Variables for query 4:**
```json
{
  "language": "en"
}
```

## 🚀 MUTATIONS (Write Operations)

### 1. Generate Speech - English Male
```graphql
mutation GenerateSpeech($input: TTSInput!) {
  generateSpeech(input: $input) {
    success
    message
    audioUrl
    audioContent
  }
}
```

**Variables:**
```json
{
  "input": {
    "text": "Hello, this is a test message in English",
    "gender": "male",
    "language": "en"
  }
}
```

### 2. Generate Speech - Hindi Female
```graphql
mutation GenerateHindiSpeech($input: TTSInput!) {
  generateSpeech(input: $input) {
    success
    message
    audioUrl
  }
}
```

**Variables:**
```json
{
  "input": {
    "text": "नमस्ते, यह हिंदी में एक परीक्षण संदेश है",
    "gender": "female", 
    "language": "hi"
  }
}
```

### 3. Generate Speech - Telugu
```graphql
mutation GenerateTeluguSpeech($input: TTSInput!) {
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
    "text": "హలో, ఇది తెలుగులో ఒక పరీక్ష సందేశం",
    "gender": "male",
    "language": "te"
  }
}
```

## 🎯 TESTING WORKFLOW

### Step 1: Start the server
```bash
cd backend
source venv/bin/activate  
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Access GraphQL Playground
Open: `http://localhost:8000/graphql`

### Step 3: Test Queries (Copy-paste from above)
1. Start with `HelloWorld` query
2. Test `GetSupportedLanguages` 
3. Test `GetApiUrl` with different languages
4. Test `GenerateSpeech` mutations

### Step 4: Expected Responses

**Supported Languages Response:**
```json
{
  "data": {
    "supportedLanguages": [
      { "code": "hi", "name": "Hindi" },
      { "code": "en", "name": "English" },
      { "code": "te", "name": "Telugu" }
      // ... more languages
    ]
  }
}
```

**Generate Speech Success Response:**
```json
{
  "data": {
    "generateSpeech": {
      "success": true,
      "message": "Speech generated successfully",
      "audioUrl": "data:audio/mp3;base64,UklGRnoGAABXQVZFZm10IBAAAA...",
      "audioContent": "UklGRnoGAABXQVZFZm10IBAAAA..."
    }
  }
}
```

**Generate Speech Error Response:**
```json
{
  "data": {
    "generateSpeech": {
      "success": false,
      "message": "Error generating speech: TTS API URL not configured...",
      "audioUrl": null,
      "audioContent": null
    }
  }
}
```

## 🔧 CURL Examples (for programmatic testing)

### Query via cURL:
```bash
curl -X POST \
  http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { supportedLanguages { code name } }"
  }'
```

### Mutation via cURL:
```bash
curl -X POST \
  http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($input: TTSInput!) { generateSpeech(input: $input) { success message audioUrl } }",
    "variables": {
      "input": {
        "text": "Hello World",
        "gender": "male",
        "language": "en"
      }
    }
  }'
```