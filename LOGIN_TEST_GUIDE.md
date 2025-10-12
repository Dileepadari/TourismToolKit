# Login Functionality Test Guide

## ✅ Login is Working!

### Test User Credentials

```
📧 Email: test@example.com
🔑 Password: password123
👤 Username: testuser
🆔 User ID: 1
```

---

## Testing Methods

### 1. Using GraphQL API (curl)

```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: {email: \"test@example.com\", password: \"password123\"}) { success message token user { id email username fullName preferredLanguage preferredTheme } } }"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "login": {
      "success": true,
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "test@example.com",
        "username": "testuser",
        "fullName": "Test User",
        "preferredLanguage": "en",
        "preferredTheme": "light"
      }
    }
  }
}
```

---

### 2. Using Frontend (Browser)

1. Open your browser to: `http://localhost:3000/auth/login`

2. Enter credentials:
   - **Email:** test@example.com
   - **Password:** password123

3. Click "Sign In"

4. You should be redirected to `/dashboard` with a success toast

**Or use the Demo Account button:**
- Click "Use Demo Account" button
- Form will auto-fill with test credentials
- Click "Sign In"

---

### 3. Using GraphQL Playground

If you have a GraphQL client like Apollo Studio or Insomnia:

**Endpoint:** `http://localhost:8000/graphql`

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

---

## What Was Fixed

### Issue 1: Database Connection
- **Problem:** Backend was using SQLite instead of PostgreSQL
- **Solution:** Modified `backend/start-backend.sh` to load `.env` file

### Issue 2: Mock Login Implementation
- **Problem:** Login mutation in `tourism_mutations.py` was using hardcoded mock data checking for password "password" instead of "password123"
- **Solution:** Replaced mock implementation with real database authentication

---

## Authentication Flow

1. **User submits** email and password
2. **Backend** queries PostgreSQL for user by email
3. **Password verification** using bcrypt
4. **JWT token generation** if credentials are valid
5. **Response** includes:
   - Success status
   - Message
   - JWT token (valid for 30 days)
   - User object with profile data

---

## JWT Token Information

- **Algorithm:** HS256
- **Expiration:** 30 days (43200 minutes)
- **Payload includes:**
  - `sub`: User email
  - `user_id`: Database user ID
  - `exp`: Expiration timestamp

---

## Testing Invalid Credentials

**Test with wrong password:**
```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: {email: \"test@example.com\", password: \"wrongpassword\"}) { success message } }"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "login": {
      "success": false,
      "message": "Invalid email or password"
    }
  }
}
```

---

## Testing with Frontend

### Login Page Features:
- ✅ Email and password input fields
- ✅ Password visibility toggle (eye icon)
- ✅ "Demo Account" quick-fill button
- ✅ Loading state during authentication
- ✅ Error toast for invalid credentials
- ✅ Success toast and redirect on successful login
- ✅ Link to registration page
- ✅ Responsive design with animations

### After Successful Login:
- User data stored in localStorage
- JWT token stored in cookies
- Automatic redirect to `/dashboard`
- Navigation shows user info
- Protected routes become accessible

---

## Creating Additional Test Users

Run this command to create a new user:

```bash
cd backend
export $(cat .env | grep -v '^#' | xargs)
source venv/bin/activate
python -c "
from app.services.auth import AuthService

user = AuthService.create_user(
    email='newuser@example.com',
    username='newuser',
    password='password123',
    full_name='New Test User',
    preferred_language='en',
    preferred_theme='light',
    home_country='India'
)

if user:
    print(f'✅ User created: {user.email} (ID: {user.id})')
else:
    print('❌ User already exists or error occurred')
"
```

---

## Troubleshooting

### Login fails with "Invalid credentials"
1. Ensure backend is running: `pm2 status`
2. Check backend is using PostgreSQL: `pm2 logs tourism-backend | grep pg_catalog`
3. Verify user exists in database (see above command)

### JWT token not persisting
1. Check browser cookies
2. Check localStorage for `authToken`
3. Verify CORS settings allow credentials

### Backend not connecting to PostgreSQL
1. Check `.env` file exists in `backend/` directory
2. Verify `start-backend.sh` loads environment variables
3. Restart PM2: `pm2 restart tourism-backend`

---

## API Endpoints Summary

| Endpoint | Type | Purpose |
|----------|------|---------|
| `/graphql` | POST | GraphQL API endpoint |
| `login` | Mutation | Authenticate user |
| `register` | Mutation | Create new user account |

---

## Security Notes

- Passwords are hashed using **bcrypt** with auto-generated salt
- JWT tokens are signed with **HS256** algorithm
- Tokens expire after **30 days**
- User must be **active** (`is_active = true`) to login
- All database queries use **parameterized statements** (SQL injection safe)

---

## Next Steps

1. ✅ Login functionality working
2. ✅ Test user account created
3. ✅ JWT authentication implemented
4. ✅ Frontend login page functional
5. ✅ Password hashing with bcrypt
6. ✅ PostgreSQL database integration

**Ready to use!** 🎉
