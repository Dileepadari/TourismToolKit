# 🌍 TourismToolKit - Multilingual Tourism Platform

> Breaking language barriers for travelers in India with AI-powered translation and cultural guidance

![TourismToolKit](https://img.shields.io/badge/Tourism-ToolKit-orange?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge)
![Languages](https://img.shields.io/badge/Languages-13+-green?style=for-the-badge)
![GraphQL](https://img.shields.io/badge/API-GraphQL-purple?style=for-the-badge)

## ✨ What is TourismToolKit?

TourismToolKit is a comprehensive multilingual platform designed to help tourists navigate India seamlessly. It combines AI-powered translation, cultural guidance, local information, and emergency assistance in one unified application.

**This project was built with determination and Copilot as a debugging companion. When AI gave up, we didn't.**

### 🎯 Key Features

- **🗣️ Real-time Translation** - 13+ Indian languages (Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Urdu, Assamese, Odia)
- **🎤 Voice Translation** - Speech-to-text and text-to-speech capabilities
- **📷 OCR Text Extraction** - Extract text from signs, menus, and documents
- **📖 Personal Dictionary** - Save and organize favorite phrases with translations
- **📍 Tourist Places** - Comprehensive database of Indian landmarks and destinations
- **🆘 Emergency Contacts** - Quick access to police, medical, fire services, and tourist helplines
- **🌏 Cultural Guide** - Essential etiquette and customs for travelers
- **🌙 Dark/Light Themes** - Beautiful India-inspired design with dual themes

---

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker & Docker Compose (v2.0+)
- 4GB+ RAM, 10GB+ disk space

### 1-Command Setup
```bash
# Clone and start everything
git clone https://github.com/dileepadari/TourismToolKit.git
cd TourismToolKit
docker compose up -d --build
```

To seed data initially use
```
RESET_DB=true docker compose up -d --build
```

**That's it!** 🎉 This automatically:
- ✅ Sets up PostgreSQL database
- ✅ Runs database migrations and seeding
- ✅ Starts backend API (GraphQL)
- ✅ Starts frontend application
- ✅ Seeds sample data for all modules

### Access Points
- **🌐 Frontend**: http://localhost:3000
- **⚡ Backend API**: http://localhost:8000
- **🔍 GraphQL Playground**: http://localhost:8000/graphql
- **📊 API Docs**: http://localhost:8000/docs

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with India-themed colors
- **Apollo Client** - GraphQL state management
- **Framer Motion** - Smooth animations
- **Next-themes** - Dark/light mode support

### Backend
- **FastAPI** - Modern Python web framework
- **Strawberry GraphQL** - Schema-first GraphQL
- **SQLModel** - Type-safe database models
- **PostgreSQL** - Robust database system
- **Alembic** - Database migrations
- **Bhashini API** - AI translation services

### DevOps
- **Docker & Docker Compose** - Containerization
- **Automated Seeding** - Sample data initialization
- **Health Checks** - Service monitoring
- **Hot Reload** - Development efficiency

---

## 📊 Sample Data Included

The application comes pre-loaded with comprehensive sample data:

### Dictionary Entries (120+)
- **Languages**: English ↔ Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Urdu, Assamese, Odia
- **Categories**: Greetings, food, directions, emergency terms, numbers, travel vocabulary

### Tourist Places (20+)
- **Destinations**: Taj Mahal, Golden Temple, Kerala Backwaters, Hampi, Goa Beaches
- **Details**: Images, ratings, entry fees, best visiting times, languages spoken

### Emergency Contacts (18+)
- **National**: Police (100), Medical (108), Fire (101), Tourist Helpline (1363)
- **State-specific**: Tourism offices for major states
- **Services**: Women helpline, child helpline, disaster management

### Culture Tips (26+)
- **Categories**: Greetings, food etiquette, clothing, religious customs, photography
- **Importance**: High, medium, low priority tips
- **Languages**: Available in multiple Indian languages

---

## 🧪 Test User Accounts

The system includes pre-created test accounts:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@tourismtoolkit.com | admin123 | Admin | Full access account |
| test@example.com | password123 | User | Standard test user |
| demo@tourismtoolkit.com | demo123 | Demo | Demo purposes |
| tourist@india.com | tourist123 | Tourist | Tourist-focused account |

---

## 🛠️ Development Commands

### Docker Operations
```bash
# View logs
docker compose logs -f
docker compose logs backend
docker compose logs frontend

# Restart services
docker compose restart
docker compose restart backend

# Stop everything
docker compose down

# Reset database (with fresh seeding)
RESET_DB=true docker compose up -d
```

### Database Management
```bash
# Database shell
docker compose exec db psql -U tourism_user -d tourism_db

# Check seeded data
docker compose exec backend python -c "
from app.database.db import SessionLocal
from app.database.models import *
db = SessionLocal()
print(f'Dictionary: {db.query(DictionaryEntry).count()}')
print(f'Places: {db.query(Place).count()}')
print(f'Emergency: {db.query(EmergencyContact).count()}')
print(f'Culture: {db.query(CultureTip).count()}')
db.close()
"

# Re-seed data
docker compose exec backend python -c "
from app.database.seed_data import seed_all
seed_all()
"
```

### Manual Development Setup
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend setup
cd frontend
npm install
npm run dev
```

---

## 🌐 Multilingual Support

### Supported Languages (13+)
| Language | Code | Native Name | Script |
|----------|------|-------------|--------|
| English | en | English | Latin |
| Hindi | hi | हिन्दी | Devanagari |
| Telugu | te | తెలుగు | Telugu |
| Tamil | ta | தமிழ் | Tamil |
| Kannada | kn | ಕನ್ನಡ | Kannada |
| Malayalam | ml | മലയാളം | Malayalam |
| Bengali | bn | বাংলা | Bengali |
| Gujarati | gu | ગુજરાતી | Gujarati |
| Marathi | mr | मराठी | Devanagari |
| Punjabi | pa | ਪੰਜਾਬੀ | Gurmukhi |
| Urdu | ur | اردو | Arabic/Nastaliq |
| Assamese | as | অসমীয়া | Bengali-Assamese |
| Odia | or | ଓଡ଼ିଆ | Odia |

### Translation Features
- **Real-time switching** - Instant language change without reload
- **Native scripts** - Languages displayed in authentic writing systems
- **Persistent selection** - Language choice saved across sessions
- **Type-safe** - TypeScript ensures translation completeness
- **Fallback system** - Graceful fallback to English if translation missing

---

## 🚨 Troubleshooting

### Common Issues

**1. Services won't start**
```bash
# Check if ports are busy
lsof -i :3000 :8000 :5432
# Stop conflicting services
pm2 stop all
```

**2. Database connection error**
```bash
# Check database status
docker compose ps db
docker compose logs db
```

**3. Reset everything**
```bash
# Complete reset
docker compose down -v
RESET_DB=true docker compose up -d --build
```

**4. Frontend build issues**
```bash
# Clear cache and rebuild
cd frontend
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

---

## 📚 API Documentation

### GraphQL Queries
```graphql
# Get tourist places
query {
  getPlaces(country: "India", limit: 10) {
    id name description city state rating
  }
}

# Search dictionary
query {
  searchDictionary(query: "Hello", languageFrom: "en", languageTo: "hi") {
    id word translation pronunciation
  }
}

# Get emergency contacts
query {
  getEmergencyContacts(country: "India") {
    serviceType number description
  }
}
```

### GraphQL Mutations
```graphql
# Translate text
mutation {
  translateText(input: {
    text: "Hello"
    sourceLang: "en"
    targetLang: "hi"
  }) {
    translatedText success
  }
}

# User authentication
mutation {
  login(input: {
    email: "test@example.com"
    password: "password123"
  }) {
    token user { id username }
  }
}
```

For complete API documentation, visit http://localhost:8000/graphql

---

## 🎨 Design System

### India-Themed Color Palette
- **🧡 Saffron**: `#f97316` - Primary actions, highlights
- **💚 Heritage**: `#22c55e` - Success, nature elements
- **💙 Royal**: `#3b82f6` - Information, trust
- **💛 Golden**: `#f59e0b` - Accent, warmth

### Themes
- **Light Mode**: Clean, bright India-inspired design
- **Dark Mode**: Rich, elegant dark theme with proper contrast
- **System**: Automatically follows OS preference

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **TypeScript**: Full type safety required
- **Testing**: Add tests for new features
- **Documentation**: Update docs for API changes
- **Formatting**: Use ESLint/Prettier configurations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Bhashini](https://bhashini.gov.in/)** - AI translation services
- **[Canvas IIIT](https://canvas.iiit.ac.in/)** - OCR services
- **[IIIT Hyderabad](https://www.iiit.ac.in/)** - Infrastructure support
- **GitHub Copilot** - AI development assistant
- **Open Source Community** - Framework and library authors

---

## 📧 Support & Contact

### Getting Help
- **Documentation**: Check `DEVELOPMENT.md` for detailed development guide
- **GraphQL Playground**: http://localhost:8000/graphql for API testing
- **Issues**: Create GitHub issues for bug reports or feature requests

### Project Stats
- **Languages**: 13+ Indian languages supported
- **API Endpoints**: 50+ GraphQL queries and mutations
- **Database Tables**: 6 main entities with relationships
- **Seeded Data**: 180+ records across all modules
- **Docker Services**: 3 containers (database, backend, frontend)

---

## 🗺️ Roadmap

### Current (v1.0)
- ✅ Multilingual translation with 13+ languages
- ✅ Voice translation capabilities
- ✅ OCR text extraction
- ✅ Personal dictionary management
- ✅ Tourist places database
- ✅ Emergency contacts and cultural tips
- ✅ Docker deployment with seeding
- ✅ Dark/light theme support

### Planned (v2.0)
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] AR translation features
- [ ] Real-time conversation translation
- [ ] Travel itinerary planner
- [ ] Currency converter
- [ ] Community features
- [ ] Advanced AI recommendations

---

**Made with ❤️ for travelers exploring India**

*"When AI gave up on this project, we didn't."*

---

**Happy Traveling! 🇮🇳**