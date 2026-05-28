import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { UserProgress, FavoriteWord, QuizMistake, LessonProgress } from '@/types'
import { api } from '@/services/api'
import { useAuth } from '@/contexts/auth-context'

const createEmptyProgress = (): UserProgress => ({
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  completedLessons: [],
  favoriteWords: [],
  quizMistakes: [],
  lessonProgress: {},
  achievements: [],
  dailyXP: {},
})

interface ProgressContextType {
  progress: UserProgress
  isSyncing: boolean
  addXp: (amount: number) => Promise<void>
  updateStreak: () => Promise<void>
  completeLesson: (lessonId: string) => Promise<void>
  addFavorite: (word: FavoriteWord) => Promise<void>
  removeFavorite: (chinese: string) => Promise<void>
  addQuizMistake: (mistake: QuizMistake) => Promise<void>
  clearMistakes: () => Promise<void>
  updateLessonProgress: (lessonId: string, wordsLearned: number, totalWords: number) => Promise<void>
  markLessonComplete: (lessonId: string, quizScore?: number) => Promise<void>
  isFavorite: (chinese: string) => boolean
  resetProgress: () => void
  syncToCloud: () => Promise<void>
  loadFromCloud: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(createEmptyProgress())
  const [isSyncing, setIsSyncing] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const loadFromCloud = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('[PROGRESS] loadFromCloud - No authenticated user')
      return
    }

    const userId = user.id
    console.log('[PROGRESS] loadFromCloud - Starting for user:', userId)
    
    try {
      setIsSyncing(true)
      
      const response = await api.progress.getProgress()
      console.log('[PROGRESS] loadFromCloud - Cloud response received:', response)

      if (response.success && response.progress) {
        const loadedProgress: UserProgress = {
          xp: response.progress.profile?.xp ?? 0,
          streak: response.progress.profile?.streak ?? 0,
          lastStudyDate: response.progress.profile?.last_study_date ?? null,
          completedLessons: [...(response.progress.completedLessons || [])],
          favoriteWords: [...(response.progress.favorites || [])],
          quizMistakes: [...(response.progress.mistakes || [])],
          lessonProgress: {},
          achievements: [...(response.progress.achievements?.map((a: { achievement_id: string }) => a.achievement_id) || [])],
          dailyXP: {},
        }

        const lessonProgress = response.progress.lessonProgress as Record<string, LessonProgress> | undefined
        if (lessonProgress) {
          loadedProgress.lessonProgress = {}
          for (const [lessonId, lp] of Object.entries(lessonProgress)) {
            loadedProgress.lessonProgress[lessonId] = {
              lessonId: lp.lessonId,
              wordsLearned: lp.wordsLearned,
              totalWords: lp.totalWords,
              isCompleted: lp.isCompleted,
              quizScore: lp.quizScore,
              lastStudied: lp.lastStudied,
            }
          }
        }

        setProgress(loadedProgress)
        console.log('[PROGRESS] loadFromCloud - Successfully loaded from cloud for user:', userId)
      } else {
        console.log('[PROGRESS] loadFromCloud - No progress in cloud, starting fresh')
        setProgress(createEmptyProgress())
      }
    } catch (error) {
      console.error('[PROGRESS] loadFromCloud - Failed for user:', userId, error)
      setProgress(createEmptyProgress())
    } finally {
      setIsSyncing(false)
    }
  }, [isAuthenticated, user?.id])

  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return

    const userId = user.id
    try {
      setIsSyncing(true)
      await api.progress.syncProgress({
        xp: progress.xp,
        streak: progress.streak,
        lastStudyDate: progress.lastStudyDate,
        completedLessons: [...progress.completedLessons],
        lessonProgress: { ...progress.lessonProgress },
        achievements: [...progress.achievements],
        dailyXP: { ...progress.dailyXP },
      })
      console.log('[PROGRESS] syncToCloud - Synced progress for user:', userId)
    } catch (error) {
      console.error('[PROGRESS] syncToCloud - Failed for user:', userId, error)
    } finally {
      setIsSyncing(false)
    }
  }, [isAuthenticated, user?.id, progress])

  useEffect(() => {
    console.log('[PROGRESS] Auth state changed - isAuthenticated:', isAuthenticated, 'userId:', user?.id)
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setProgress(createEmptyProgress())
      return
    }
    
    loadFromCloud()
  }, [isAuthenticated, user?.id, loadFromCloud])

  useEffect(() => {
    if (!isAuthenticated) return

    const syncInterval = setInterval(() => {
      syncToCloud()
    }, 15000)

    return () => clearInterval(syncInterval)
  }, [isAuthenticated, syncToCloud])

  const addXp = useCallback(async (amount: number) => {
    const today = new Date().toDateString()
    setProgress(prev => ({
      ...prev,
      xp: prev.xp + amount,
      dailyXP: {
        ...prev.dailyXP,
        [today]: (prev.dailyXP[today] || 0) + amount,
      },
    }))

    if (isAuthenticated) {
      try {
        await api.progress.updateProfile({ xp: progress.xp + amount })
        console.log('[PROGRESS] addXp - Saved XP to cloud:', amount)
      } catch (error) {
        console.error('[PROGRESS] addXp - Failed to save to cloud:', error)
      }
    }
  }, [isAuthenticated, progress.xp])

  const updateStreak = useCallback(async () => {
    const today = new Date().toDateString()
    const lastDate = progress.lastStudyDate ? new Date(progress.lastStudyDate).toDateString() : null

    if (lastDate === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutive = lastDate === yesterday.toDateString()

    const newStreak = isConsecutive ? progress.streak + 1 : 1

    setProgress(prev => ({
      ...prev,
      streak: newStreak,
      lastStudyDate: today,
    }))

    if (isAuthenticated) {
      try {
        await api.progress.updateProfile({ streak: newStreak, last_study_date: today })
        console.log('[PROGRESS] updateStreak - Saved streak to cloud:', newStreak)
      } catch (error) {
        console.error('[PROGRESS] updateStreak - Failed to save to cloud:', error)
      }
    }
  }, [isAuthenticated, progress.lastStudyDate, progress.streak])

  const completeLesson = useCallback(async (lessonId: string) => {
    setProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId],
    }))

    if (isAuthenticated) {
      try {
        await api.progress.syncProgress({ completedLessons: [...progress.completedLessons, lessonId] })
        console.log('[PROGRESS] completeLesson - Saved to cloud:', lessonId)
      } catch (error) {
        console.error('[PROGRESS] completeLesson - Failed to save to cloud:', error)
      }
    }
  }, [isAuthenticated, progress.completedLessons])

  const addFavorite = useCallback(async (word: FavoriteWord) => {
    setProgress(prev => ({
      ...prev,
      favoriteWords: prev.favoriteWords.some(w => w.chinese === word.chinese)
        ? prev.favoriteWords
        : [...prev.favoriteWords, { ...word }],
    }))

    if (isAuthenticated) {
      try {
        await api.progress.addFavorite({
          chinese: word.chinese,
          pinyin: word.pinyin || null,
          english: word.english,
          level: word.level,
        })
        console.log('[PROGRESS] addFavorite - Saved to cloud:', word.chinese)
      } catch (error) {
        console.error('[PROGRESS] addFavorite - Failed to save to cloud:', error)
      }
    }
  }, [isAuthenticated])

  const removeFavorite = useCallback(async (chinese: string) => {
    setProgress(prev => ({
      ...prev,
      favoriteWords: prev.favoriteWords.filter(w => w.chinese !== chinese),
    }))

    if (isAuthenticated) {
      try {
        await api.progress.removeFavorite(chinese)
        console.log('[PROGRESS] removeFavorite - Removed from cloud:', chinese)
      } catch (error) {
        console.error('[PROGRESS] removeFavorite - Failed to remove from cloud:', error)
      }
    }
  }, [isAuthenticated])

  const addQuizMistake = useCallback(async (mistake: QuizMistake) => {
    setProgress(prev => ({
      ...prev,
      quizMistakes: [...prev.quizMistakes, { ...mistake }],
    }))

    if (isAuthenticated) {
      try {
        await api.quiz.addMistake(mistake)
        console.log('[PROGRESS] addQuizMistake - Saved to cloud')
      } catch (error) {
        console.error('[PROGRESS] addQuizMistake - Failed to save to cloud:', error)
      }
    }
  }, [isAuthenticated])

  const clearMistakes = useCallback(async () => {
    setProgress(prev => ({
      ...prev,
      quizMistakes: [],
    }))

    if (isAuthenticated) {
      try {
        await api.quiz.clearMistakes()
        console.log('[PROGRESS] clearMistakes - Cleared from cloud')
      } catch (error) {
        console.error('[PROGRESS] clearMistakes - Failed to clear from cloud:', error)
      }
    }
  }, [isAuthenticated])

  const updateLessonProgress = useCallback(async (lessonId: string, wordsLearned: number, totalWords: number) => {
    setProgress(prev => ({
      ...prev,
      lessonProgress: {
        ...prev.lessonProgress,
        [lessonId]: {
          lessonId,
          wordsLearned,
          totalWords,
          isCompleted: prev.lessonProgress[lessonId]?.isCompleted || false,
          quizScore: prev.lessonProgress[lessonId]?.quizScore,
          lastStudied: new Date().toISOString(),
        },
      },
    }))

    if (isAuthenticated) {
      try {
        await api.progress.syncProgress({
          lessonProgress: {
            [lessonId]: {
              lessonId,
              wordsLearned,
              totalWords,
              isCompleted: false,
              lastStudied: new Date().toISOString(),
            },
          },
        })
        console.log('[PROGRESS] updateLessonProgress - Saved to cloud:', lessonId)
      } catch (error) {
        console.error('[PROGRESS] updateLessonProgress - Failed to save to cloud:', error)
      }
    }
  }, [isAuthenticated])

  const markLessonComplete = useCallback(async (lessonId: string, quizScore?: number) => {
    setProgress(prev => ({
      ...prev,
      lessonProgress: {
        ...prev.lessonProgress,
        [lessonId]: {
          ...prev.lessonProgress[lessonId],
          lessonId,
          isCompleted: true,
          quizScore,
          lastStudied: new Date().toISOString(),
          wordsLearned: prev.lessonProgress[lessonId]?.wordsLearned || 0,
          totalWords: prev.lessonProgress[lessonId]?.totalWords || 0,
        },
      },
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId],
    }))

    if (isAuthenticated) {
      try {
        await api.progress.syncProgress({
          completedLessons: [...progress.completedLessons, lessonId],
          lessonProgress: {
            [lessonId]: {
              lessonId,
              isCompleted: true,
              quizScore,
              lastStudied: new Date().toISOString(),
            },
          },
        })
        console.log('[PROGRESS] markLessonComplete - Saved to cloud:', lessonId)
      } catch (error) {
        console.error('[PROGRESS] markLessonComplete - Failed to save to cloud:', error)
      }
    }
  }, [isAuthenticated, progress.completedLessons])

  const isFavorite = useCallback((chinese: string) => {
    return progress.favoriteWords.some(w => w.chinese === chinese)
  }, [progress.favoriteWords])

  const resetProgress = useCallback(() => {
    setProgress(createEmptyProgress())
  }, [])

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isSyncing,
        addXp,
        updateStreak,
        completeLesson,
        addFavorite,
        removeFavorite,
        addQuizMistake,
        clearMistakes,
        updateLessonProgress,
        markLessonComplete,
        isFavorite,
        resetProgress,
        syncToCloud,
        loadFromCloud,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
