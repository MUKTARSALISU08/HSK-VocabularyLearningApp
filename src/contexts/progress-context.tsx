import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { UserProgress, FavoriteWord, QuizMistake, LessonProgress } from '@/types'
import { api } from '@/services/api'
import { useAuth } from '@/contexts/auth-context'

const getProgressKey = (userId: string | undefined) => userId ? `hsk-progress-${userId}` : null

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
  addXp: (amount: number) => void
  updateStreak: () => void
  completeLesson: (lessonId: string) => void
  addFavorite: (word: FavoriteWord) => void
  removeFavorite: (chinese: string) => void
  addQuizMistake: (mistake: QuizMistake) => void
  clearMistakes: () => void
  updateLessonProgress: (lessonId: string, wordsLearned: number, totalWords: number) => void
  markLessonComplete: (lessonId: string, quizScore?: number) => void
  isFavorite: (chinese: string) => boolean
  resetProgress: () => void
  syncToCloud: () => Promise<void>
  loadFromCloud: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(createEmptyProgress())
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const loadFromCloud = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('[PROGRESS] loadFromCloud - No authenticated user')
      return
    }

    const userId = user.id
    console.log('[PROGRESS] loadFromCloud - Starting for user:', userId)
    
    const progressKey = getProgressKey(userId)
    
    try {
      setIsSyncing(true)
      setProgress(createEmptyProgress())

      const response = await api.progress.getProgress()
      console.log('[PROGRESS] loadFromCloud - Cloud response received for user:', userId)

      if (response.success && response.progress) {
        const loadedProgress: UserProgress = {
          xp: response.progress.profile?.xp ?? 0,
          streak: response.progress.profile?.streak ?? 0,
          lastStudyDate: response.progress.profile?.last_study_date ?? null,
          completedLessons: [...(response.progress.completedLessons || [])],
          favoriteWords: [...(response.progress.favoriteWords || [])],
          quizMistakes: [...(response.progress.quizMistakes || [])],
          lessonProgress: { ...(response.progress.lessonProgress || {}) },
          achievements: [...(response.progress.achievements || [])],
          dailyXP: { ...(response.progress.dailyXP || {}) },
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
        
        if (progressKey) {
          localStorage.setItem(progressKey, JSON.stringify(loadedProgress))
        }
        console.log('[PROGRESS] loadFromCloud - Loaded progress for user:', userId, {
          xp: loadedProgress.xp,
          completedLessons: loadedProgress.completedLessons.length
        })
      } else {
        const stored = progressKey ? localStorage.getItem(progressKey) : null
        if (stored) {
          try {
            const localProgress = JSON.parse(stored) as UserProgress
            setProgress({
              xp: localProgress.xp || 0,
              streak: localProgress.streak || 0,
              lastStudyDate: localProgress.lastStudyDate || null,
              completedLessons: [...(localProgress.completedLessons || [])],
              favoriteWords: [...(localProgress.favoriteWords || [])],
              quizMistakes: [...(localProgress.quizMistakes || [])],
              lessonProgress: { ...(localProgress.lessonProgress || {}) },
              achievements: [...(localProgress.achievements || [])],
              dailyXP: { ...(localProgress.dailyXP || {}) },
            })
            console.log('[PROGRESS] loadFromCloud - Using local progress for user:', userId)
          } catch (e) {
            console.error('[PROGRESS] loadFromCloud - Failed to parse local progress:', e)
          }
        }
      }
    } catch (error) {
      console.error('[PROGRESS] loadFromCloud - Failed for user:', userId, error)
      const progressKey = getProgressKey(userId)
      const stored = progressKey ? localStorage.getItem(progressKey) : null
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as UserProgress
          setProgress({
            xp: parsed.xp || 0,
            streak: parsed.streak || 0,
            lastStudyDate: parsed.lastStudyDate || null,
            completedLessons: [...(parsed.completedLessons || [])],
            favoriteWords: [...(parsed.favoriteWords || [])],
            quizMistakes: [...(parsed.quizMistakes || [])],
            lessonProgress: { ...(parsed.lessonProgress || {}) },
            achievements: [...(parsed.achievements || [])],
            dailyXP: { ...(parsed.dailyXP || {}) },
          })
        } catch (e) {
          console.error('[PROGRESS] loadFromCloud - Failed to parse fallback:', e)
        }
      }
    } finally {
      setIsSyncing(false)
      setIsLoaded(true)
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

  const loadGuestProgress = useCallback(() => {
    const stored = localStorage.getItem('hsk-progress-guest')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserProgress
        setProgress({
          xp: parsed.xp || 0,
          streak: parsed.streak || 0,
          lastStudyDate: parsed.lastStudyDate || null,
          completedLessons: [...(parsed.completedLessons || [])],
          favoriteWords: [...(parsed.favoriteWords || [])],
          quizMistakes: [...(parsed.quizMistakes || [])],
          lessonProgress: { ...(parsed.lessonProgress || {}) },
          achievements: [...(parsed.achievements || [])],
          dailyXP: { ...(parsed.dailyXP || {}) },
        })
      } catch {
        console.error('[PROGRESS] loadGuestProgress - Failed to parse')
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    console.log('[PROGRESS] Auth state changed - isAuthenticated:', isAuthenticated, 'userId:', user?.id)
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setProgress(createEmptyProgress())
      setIsLoaded(false)
      return
    }
    
    loadFromCloud()
  }, [isAuthenticated, user?.id, loadFromCloud])

  useEffect(() => {
    if (isAuthenticated) return
    loadGuestProgress()
  }, [loadGuestProgress])

  useEffect(() => {
    if (!isLoaded) return

    if (isAuthenticated && user?.id) {
      const progressKey = getProgressKey(user.id)
      if (progressKey) {
        localStorage.setItem(progressKey, JSON.stringify(progress))
      }
    } else if (!isAuthenticated) {
      localStorage.setItem('hsk-progress-guest', JSON.stringify(progress))
    }
  }, [progress, isLoaded, isAuthenticated, user?.id])

  useEffect(() => {
    if (!isAuthenticated) return

    const syncInterval = setInterval(() => {
      syncToCloud()
    }, 15000)

    return () => clearInterval(syncInterval)
  }, [isAuthenticated, syncToCloud])

  const addXp = useCallback((amount: number) => {
    const today = new Date().toDateString()
    setProgress(prev => ({
      ...prev,
      xp: prev.xp + amount,
      dailyXP: {
        ...prev.dailyXP,
        [today]: (prev.dailyXP[today] || 0) + amount,
      },
    }))
  }, [])

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString()
    const lastDate = progress.lastStudyDate ? new Date(progress.lastStudyDate).toDateString() : null

    if (lastDate === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutive = lastDate === yesterday.toDateString()

    setProgress(prev => ({
      ...prev,
      streak: isConsecutive ? prev.streak + 1 : 1,
      lastStudyDate: today,
    }))
  }, [progress.lastStudyDate])

  const completeLesson = useCallback((lessonId: string) => {
    setProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId],
    }))
  }, [])

  const addFavorite = useCallback((word: FavoriteWord) => {
    setProgress(prev => ({
      ...prev,
      favoriteWords: prev.favoriteWords.some(w => w.chinese === word.chinese)
        ? prev.favoriteWords
        : [...prev.favoriteWords, { ...word }],
    }))

    if (isAuthenticated) {
      api.progress.addFavorite({
        chinese: word.chinese,
        pinyin: word.pinyin || null,
        english: word.english,
        level: word.level,
      }).catch(console.error)
    }
  }, [isAuthenticated])

  const removeFavorite = useCallback((chinese: string) => {
    setProgress(prev => ({
      ...prev,
      favoriteWords: prev.favoriteWords.filter(w => w.chinese !== chinese),
    }))

    if (isAuthenticated) {
      api.progress.removeFavorite(chinese).catch(console.error)
    }
  }, [isAuthenticated])

  const addQuizMistake = useCallback((mistake: QuizMistake) => {
    setProgress(prev => ({
      ...prev,
      quizMistakes: [...prev.quizMistakes, { ...mistake }],
    }))

    if (isAuthenticated) {
      api.quiz.addMistake(mistake).catch(console.error)
    }
  }, [isAuthenticated])

  const clearMistakes = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      quizMistakes: [],
    }))

    if (isAuthenticated) {
      api.quiz.clearMistakes().catch(console.error)
    }
  }, [isAuthenticated])

  const updateLessonProgress = useCallback((lessonId: string, wordsLearned: number, totalWords: number) => {
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
  }, [])

  const markLessonComplete = useCallback((lessonId: string, quizScore?: number) => {
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
  }, [])

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
