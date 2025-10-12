# 🛠️ TourismToolKit - Complete Setup Guide

## What is this
The project is for making tourists not feeling fear or helplessness when they have gone for a tour or for some work, they should be able to navigate and conversate easily with anyopne without language barries, so we had this project of TourismToolKit featuring FastApi, Postgresql, GraphQl, Next.js with Tailwind and the most important API's from Bhasini models, one of the best models for translation. 

This project is majorly done by people with help of copilot as their debugging companion and yes obviously we have used ai for repeating some patterns and for seeding the random data and setting up initial project, later AI gave up on the project, we did not. 

This guide covers everything you need to set up, configure, and deploy TourismToolKit from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [First-Time Setup](#first-time-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Purpose |
|----------|----------------|-------------|---------|
| Python | 3.8 | 3.11+ | Backend runtime |
| Node.js | 18.0 | 20.x LTS | Frontend runtime |
| npm/yarn | 8.0 | Latest | Package manager |
| PostgreSQL | 12.0 | 15.x | Production database |
| Git | 2.x | Latest | Version control |

### Optional Tools

- **PM2** - Process manager for production
- **Docker** - Containerization (optional)
- **ngrok** - For testing webhooks locally

### System Requirements

- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 2GB free space
- **OS**: Linux, macOS, or Windows with WSL2

---

## First-Time Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Dileepadari/TourismToolKit.git
cd TourismToolKit
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment

```bash
cd backend
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

#### 2.2 Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Dependencies installed:**
- fastapi - Web framework
- strawberry-graphql - GraphQL
- sqlalchemy - ORM
- uvicorn - ASGI server
- python-jose - JWT
- bcrypt - Password hashing
- python-multipart - File uploads
- And more...

#### 2.3 Initialize Database

Run the setup script to create tables and seed data:

```bash
python3 setup_database.py
```

This will:
1. Create all database tables
2. Seed 5 demo users (admin, test, demo, etc.)
3. Add 120 dictionary entries
4. Add 20 tourist places
5. Add 18 emergency contacts
6. Add 26 culture tips

**Output should show:**
```
==================================================================
  TOURISM TOOLKIT - FIRST TIME SETUP
==================================================================

This script will:
  1. Create all database tables
  2. Seed initial data (users, dictionary, places, guide)

⚠️  WARNING: This should only be run once during initial setup!

Do you want to continue? (yes/no): yes

==================================================================
  CREATING DATABASE TABLES
==================================================================
✓ All database tables created successfully

==================================================================
  SEEDING DATABASE
==================================================================

📦 Seeding Users...
✓ Seeded 5 users

📦 Seeding Dictionary Entries...
✓ Seeded 120 dictionary entries

📦 Seeding Tourist Places...
✓ Seeded 20 places

📦 Seeding Guide Data (Emergency Contacts & Culture Tips)...
✓ Seeded 18 emergency contacts
✓ Seeded 26 culture tips

==================================================================
  SETUP COMPLETE!
==================================================================

✓ Database setup completed successfully!
```

### Step 3: Frontend Setup

#### 3.1 Install Node Dependencies

```bash
cd ../frontend
npm install
```

**Key dependencies:**
- next - React framework
- react - UI library
- @apollo/client - GraphQL client
- tailwindcss - Styling
- framer-motion - Animations
- lucide-react - Icons
- And more...

#### 3.2 Build Assets (Optional)

```bash
npm run build
```

---

## Database Configuration

### SQLite (Development - Default)

TourismToolKit uses SQLite by default for development. No additional configuration needed!

**Location**: `backend/tourism.db`

### PostgreSQL (Production)

#### 1. Install PostgreSQL

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**On macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**On Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### 2. Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE tourism_db;
CREATE USER tourism_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE tourism_db TO tourism_user;
\q
```

#### 3. Update Database Configuration

Edit `backend/app/config.py`:

```python
# For PostgreSQL
DATABASE_URL = "postgresql://tourism_user:your_password_here@localhost:5432/tourism_db"

# For SQLite (development)
DATABASE_URL = "sqlite:///./tourism.db"
```

#### 4. Run Migrations

```bash
cd backend
source venv/bin/activate
python3 setup_database.py
```

---

## Environment Variables

### Backend Environment (.env)

Create `backend/.env`:

```bash
# Application
APP_NAME=TourismToolKit
DEBUG=True
PORT=8000

# Database
DATABASE_URL=sqlite:///./tourism.db
# DATABASE_URL=postgresql://tourism_user:password@localhost:5432/tourism_db

# JWT Authentication
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# Bhashini API (Optional - for translation services)
BHASHINI_USER_ID=your_user_id_here
BHASHINI_API_KEY=your_api_key_here
BHASHINI_PIPELINE_ID=your_pipeline_id_here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=INFO
```

### Frontend Environment (.env.local)

Create `frontend/.env.local`:

```bash
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql

# App Configuration
NEXT_PUBLIC_APP_NAME=TourismToolKit
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (Optional)
# NEXT_PUBLIC_GA_ID=your_ga_id
```

### Generating Secret Keys

```bash
# Generate a secure secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Running the Application

### Development Mode

#### Option 1: Manual Start (Recommended for development)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python3 -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Option 2: Using start.sh Script

```bash
# Make executable
chmod +x start.sh

# Run
./start.sh
```

#### Option 3: Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Monitor
pm2 monit

# Stop all
pm2 stop all

# Restart
pm2 restart all
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000 | REST API |
| GraphQL Playground | http://localhost:8000/graphql | Interactive GraphQL IDE |
| API Docs | http://localhost:8000/docs | Swagger documentation |

---

## Deployment

### Production Checklist

- [ ] Change `DEBUG=False` in backend config
- [ ] Use strong `SECRET_KEY`
- [ ] Configure PostgreSQL database
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Deploy with PM2 (Production)

#### 1. Configure PM2

The `ecosystem.config.js` is already set up:

```javascript
module.exports = {
  apps: [
    {
      name: 'tourism-backend',
      cwd: './backend',
      script: 'venv/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PYTHONPATH: '.',
      },
    },
    {
      name: 'tourism-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
    }
  ]
};
```

#### 2. Build Frontend

```bash
cd frontend
npm run build
```

#### 3. Start PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable auto-start on system boot
```

