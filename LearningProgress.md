# HSK Vocabulary Learning App - Learning Progress Functionality Report

## Overview
This document provides a comprehensive analysis of the learning progress functionality implemented in the HSK Vocabulary Learning App. The system is designed to track and persist user learning progress across multiple dimensions including XP, streaks, completed lessons, favorites, quiz mistakes, and study statistics.

---

## Architecture Overview

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ProgressContext (React Context)                                       │
│  ├── State Management (UserProgress interface)                        │
│  ├── Sync Logic (auto-sync every 15s)                                 │
│  └── Cloud Integration (loadFromCloud, syncToCloud)                   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ HTTP Requests (Bearer Auth)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  API Routes → Controllers → Services → Supabase Database               │
│                                                                       │
│  Routes:     /progress, /progress/sync, /favorites, /mistakes         │
│  Controller: progress.controller.ts                                    │
│  Service:    progress.service.ts                                      │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ Supabase Client (Service Role)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Tables: profiles, lesson_progress, favorite_words, daily_xp,          │
│          achievements, quiz_mistakes, study_statistics,                │
│          recently_learned, quiz_history                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Frontend - Progress Context

**File:** `src/contexts/progress-context.tsx`

#### State Structure (`UserProgress`)
| Field | Type | Description |
|-------|------|-------------|
| `xp` | number | Total experience points |
| `streak` | number | Current study streak (days) |
| `lastStudyDate` | string \| null | Last study date |
| `completedLessons` | string[] | List of completed lesson IDs |
| `favoriteWords` | FavoriteWord[] | User's favorite vocabulary words |
| `quizMistakes` | QuizMistake[] | Incorrect quiz answers |
| `lessonProgress` | Record<string, LessonProgress> | Per-lesson progress tracking |
| `achievements` | string[] | Unlocked achievement IDs |
| `dailyXP` | Record<string, number> | XP earned per date |

#### Key Functions

| Function | Purpose | Sync Behavior |
|----------|---------|---------------|
| `addXp(amount)` | Add XP to user | Syncs to cloud immediately |
| `updateStreak()` | Update study streak | Syncs to cloud immediately |
| `completeLesson(lessonId)` | Mark lesson as complete | Syncs to cloud immediately |
| `addFavorite(word)` | Add word to favorites | Syncs to cloud immediately |
| `removeFavorite(chinese)` | Remove word from favorites | Syncs to cloud immediately |
| `addQuizMistake(mistake)` | Record quiz mistake | Syncs to cloud immediately |
| `clearMistakes()` | Clear all mistakes | Syncs to cloud immediately |
| `updateLessonProgress()` | Update lesson progress | Syncs to cloud immediately |
| `markLessonComplete()` | Mark lesson complete with quiz score | Syncs to cloud immediately |
| `syncToCloud()` | Manual sync trigger | Full progress sync |
| `loadFromCloud()` | Load progress from database | Full progress fetch |

#### Sync Mechanism
- **Auto-sync**: Every 15 seconds when authenticated
- **Triggered sync**: After each progress modification
- **Initial load**: On authentication state change

---

### 2. Frontend - API Service

**File:** `src/services/api.ts`

#### API Endpoints Used

| Endpoint | Method | Controller | Purpose |
|----------|--------|------------|---------|
| `/api/progress` | GET | `getProgress` | Load full user progress |
| `/api/progress/sync` | POST | `syncProgress` | Sync progress to database |
| `/api/profile` | PUT | `updateProfile` | Update profile (XP, streak, etc.) |
| `/api/favorites` | GET | `getFavorites` | Get favorite words |
| `/api/favorites` | POST | `addFavorite` | Add favorite word |
| `/api/favorites/:chinese` | DELETE | `removeFavorite` | Remove favorite word |
| `/api/mistakes` | POST | `addMistake` | Add quiz mistake |
| `/api/mistakes` | DELETE | `clearMistakes` | Clear all mistakes |

