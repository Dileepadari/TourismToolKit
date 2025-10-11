# 🔧 TourismToolKit - Development Guide

Complete development setup, API documentation, and deployment guide for contributors and developers.

---

## 📋 Table of Contents

1. [Development Setup](#-development-setup)
2. [Docker Development](#-docker-development)
3. [Database Management](#-database-management)
4. [API Documentation](#-api-documentation)
5. [Testing Guide](#-testing-guide)
6. [Deployment](#-deployment)
7. [Troubleshooting](#-troubleshooting)

---

## 🔨 Development Setup

### Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Docker | 20.10+ | Containerization |
| Docker Compose | 2.0+ | Multi-container orchestration |
| Node.js | 18+ | Frontend development |
| Python | 3.12+ | Backend development |
| PostgreSQL | 15+ | Database (production) |

### Environment Configuration

#### Backend Environment (.env)
```bash
# Database
DATABASE_URL=postgresql://tourism_user:tourism_password@localhost:5432/tourism_db

# JWT Authentication
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Bhashini API Configuration
BASHINI_MT_API_URL_HI=https://dhruva-api.bhashini.gov.in/services/inference/pipeline
BASHINI_MT_API_TOKEN_HI=your-token-here
# ... (repeat for other languages: te, ta, kn, ml, bn, gu, mr, pa, ur, as, or)

# Text-to-Speech Configuration
BASHINI_TTS_API_URL_HI=https://dhruva-api.bhashini.gov.in/services/inference/pipeline
BASHINI_TTS_API_TOKEN_HI=your-token-here
# ... (repeat for other languages)

# Speech-to-Text Configuration
BASHINI_ASR_API_URL_HI=https://dhruva-api.bhashini.gov.in/services/inference/pipeline
BASHINI_ASR_API_TOKEN_HI=your-token-here
# ... (repeat for other languages)

# OCR Configuration
BASHINI_OCR_API_URL_HI=https://dhruva-api.bhashini.gov.in/services/inference/pipeline
BASHINI_OCR_API_TOKEN_HI=your-token-here
# ... (repeat for other languages)

# Development Settings
DEBUG=True
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Database Reset (for development)
RESET_DB=false
```

#### Frontend Environment (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql

# Application Configuration
NEXT_PUBLIC_APP_NAME=TourismToolKit
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Settings
NODE_ENV=development
```

### Manual Development Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database (PostgreSQL)
createdb tourism_db -U postgres

# Run migrations
alembic upgrade head

# Seed database
python -c "from app.database.seed_data import seed_all; seed_all()"

# Start development server
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

---

## 🐳 Docker Development

### Quick Start
```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Docker Services

#### PostgreSQL Database (`db`)
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Credentials**: tourism_user / tourism_password
- **Database**: tourism_db
- **Volume**: postgres_data (persistent)
- **Health Check**: pg_isready command

#### Backend API (`backend`)
- **Build**: ./backend/Dockerfile
- **Port**: 8000
- **Features**:
  - Hot reload enabled
  - Automatic database initialization
  - Health check endpoint
  - Volume mounted for development

#### Frontend (`frontend`)
- **Build**: ./frontend/Dockerfile
- **Port**: 3000
- **Features**:
  - Production build
  - Volume mounted for development
  - Health check endpoint

### Docker Commands

#### Logs and Monitoring
```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Check service health
docker compose ps
```

#### Container Management
```bash
# Restart services
docker compose restart
docker compose restart backend

# Rebuild specific service
docker compose up --build backend

# Execute commands in containers
docker compose exec backend bash
docker compose exec frontend sh
docker compose exec db psql -U tourism_user -d tourism_db
```

#### Cleanup
```bash
# Stop and remove containers
docker compose down

# Remove volumes (⚠️ deletes database data)
docker compose down -v

# Remove all Docker resources
docker system prune -a
```

---

## 🗄️ Database Management

### Database Reset and Seeding

The application includes an automated database reset feature:

#### Environment Variable Control
```bash
# Normal startup (preserve data)
RESET_DB=false docker compose up -d

# Reset and reseed database
RESET_DB=true docker compose up -d
```

#### Manual Reset Script
```bash
# Use the convenience script
./scripts/reset-db.sh
```

#### Database Schema

The application uses SQLModel for database models with the following tables:

##### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    full_name VARCHAR,
    profile_picture VARCHAR,
    preferred_language VARCHAR NOT NULL,
    preferred_theme VARCHAR NOT NULL,
    home_country VARCHAR,
    is_verified BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
```

##### Dictionary Entries Table
```sql
CREATE TABLE dictionary_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    word VARCHAR NOT NULL,
    translation VARCHAR NOT NULL,
    language_from VARCHAR NOT NULL,
    language_to VARCHAR NOT NULL,
    pronunciation VARCHAR,
    usage_example VARCHAR,
    tags VARCHAR,
    is_favorite BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
```

##### Places Table
```sql
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    country VARCHAR NOT NULL,
    state VARCHAR,
    city VARCHAR NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    category VARCHAR,
    images TEXT,
    languages_spoken TEXT,
    best_time_to_visit VARCHAR,
    entry_fee FLOAT,
    rating FLOAT,
    cultural_info TEXT,
    emergency_contacts TEXT,
    local_customs TEXT,
    created_at TIMESTAMP NOT NULL
);
```

##### Emergency Contacts Table
```sql
CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    country VARCHAR NOT NULL,
    service_type VARCHAR NOT NULL,
    number VARCHAR NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL
);
```

##### Culture Tips Table
```sql
CREATE TABLE culture_tips (
    id SERIAL PRIMARY KEY,
    country VARCHAR NOT NULL,
    tip_category VARCHAR NOT NULL,
    tip_text TEXT NOT NULL,
    language VARCHAR NOT NULL,
    importance VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

### Database Operations

#### Backup and Restore
```bash
# Create backup
docker compose exec db pg_dump -U tourism_user tourism_db > backup.sql

# Restore backup
docker compose exec -T db psql -U tourism_user tourism_db < backup.sql
```

#### Data Inspection
```bash
# Check record counts
docker compose exec backend python -c "
from sqlmodel import Session
from app.database.db import engine
from app.database.models import *

with Session(engine) as session:
    print(f'Dictionary Entries: {session.query(DictionaryEntry).count()}')
    print(f'Places: {session.query(Place).count()}')
    print(f'Emergency Contacts: {session.query(EmergencyContact).count()}')
    print(f'Culture Tips: {session.query(CultureTip).count()}')
    print(f'Users: {session.query(User).count()}')
"

# Query specific data
docker compose exec db psql -U tourism_user -d tourism_db -c "
SELECT word, translation, language_from, language_to 
FROM dictionary_entries 
LIMIT 5;
"
```

---

## 📡 API Documentation

### GraphQL API

The API is built using Strawberry GraphQL and is accessible at:
- **Endpoint**: http://localhost:8000/graphql
- **Playground**: http://localhost:8000/graphql (interactive)
- **REST Docs**: http://localhost:8000/docs (Swagger)

### Authentication

All authenticated requests require a JWT token:
```http
Authorization: Bearer <your-jwt-token>
```

### Core Queries

#### User Management
```graphql
# User registration
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

# User login
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
    }
  }
}
```

#### Translation Services
```graphql
# Get supported languages
query GetSupportedLanguages {
  supportedMtLanguages {
    code
    name
    nativeName
  }
}

# Translate text
mutation TranslateText($input: MTInput!) {
  translateText(input: $input) {
    success
    translatedText
    message
    sourceLang
    targetLang
  }
}

# Text-to-Speech
mutation GenerateSpeech($input: TTSInput!) {
  generateSpeech(input: $input) {
    success
    message
    audioContent
  }
}

# Speech-to-Text
mutation TranscribeAudio($audioData: String!, $language: String!) {
  transcribeAudio(audioData: $audioData, language: $language) {
    success
    transcribedText
    error
  }
}

# OCR Text Extraction
mutation ExtractTextFromImage($imageData: String!, $language: String!) {
  extractTextFromImage(imageData: $imageData, language: $language) {
    success
    extractedText
    error
  }
}
```

#### Dictionary Management
```graphql
# Search dictionary
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
    pronunciation
    usageExample
    languageFrom
    languageTo
    isFavorite
  }
}

# Add dictionary entry
mutation AddDictionaryEntry($userId: Int!, $input: DictionaryInput!) {
  addDictionaryEntry(userId: $userId, input: $input) {
    success
    message
    entry {
      id
      word
      translation
      pronunciation
      usageExample
    }
  }
}
```

#### Places and Tourism
```graphql
# Get places
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

#### Emergency and Cultural Information
```graphql
# Get emergency contacts
query GetEmergencyContacts($country: String!) {
  getEmergencyContacts(country: $country) {
    id
    country
    serviceType
    number
    description
  }
}

# Get culture tips
query GetCultureTips(
  $country: String!
  $category: String
  $importance: String
  $limit: Int
) {
  getCultureTips(
    country: $country
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

### API Error Handling

#### Standard Error Response
```json
{
  "errors": [
    {
      "message": "Error description",
      "locations": [{"line": 2, "column": 3}],
      "path": ["fieldName"],
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ],
  "data": null
}
```

#### Common Error Codes
| HTTP Code | GraphQL Error | Description |
|-----------|---------------|-------------|
| 400 | BAD_REQUEST | Invalid input data |
| 401 | UNAUTHENTICATED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_SERVER_ERROR | Server error |

### Rate Limiting

| Endpoint Type | Requests | Time Window |
|---------------|----------|-------------|
| Authentication | 5 | 1 minute |
| Translation | 60 | 1 minute |
| General Queries | 100 | 1 minute |

---

## 🧪 Testing Guide

### Backend Testing

#### Unit Tests
```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_translation.py

# Run with verbose output
pytest -v
```

#### Integration Tests
```bash
# Test GraphQL endpoints
pytest tests/test_graphql.py

# Test database operations
pytest tests/test_database.py

# Test authentication
pytest tests/test_auth.py
```

### Frontend Testing

#### Unit Tests
```bash
cd frontend

# Run Jest tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

#### End-to-End Tests
```bash
# Run Playwright tests
npm run test:e2e

# Run specific test
npm run test:e2e -- auth.spec.ts

# Run in headed mode
npm run test:e2e -- --headed
```

### Translation Testing

#### Language Switching Test
1. Open application in browser
2. Navigate to language selector
3. Verify all 13 languages display in native scripts
4. Switch between languages and verify:
   - Instant switching without page reload
   - All UI text translates
   - Language persists across page navigation
   - LocalStorage saves selection

#### API Testing
```bash
# Test GraphQL queries with curl
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getPlaces(country: \"India\", limit: 3) { id name description } }"}'

# Test authentication
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "{ getUserDictionary { id word translation } }"}'
```

---

## 🚀 Deployment

### Production Docker Setup

#### Environment Configuration
```bash
# Create production environment file
cp .env.example .env.prod

# Update with production values:
DEBUG=False
DATABASE_URL=postgresql://user:password@production-db:5432/tourism_db
JWT_SECRET_KEY=your-secure-production-key
CORS_ORIGINS=https://yourdomain.com
```

#### Docker Compose Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DEBUG=False
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    ports:
      - "3000:3000"

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=tourism_db
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

### Cloud Deployment

#### Deploy to Railway
1. Connect GitHub repository
2. Configure environment variables
3. Deploy backend and frontend services
4. Configure custom domains

#### Deploy to Vercel (Frontend)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

#### Deploy to Heroku (Backend)
```bash
# Create Heroku app
heroku create tourism-toolkit-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Configure environment variables
heroku config:set JWT_SECRET_KEY=your-secret-key

# Deploy
git push heroku main
```

### Production Checklist

- [ ] Update all environment variables for production
- [ ] Use strong JWT secret key
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Set up health check endpoints
- [ ] Configure auto-scaling
- [ ] Set up CI/CD pipeline

---

## 🔧 Troubleshooting

### Common Development Issues

#### Docker Issues
```bash
# Port conflicts
lsof -i :3000 :8000 :5432
kill -9 <PID>

# Container won't start
docker compose logs <service-name>
docker compose restart <service-name>

# Database connection issues
docker compose exec db pg_isready -U tourism_user
```

#### Backend Issues
```bash
# Python import errors
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Database migration issues
alembic current
alembic upgrade head

# GraphQL schema errors
python -c "from app.graphql.schema import schema; print(schema)"
```

#### Frontend Issues
```bash
# Node modules issues
cd frontend
rm -rf node_modules package-lock.json
npm install

# Next.js build issues
npm run build
rm -rf .next
npm run build

# TypeScript errors
npm run type-check
```

### Database Troubleshooting

#### Connection Issues
```bash
# Test database connection
docker compose exec backend python -c "
from app.database.db import engine
try:
    with engine.connect() as conn:
        print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"
```

#### Data Issues
```bash
# Reset database completely
docker compose down -v
RESET_DB=true docker compose up -d

# Check database logs
docker compose logs db

# Manual database reset
docker compose exec db psql -U tourism_user -d tourism_db -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
"
```

### Performance Issues

#### Backend Optimization
```bash
# Enable production mode
export DEBUG=False

# Use multiple workers
uvicorn app.main:app --workers 4

# Add caching
pip install redis
# Configure Redis in settings
```

#### Frontend Optimization
```bash
# Analyze bundle size
npm run analyze

# Enable compression
# Configure in next.config.js
module.exports = {
  compress: true,
  images: {
    domains: ['images.unsplash.com']
  }
}
```

### Logging and Debugging

#### Backend Logs
```bash
# View application logs
docker compose logs -f backend

# Python debugging
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### Frontend Logs
```bash
# Browser console logs
# Check browser developer tools

# Next.js logs
npm run dev
# Check terminal output
```

#### Database Logs
```bash
# PostgreSQL logs
docker compose logs -f db

# Query logs
docker compose exec db psql -U tourism_user -d tourism_db -c "
SET log_statement = 'all';
"
```

---

## 📚 Additional Resources

### Documentation Links
- **FastAPI**: https://fastapi.tiangolo.com/
- **Strawberry GraphQL**: https://strawberry.rocks/
- **Next.js**: https://nextjs.org/docs
- **SQLModel**: https://sqlmodel.tiangolo.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **PostgreSQL**: https://www.postgresql.org/docs/

### Development Tools
- **GraphQL Playground**: http://localhost:8000/graphql
- **Swagger Docs**: http://localhost:8000/docs
- **Database Admin**: Use pgAdmin or similar tools
- **API Testing**: Use Postman or Insomnia

### Community Resources
- **Bhashini API**: https://bhashini.gov.in/
- **Canvas IIIT OCR**: https://canvas.iiit.ac.in/
- **GitHub Repository**: Create issues for bugs and feature requests

---

**Happy Developing! 🚀**

For additional help, check the main README.md or create an issue in the repository.