#### 4. Monitor

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# Monitor CPU/Memory
pm2 monit

# Restart if needed
pm2 restart all
```

### Deploy with Docker

#### 1. Create Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Create Dockerfile (Frontend)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

#### 3. Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://tourism_user:password@db:5432/tourism_db
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=tourism_db
      - POSTGRES_USER=tourism_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 4. Run

```bash
docker-compose up -d
```

### Deploy to Cloud

#### Vercel (Frontend)

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

#### Railway/Render (Backend)

1. Create account on Railway/Render
2. Connect GitHub repository
3. Configure environment variables
4. Deploy

---

## Troubleshooting

### Common Issues

#### Backend won't start

**Error: `ModuleNotFoundError`**
```bash
# Solution: Activate virtual environment
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Error: `Database connection failed`**
```bash
# Solution: Check database configuration
# For SQLite: Ensure backend/tourism.db exists
# For PostgreSQL: Check credentials in config.py
```

#### Frontend won't start

**Error: `Module not found`**
```bash
# Solution: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: `Port 3000 already in use`**
```bash
# Solution: Kill process or use different port
# Kill process:
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 npm run dev
```

#### GraphQL errors

**Error: `Cannot query field`**
- Check GraphQL schema matches frontend queries
- Restart backend after schema changes
- Clear Apollo Client cache

**Error: `Authentication failed`**
- Check JWT token is being sent in headers
- Verify token hasn't expired
- Check SECRET_KEY matches between requests

#### Database issues

**Error: `Table doesn't exist`**
```bash
# Solution: Run setup script
cd backend
python3 setup_database.py
```

**Error: `Permission denied`**
```bash
# For SQLite:
chmod 666 tourism.db

# For PostgreSQL:
# Check user permissions in database
```

### Logs

#### View Backend Logs

```bash
# PM2
pm2 logs tourism-backend

# Manual
# Logs are in backend/logs/
tail -f backend/logs/backend-out-0.log
```

#### View Frontend Logs

```bash
# PM2
pm2 logs tourism-frontend

# Manual
# Check console in browser
# Or frontend/logs/
```

### Reset Database

```bash
cd backend
source venv/bin/activate

# Delete database
rm tourism.db  # For SQLite

# Re-run setup
python3 setup_database.py
```

### Performance Optimization

#### Backend

1. **Enable production mode**:
```python
# config.py
DEBUG = False
```

2. **Use PostgreSQL** instead of SQLite

3. **Add caching**:
```bash
pip install redis
# Configure Redis caching
```

#### Frontend

1. **Build for production**:
```bash
npm run build
npm start
```

2. **Enable compression**:
```javascript
// next.config.ts
module.exports = {
  compress: true
}
```

3. **Image optimization**: Already enabled with Next.js Image component

---

## Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest

# With coverage
pytest --cov=app tests/
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# E2E tests
npm run test:e2e
```

### Manual Testing

1. **Authentication Flow**:
   - Register new user
   - Login
   - Access protected routes
   - Logout

2. **Translation**:
   - Test text translation
   - Test voice input/output
   - Test OCR

3. **Dictionary**:
   - Add entries
   - Search
   - Toggle favorites
   - Auto-translate

4. **Places**:
   - Browse destinations
   - Filter by category
   - View details

5. **Guide**:
   - View emergency contacts
   - Browse culture tips
   - Filter by category

---

## Additional Resources

- **Main README**: [README.md](./README.md)
- **API Documentation**: [API.md](./API.md)
- **GraphQL Playground**: http://localhost:8000/graphql
- **Swagger Docs**: http://localhost:8000/docs

---

## Support

If you encounter issues not covered in this guide:

1. Check existing [GitHub Issues](https://github.com/yourusername/TourismToolKit/issues)
2. Search [Discussions](https://github.com/yourusername/TourismToolKit/discussions)
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Logs

---

**Happy Coding! 🇮🇳**
