export interface User {
  id: string
  email: string
  password: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  username: string
  avatar_url: string | null
  xp: number
  streak: number
  last_study_date: string | null
  current_level: string
  created_at: string
  updated_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  words_learned: number
  total_words: number
  is_completed: boolean
  quiz_score: number | null
  last_studied: string | null
  created_at: string
  updated_at: string
}

export interface QuizHistory {
  id: string
  user_id: string
  lesson_id: string
  score: number
  total_questions: number
  completed_at: string
}

export interface FavoriteWord {
  id: string
  user_id: string
  chinese: string
  pinyin: string | null
  english: string
  level: string
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface StudyStatistic {
  id: string
  user_id: string
  date: string
  xp_earned: number
  words_learned: number
  lessons_completed: number
  quiz_attempts: number
}

export interface QuizMistake {
  id: string
  user_id: string
  lesson_id: string
  word_chinese: string
  word_pinyin: string | null
  word_english: string
  your_answer: string
  correct_answer: string
  level: string
  created_at: string
}

export interface RecentlyLearned {
  id: string
  user_id: string
  word_chinese: string
  word_pinyin: string | null
  word_english: string
  lesson_id: string
  learned_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: Partial<User & Profile>
}

export interface ErrorResponse {
  success: boolean
  message: string
  errors?: string[]
}