#### Authentication
All requests include `Authorization: Bearer <token>` header with JWT token from localStorage.

---

### 3. Backend - Progress Controller

**File:** `backend/src/controllers/progress.controller.ts`

#### Controller Methods

| Method | Route | Authentication |
|--------|-------|----------------|
| `getProgress` | GET /progress | Required |
| `syncProgress` | POST /progress/sync | Required |
| `getLessonProgress` | GET /progress/lessons | Required |
| `saveLessonProgress` | POST /progress/lessons | Required |
| `getFavorites` | GET /favorites | Required |
| `addFavorite` | POST /favorites | Required |
| `removeFavorite` | DELETE /favorites/:chinese | Required |
| `getQuizHistory` | GET /quiz-history | Required |
| `saveQuizHistory` | POST /quiz-history | Required |
| `getAchievements` | GET /achievements | Required |
| `addAchievement` | POST /achievements | Required |
| `getStatistics` | GET /statistics | Required |
| `updateStatistics` | POST /statistics | Required |
| `getMistakes` | GET /mistakes | Required |
| `addMistake` | POST /mistakes | Required |
| `getRecentlyLearned` | GET /recently-learned | Required |
| `addRecentlyLearned` | POST /recently-learned | Required |
| `updateProfile` | PUT /profile | Required |

---

### 4. Backend - Progress Service

**File:** `backend/src/services/progress.service.ts`

#### Service Methods

| Method | Database Table | Operations |
|--------|---------------|------------|
| `saveLessonProgress` | lesson_progress | UPSERT |
| `getLessonProgress` | lesson_progress | SELECT |
| `saveQuizHistory` | quiz_history | INSERT |
| `getQuizHistory` | quiz_history | SELECT |
| `addFavoriteWord` | favorite_words | INSERT |
| `removeFavoriteWord` | favorite_words | DELETE |
| `getFavoriteWords` | favorite_words | SELECT |
| `addAchievement` | achievements | INSERT |
| `getAchievements` | achievements | SELECT |
| `updateStudyStatistics` | study_statistics | UPSERT |
| `getStudyStatistics` | study_statistics | SELECT |
| `addQuizMistake` | quiz_mistakes | INSERT |
| `getQuizMistakes` | quiz_mistakes | SELECT |
| `removeQuizMistake` | quiz_mistakes | DELETE |
| `addRecentlyLearned` | recently_learned | INSERT |
| `getRecentlyLearned` | recently_learned | SELECT |
| `updateProfile` | profiles | UPDATE/INSERT |
| `getProfile` | profiles | SELECT |
| `saveDailyXP` | daily_xp | UPSERT |
| `getDailyXP` | daily_xp | SELECT |
| `syncProgress` | multiple tables | Composite operation |
| `getFullProgress` | multiple tables | Parallel queries |

#### Key Implementation Details

**syncProgress Method:**
```typescript
async syncProgress(userId, progress) {
  // 1. Update profile (XP, streak, last_study_date)
  // 2. Save completed lessons
  // 3. Save detailed lesson progress
  // 4. Add achievements
  // 5. Save daily XP
}
```

**Error Handling:**
- Uses `.maybeSingle()` instead of `.single()` to handle empty results
- Comprehensive console logging for debugging
- Proper error propagation with meaningful messages

---

### 5. Backend - Supabase Configuration

**File:** `backend/src/utils/supabase.ts`

#### Client Configuration
- **Service Role Key**: Used to bypass RLS policies for backend operations
- **Two clients**: `supabaseAuth` for auth operations, `supabase` for database operations
- **Session management**: Auto-refresh disabled, session persistence disabled

```typescript
// Database client (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: { schema: 'public' },
})
```

---

### 6. Database Schema

**File:** `backend/supabase-schema.sql`

