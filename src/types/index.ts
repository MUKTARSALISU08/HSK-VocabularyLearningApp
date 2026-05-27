export interface Sentence {
  chinese: string
  pinyin?: string
  english: string
}

export interface VocabularyWord {
  chinese: string
  pinyin?: string
  english: string
  sentences: Sentence[]
}

export interface Lesson {
  id: string
  level: 'HSK1' | 'HSK2' | 'HSK3'
  lessonNumber: number
  words: VocabularyWord[]
}

export interface QuizQuestion {
  id: string
  type: 'chinese-to-english' | 'english-to-chinese' | 'pinyin-to-chinese' | 'sentence-meaning' | 'fill-in-blank' | 'match-meaning'
  question: string
  questionText: string
  questionPinyin?: string
  options: string[]
  correctAnswer: string
  relatedWord?: string
}

export interface QuizResult {
  questionId: string
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export interface UserProgress {
  xp: number
  streak: number
  lastStudyDate: string | null
  completedLessons: string[]
  favoriteWords: FavoriteWord[]
  quizMistakes: QuizMistake[]
  lessonProgress: Record<string, LessonProgress>
  achievements: string[]
  dailyXP: Record<string, number>
}

export interface FavoriteWord {
  chinese: string
  pinyin?: string
  english: string
  level: 'HSK1' | 'HSK2' | 'HSK3'
  lessonId: string
  addedAt: string
}

export interface QuizMistake {
  word: VocabularyWord
  yourAnswer: string
  correctAnswer: string
  level: 'HSK1' | 'HSK2' | 'HSK3'
  lessonId: string
  date: string
}

export interface LessonProgress {
  lessonId: string
  wordsLearned: number
  totalWords: number
  isCompleted: boolean
  quizScore?: number
  lastStudied: string | null
}

export type HSKLevel = 'HSK1' | 'HSK2' | 'HSK3'