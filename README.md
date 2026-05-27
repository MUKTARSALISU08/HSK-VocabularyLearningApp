# HSK Vocabulary Learning App

A comprehensive, production-ready Chinese vocabulary learning application for HSK levels 1, 2, and 3. Built with modern web technologies, featuring a premium UI/UX design, complete authentication system, progress tracking, and gamification elements.

![HSK Learning App](https://img.shields.io/badge/HSK-Levels%201%2C2%2C3-blue) ![React](https://img.shields.io/badge/React-18.3.1-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.6-38B2AC)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Database Architecture](#database-architecture)
- [Authentication System](#authentication-system)
- [Lesson & Quiz System](#lesson--quiz-system)
- [Progress Tracking System](#progress-tracking-system)
- [API Structure](#api-structure)
- [Responsive Design](#responsive-design)
- [Deployment Guide](#deployment-guide)
- [Future Improvements](#future-improvements)

---

## Project Overview

The HSK Vocabulary Learning App is designed to help students learn Chinese vocabulary for HSK (Hanyu Shuiping Kaoshi) levels 1, 2, and 3. The application provides:

- **600 vocabulary words** across 3 HSK levels
- **1,200 sentence examples** for context-based learning
- **40 structured lessons** (10 for HSK1, 10 for HSK2, 20 for HSK3)
- **Interactive flashcards** with audio pronunciation
- **Multiple quiz types** for comprehensive testing
- **Progress tracking** with XP, streaks, and achievements
- **Multi-user support** with complete data isolation

### Vocabulary Content

| HSK Level | Lessons | Words per Lesson | Total Words | Sentences |
|-----------|---------|------------------|-------------|-----------|
| HSK 1 | 10 | 15 | 150 | 300 |
| HSK 2 | 10 | 15 | 150 | 300 |
| HSK 3 | 20 | 15 | 300 | 600 |
| **Total** | **40** | **-** | **600** | **1,200** |

---

## Features

### Core Features

- **User Authentication** - Complete signup, login, logout, password reset, and profile management
- **Avatar Upload** - Custom profile pictures with base64 encoding
- **Vocabulary Learning** - Interactive flashcards with Chinese characters, Pinyin, and English translations
- **Audio Pronunciation** - Text-to-speech for Chinese words and sentences
- **Multiple Quiz Types** - 6 different question types for comprehensive testing
- **Progress Tracking** - XP points, daily streaks, lesson completion, and achievements
- **Favorites System** - Save and review favorite vocabulary words
- **Statistics Dashboard** - Detailed learning analytics and progress visualization
- **Search Functionality** - Search across all vocabulary words

### Gamification

- **XP System** - Earn points for learning and quizzes
- **Daily Streaks** - Track consecutive days of study
- **Achievements** - Unlock achievements for milestones
- **Level Progression** - Progress through HSK levels
- **Daily Goals** - Set and track daily learning targets

### UI/UX Features

- **Dark/Light Theme** - Full theme support with smooth transitions
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Premium Animations** - Smooth transitions and micro-interactions
- **Accessible** - Keyboard navigation and screen reader support

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.5.3 | Type safety |
| Vite | 5.3.4 | Build tool |
| TailwindCSS | 3.4.6 | Styling |
| Wouter | 3.3.5 | Routing |
| Framer Motion | 11.3.8 | Animations |
| Recharts | 2.12.7 | Charts |
| Radix UI | - | UI components |
| Lucide React | 0.424.0 | Icons |
| React Hook Form | 7.52.1 | Form handling |
| Zod | 3.23.8 | Validation |
| Sonner | 1.5.0 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Express | 4.19.2 | Server framework |
| TypeScript | 5.5.4 | Type safety |
| Supabase | 2.45.3 | Database & Auth |
| JWT | 9.0.2 | Token authentication |
| Bcryptjs | 2.4.3 | Password hashing |
| Zod | 3.23.8 | Validation |

---

## Folder Structure

```
HSK-VocabularyLearningApp/
├── backend/                    # Backend server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   └── progress.controller.ts
│   │   ├── middleware/         # Express middleware
│   │   │   └── auth.middleware.ts
│   │   ├── routes/             # API routes
│   │   │   ├── auth.routes.ts
│   │   │   └── progress.routes.ts
│   │   ├── schemas/            # Validation schemas
│   │   │   └── auth.ts
│   │   ├── services/           # Business logic
│   │   │   ├── auth.service.ts
│   │   │   └── progress.service.ts
│   │   ├── types/              # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/              # Utilities
│   │   │   └── supabase.ts
│   │   ├── server.ts           # Main server (Supabase)
│   │   └── server-mock.ts      # Mock server (local dev)
│   ├── data/
│   │   └── users.json          # Mock user storage
│   ├── dist/                   # Compiled JavaScript
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── supabase-schema.sql     # Database schema
│
├── src/                        # Frontend source
│   ├── components/
│   │   ├── layout/
│   │   │   └── layout.tsx      # Main layout
│   │   ├── providers/
│   │   │   ├── app-provider.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── accordion.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── tooltip.tsx
│   │   └── protected-route.tsx
│   │
│   ├── contexts/
│   │   ├── auth-context.tsx    # Authentication state
│   │   └── progress-context.tsx # Progress state
│   │
│   ├── data/
│   │   ├── hsk1.ts             # HSK1 vocabulary
│   │   ├── hsk2.ts             # HSK2 vocabulary
│   │   └── hsk3.ts             # HSK3 vocabulary
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login-page.tsx
│   │   │   ├── signup-page.tsx
│   │   │   ├── forgot-password-page.tsx
│   │   │   └── reset-password-page.tsx
│   │   ├── dashboard/
│   │   │   └── dashboard.tsx
│   │   ├── lessons/
│   │   │   ├── lessons-page.tsx
│   │   │   └── lesson-detail-page.tsx
│   │   ├── quiz/
│   │   │   └── quiz-page.tsx
│   │   ├── challenge/
│   │   │   └── challenge-page.tsx
│   │   ├── stats/
│   │   │   └── stats-page.tsx
│   │   ├── favorites/
│   │   │   └── favorites-page.tsx
│   │   ├── search/
│   │   │   └── search-page.tsx
│   │   └── profile/
│   │       └── profile-page.tsx
│   │
│   ├── services/
│   │   └── api.ts              # API client
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   │
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   │
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm or npm package manager
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd HSK-VocabularyLearningApp
```

2. **Install frontend dependencies**

```bash
npm install
# or
pnpm install
```

3. **Install backend dependencies**

```bash
cd backend
npm install
cd ..
```

4. **Set up environment variables**

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

5. **Start the development servers**

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend (Mock server for local dev):**
```bash
cd backend
npx tsx src/server-mock.ts
```

6. **Open your browser**

Navigate to `http://localhost:5173`

---

## Environment Setup

### Frontend Environment

The frontend runs on Vite with the following configuration:

- **Development:** `http://localhost:5173`
- **Build:** `npm run build` → outputs to `dist/`
- **Preview:** `npm run preview`

### Backend Environment

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | Token expiration (default: 7d) | No |
| `SUPABASE_URL` | Supabase project URL | For production |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | For production |

### Mock Server vs Production Server

- **Mock Server** (`server-mock.ts`): Uses local JSON file storage, perfect for development
- **Production Server** (`server.ts`): Uses Supabase for persistent cloud storage

---

## Database Architecture

### Supabase Schema

The application uses Supabase (PostgreSQL) with the following tables:

#### Core Tables

```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
  email_verified BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Profiles table
profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  username TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_study_date TIMESTAMPTZ,
  current_level TEXT DEFAULT 'HSK 1'
)

-- Lesson Progress
lesson_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  lesson_id TEXT,
  words_learned INTEGER,
  total_words INTEGER,
  is_completed BOOLEAN,
  quiz_score INTEGER,
  last_studied TIMESTAMPTZ
)

-- Quiz History
quiz_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  lesson_id TEXT,
  score INTEGER,
  total_questions INTEGER,
  completed_at TIMESTAMPTZ
)

-- Favorite Words
favorite_words (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  chinese TEXT,
  pinyin TEXT,
  english TEXT,
  level TEXT,
  created_at TIMESTAMPTZ
)

-- Quiz Mistakes (for review)
quiz_mistakes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  lesson_id TEXT,
  word_chinese TEXT,
  your_answer TEXT,
  correct_answer TEXT,
  level TEXT,
  created_at TIMESTAMPTZ
)

-- Achievements
achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id TEXT,
  unlocked_at TIMESTAMPTZ
)

-- Daily XP Tracking
daily_xp (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE,
  xp_amount INTEGER
)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
-- Example RLS Policy
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);
```

### Local Storage (Mock Mode)

For development, the mock server uses:
- `backend/data/users.json` - User accounts and profiles
- Browser localStorage - Progress data per user (`hsk-progress-{userId}`)

---

## Authentication System

### Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Signup     │────▶│  Backend    │────▶│  Database   │
│  / Login    │     │  JWT Token  │     │  User Data  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  Frontend   │◀────│  Token      │
│  AuthContext│     │  Stored     │
└─────────────┘     └─────────────┘
```

### Features

- **JWT-based authentication** with configurable expiration
- **Password hashing** using bcrypt (12 salt rounds)
- **Remember me** functionality
- **Password reset** via email (token-based)
- **Avatar upload** with base64 encoding
- **Protected routes** - Automatic redirect to login for unauthenticated users

### Auth Context API

```typescript
const {
  user,           // Current user object
  isAuthenticated,// Boolean auth state
  isLoading,      // Loading state
  login,          // Login function
  signup,         // Signup function
  logout,         // Logout function
  forgotPassword, // Password reset request
  resetPassword,  // Reset with token
  changePassword, // Change logged-in user password
  updateUser      // Update user state
} = useAuth()
```

---

## Lesson & Quiz System

### Lesson Structure

Each lesson contains:
- **15 vocabulary words** with Chinese, Pinyin, and English
- **2 example sentences** per word (30 sentences per lesson)
- **Interactive flashcards** for learning
- **Quiz** for assessment

### Learning Flow

```
1. Select Lesson → 2. View Vocabulary → 3. Flashcard Mode
                                        ↓
6. Complete Lesson ← 5. Pass Quiz (70%+) ← 4. Take Quiz
```

### Quiz Types

| Type | Description |
|------|-------------|
| `chinese-to-english` | Match Chinese character to English meaning |
| `english-to-chinese` | Match English meaning to Chinese character |
| `pinyin-to-chinese` | Match Pinyin pronunciation to Chinese character |
| `sentence-meaning` | Understand sentence context |
| `fill-in-blank` | Complete sentences with correct word |
| `match-meaning` | Match vocabulary meanings |

### Quiz Scoring

- **+10 XP** per correct answer
- **70%+ required** to complete lesson
- **Mistakes tracked** for review
- **Instant feedback** with correct answers shown

---

## Progress Tracking System

### Progress Context API

```typescript
const {
  progress,           // User progress state
  isSyncing,          // Cloud sync status
  addXp,              // Add XP points
  updateStreak,       // Update daily streak
  completeLesson,     // Mark lesson complete
  addFavorite,        // Add word to favorites
  removeFavorite,     // Remove from favorites
  addQuizMistake,     // Track quiz mistake
  clearMistakes,      // Clear mistake history
  updateLessonProgress,// Update word progress
  markLessonComplete, // Complete with quiz score
  isFavorite,         // Check if word is favorite
  resetProgress,      // Reset all progress
  syncToCloud,        // Force cloud sync
  loadFromCloud       // Load from cloud
} = useProgress()
```

### XP System

| Action | XP Earned |
|--------|-----------|
| Learn a word | +5 XP |
| Complete lesson | +50 XP |
| Quiz correct answer | +10 XP |
| Daily goal (100 XP) | Achievement |

### Data Persistence

**User-Specific Storage:**
- Each user has isolated progress data
- LocalStorage key: `hsk-progress-{userId}`
- Cloud sync every 30 seconds
- Merge strategy for multi-device support

**Progress Data Structure:**

```typescript
interface UserProgress {
  xp: number                    // Total XP
  streak: number                // Daily streak
  lastStudyDate: string | null  // Last study date
  completedLessons: string[]    // Completed lesson IDs
  favoriteWords: FavoriteWord[] // Saved words
  quizMistakes: QuizMistake[]   // Mistakes for review
  lessonProgress: Record<string, LessonProgress>
  achievements: string[]        // Unlocked achievements
  dailyXP: Record<string, number> // XP by date
}
```

---

## API Structure

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-render-url.onrender.com/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create new account |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset with token |
| POST | `/auth/change-password` | Change password |
| GET | `/auth/profile` | Get user profile |
| POST | `/auth/avatar` | Upload avatar |

### Progress Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress` | Get user progress |
| POST | `/progress/sync` | Sync progress to cloud |
| POST | `/progress/profile` | Update profile stats |

### Favorites Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/favorites` | Get all favorites |
| POST | `/favorites` | Add favorite |
| DELETE | `/favorites/:chinese` | Remove favorite |

### Request/Response Examples

**Login:**
```typescript
// POST /api/auth/login
{
  email: "user@example.com",
  password: "password123",
  rememberMe: true
}

// Response
{
  success: true,
  message: "Login successful",
  user: {
    id: "abc123",
    email: "user@example.com",
    username: "User",
    avatarUrl: null,
    xp: 150,
    streak: 5
  },
  token: "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile Optimizations

- **Touch-friendly** buttons and interactions
- **Collapsible navigation** on mobile
- **Responsive grids** that stack on small screens
- **Optimized typography** scaling
- **Swipe gestures** for flashcards

### Theme Support

- **Light mode** - Clean, bright interface
- **Dark mode** - Easy on the eyes
- **System preference** detection
- **Smooth transitions** between themes

---

## Deployment Guide

### Deploy to Render with Supabase

#### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be set up (takes ~2 minutes)
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy the entire contents of `backend/supabase-schema.sql`
5. Paste and run the SQL to create all tables

6. Get your Supabase credentials:
   - Go to **Settings** → **API**
   - Copy `Project URL` (SUPABASE_URL)
   - Copy `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

#### Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

```
Name: hsk-backend
Region: Choose closest to your users
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

5. Add environment variables:

```
PORT=5000
JWT_SECRET=<generate-a-secure-random-string>
JWT_EXPIRES_IN=7d
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-key>
```

6. Click **Deploy Web Service**
7. Note your backend URL: `https://hsk-backend.onrender.com`

#### Step 3: Deploy Frontend to Render

1. Click **New** → **Static Site**
2. Connect the same repository
3. Configure:

```
Name: hsk-frontend
Region: Same as backend
Branch: main
Root Directory: . (leave empty or use .)
Build Command: npm install && npm run build
Publish Directory: dist
```

4. Add environment variable (if needed):

```
VITE_API_URL=https://hsk-backend.onrender.com/api
```

5. Click **Deploy Static Site**

#### Step 4: Update API URL

1. Update `src/services/api.ts` to use environment variable:

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

2. Redeploy frontend

#### Step 5: Test Your Deployment

1. Visit your frontend URL
2. Create a new account
3. Verify login works
4. Test lesson completion
5. Check that progress persists after logout/login

### Alternative: Deploy to Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables Checklist

**Backend (Render):**
- [ ] `PORT` - Server port
- [ ] `JWT_SECRET` - Secure random string
- [ ] `JWT_EXPIRES_IN` - Token expiration
- [ ] `SUPABASE_URL` - From Supabase dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase dashboard

**Frontend (Render/Vercel):**
- [ ] `VITE_API_URL` - Your backend URL

---

## Future Improvements

### Planned Features

- [ ] **Spaced Repetition System (SRS)** - Optimize review scheduling
- [ ] **Writing Practice** - Stroke order diagrams
- [ ] **Listening Comprehension** - Audio-only quizzes
- [ ] **Speaking Practice** - Voice recognition
- [ ] **HSK 4-6 Support** - Higher level vocabulary
- [ ] **Social Features** - Leaderboards, friends
- [ ] **Offline Mode** - PWA with service workers
- [ ] **Mobile App** - React Native version
- [ ] **AI Tutor** - ChatGPT integration for explanations
- [ ] **Custom Decks** - User-created vocabulary sets

### Technical Improvements

- [ ] **Unit Tests** - Jest + React Testing Library
- [ ] **E2E Tests** - Playwright/Cypress
- [ ] **CI/CD Pipeline** - GitHub Actions
- [ ] **Performance Optimization** - Code splitting, lazy loading
- [ ] **Analytics** - User behavior tracking
- [ ] **Error Monitoring** - Sentry integration

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Include steps to reproduce if it's a bug

---

## Acknowledgments

- HSK vocabulary data sourced from standardized HSK word lists
- UI components inspired by shadcn/ui
- Icons from Lucide React
- Charts powered by Recharts

---

**Built with ❤️ for Chinese language learners worldwide**
