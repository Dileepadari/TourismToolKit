# TourismToolKit - India's Premier Travel Companion

A comprehensive full-stack tourism application celebrating India's rich heritage with modern technology. Built with cutting-edge tools and inspired by India's vibrant culture, featuring a beautiful India-themed design system with Lucide React icons and responsive dark/light themes.

## Features

### India-Inspired Design System
- **Saffron Elegance**: Courage and sacrifice represented through warm orange tones (#f97316)
- **Heritage Green**: Growth and auspiciousness in deep emerald shades (#22c55e)
- **Royal Blue**: Infinity of sky and ocean in majestic blues (#3b82f6)  
- **Golden Prosperity**: Wealth and prosperity in rich golden hues (#f59e0b)
- **Cultural Patterns**: Traditional Indian design elements throughout
- **Lucide React Icons**: Consistent, modern iconography across all components
- **Responsive Design**: Beautiful on all devices from mobile to desktop

### Language & Translation
- **Multi-language Support**: 12+ Indian languages including Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia
- **Real-time Translation**: Instant text translation between supported languages
- **Voice Translation**: Speech-to-text and text-to-speech in multiple Indian languages
- **OCR Technology**: Extract and translate text from images
- **Offline Dictionary**: Personal word collections with pronunciation guides

### Places & Culture
- **Destination Discovery**: Explore India's incredible diversity
- **Cultural Tips**: Local customs, etiquette, and cultural insights
- **Heritage Information**: Rich historical context for tourist destinations
- **Best Visit Times**: Seasonal recommendations for optimal experiences
- **Local Languages**: Region-specific language information

### 👤 Smart Authentication
- **Secure JWT Authentication**: Industry-standard security with bcrypt
- **Personalized Profiles**: Customizable user preferences and settings
- **Travel History**: Track your journeys across India
- **Favorite Destinations**: Bookmark places you love
- **Unified Dashboard**: Beautiful overview of your travel activity with India-themed stats

## Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 18+
- PostgreSQL (for production)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **GraphQL Playground**: http://localhost:8000/graphql

## Technology Stack

### Frontend (Next.js)
- **Next.js 15.5.4**: React framework with App Router
- **React 18.2.0**: Modern UI library  
- **TypeScript**: Type safety and developer experience
- **TailwindCSS 4.1.14**: India-themed styling system with custom colors
- **Apollo Client 3.8.0**: GraphQL client with caching
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Consistent iconography throughout
- **React Hook Form**: Form management and validation
- **React Hot Toast**: Beautiful notification system
- **Zustand**: Lightweight state management

### Backend (FastAPI)
- **FastAPI**: Modern Python web framework
- **Strawberry GraphQL**: Type-safe GraphQL implementation
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database
- **JWT Authentication**: Secure token-based auth
- **bcrypt**: Password hashing and security
- **Uvicorn**: ASGI server for production
- **JWT**: Authentication tokens
- **Bhashini API**: AI-powered Indian language services

## Architecture & Components

### Unified Design System
- **UnifiedDashboard**: Main dashboard with India-themed stat cards and cultural insights
- **Navigation**: Consistent navigation with Lucide React icons and India-inspired gradients
- **Header**: Reusable header component with cultural pattern overlays
- **Button & Card**: Base UI components with India-themed styling
- **Common Components**: Shared components for consistency across pages

### Page Structure
```
app/
├── auth/              # Authentication pages (Login/Register)
├── dashboard/         # Main dashboard with UnifiedDashboard component
├── translator/        # Translation tools with voice and OCR
├── dictionary/        # Personal dictionary management
├── places/           # Destination discovery and cultural info
└── settings/         # User preferences and theme management
```

### State Management
- **useAuthStore**: JWT authentication and user profile management
- **LanguageProvider**: Context provider for language selection and supported languages
- **Apollo Client**: GraphQL state management and caching
- **React Context**: Client-side state management and persistence

### India-Themed Color System
```css
--saffron: #f97316      /* Courage and sacrifice */
--heritage: #22c55e     /* Growth and fertility */
--royal: #3b82f6        /* Infinite sky and ocean */
--golden: #f59e0b       /* Prosperity and brightness */
```

## Supported Languages

### Indian Languages (12+)
- **English** (en) - International communication
- **Hindi** (hi) - National language  
- **Bengali** (bn) - West Bengal, Bangladesh
- **Telugu** (te) - Andhra Pradesh, Telangana
- **Tamil** (ta) - Tamil Nadu, Sri Lanka
- **Marathi** (mr) - Maharashtra
- **Gujarati** (gu) - Gujarat
- **Kannada** (kn) - Karnataka  
- **Malayalam** (ml) - Kerala
- **Punjabi** (pa) - Punjab
- **Urdu** (ur) - Widely spoken across India
- **Odia** (or) - Odisha

## Key Features Implemented

### Complete Authentication System
- Secure JWT-based login/register
- Password hashing with bcrypt
- Protected routes with middleware
- User profile management
- Persistent authentication state

### India-Themed UI/UX
- Custom TailwindCSS color palette
- Lucide React icons throughout
- Cultural pattern overlays
- Responsive design for mobile/desktop
- Dark/light theme with cultural sensitivity

### GraphQL Integration  
- Apollo Client setup with caching
- Comprehensive queries and mutations
- Real-time data synchronization
- Error handling and loading states
- Type-safe GraphQL operations

### Unified Component Architecture
- Common Header, Navigation, Button, Card components
- Consistent India-themed styling across all pages
- Responsive mobile navigation with cultural elements
- Unified dashboard replacing duplicate implementations

## Screenshots & Demo

The application features a modern, responsive design optimized for both desktop and mobile devices, with comprehensive travel tools for exploring India.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for travelers exploring the incredible diversity of India**