#### Tables Summary

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profile data | user_id, username, xp, streak, last_study_date |
| `lesson_progress` | Lesson completion tracking | user_id, lesson_id, words_learned, is_completed |
| `favorite_words` | Favorite vocabulary | user_id, chinese, pinyin, english, level |
| `daily_xp` | Daily XP tracking | user_id, date, xp_amount |
| `achievements` | Unlocked achievements | user_id, achievement_id, unlocked_at |
| `quiz_mistakes` | Quiz error tracking | user_id, lesson_id, word_chinese, your_answer |
| `study_statistics` | Study metrics | user_id, date, xp_earned, words_learned |
| `recently_learned` | Recent vocabulary | user_id, word_chinese, lesson_id, learned_at |
| `quiz_history` | Quiz results | user_id, lesson_id, score, total_questions |

#### RLS Policies
All tables have Row Level Security enabled with policies that:
- Allow users to view only their own data
- Allow users to insert/update/delete only their own data
- Reference `auth.uid()` for user identification

#### Trigger for Profile Creation
```sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
Automatically creates a profile when a new auth user is created.

---

## Data Flow

### Login Flow
1. User logs in via Supabase Auth
2. JWT token stored in localStorage
3. `ProgressContext` detects authentication
4. `loadFromCloud()` fetches progress from backend
5. Backend retrieves data from Supabase tables
6. Frontend state is hydrated with cloud data

### Learning Flow
1. User interacts with lesson/quiz
2. Progress actions trigger state updates
3. State updates trigger API calls to backend
4. Backend service writes to Supabase
5. Auto-sync runs every 15 seconds as backup

### Logout Flow
1. User logs out
2. `ProgressContext` resets to empty state
3. JWT token removed from localStorage
4. **Database data is preserved**

---

## Technical Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | React | 18+ |
| Frontend State | React Context API | Built-in |
| Backend Framework | Express.js | 4.x |
| Database | Supabase (PostgreSQL) | Cloud |
| Authentication | Supabase Auth | Built-in |
| Language | TypeScript | 5.x |
| API Calls | Native Fetch API | Built-in |

---

## Security Features

1. **JWT Authentication**: All API requests require valid JWT token
2. **Row Level Security**: Database-level isolation per user
3. **Service Role**: Backend uses service role key for elevated permissions
4. **Input Validation**: TypeScript interfaces enforce data structure
5. **User Isolation**: All queries filter by `user_id`

---

## Performance Considerations

1. **Parallel Queries**: `getFullProgress` uses `Promise.all` for concurrent fetching
2. **Upsert Operations**: Efficient update-or-insert for progress data
3. **Auto-sync Interval**: 15-second sync window balances freshness and performance
4. **Indexing**: Database indexes on `user_id` columns for faster queries

---

## Known Issues and Limitations

1. **RLS Bypass**: Backend uses service role which bypasses RLS entirely
2. **No Retry Logic**: Failed sync attempts are logged but not retried
3. **No Conflict Resolution**: Concurrent modifications may overwrite data
4. **Memory State**: Frontend state is lost on page refresh until reloaded from cloud
5. **Error Handling**: Some error messages are generic

---

## Recommendations for Improvement

1. **Add Conflict Resolution**: Implement versioning or timestamp-based conflict detection
2. **Add Retry Logic**: Implement exponential backoff for failed API calls
3. **Add Offline Support**: Local storage fallback with sync on reconnection
4. **Add Progress Validation**: Server-side validation of progress data
5. **Add Rate Limiting**: Prevent excessive API calls
6. **Add Monitoring**: Implement logging and alerting for sync failures

---

## Conclusion

The learning progress functionality provides a solid foundation for tracking user learning data with:

- **Comprehensive tracking**: XP, streaks, lessons, favorites, mistakes
- **Cloud synchronization**: Automatic sync every 15 seconds
- **User isolation**: Proper data separation using Supabase Auth and RLS
- **Type safety**: TypeScript interfaces throughout
- **Error handling**: Console logging for debugging

The architecture follows a clean separation of concerns with frontend state management, RESTful API layer, and database persistence working together seamlessly.