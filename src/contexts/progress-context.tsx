import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import type { UserProgress, FavoriteWord, QuizMistake, LessonProgress } from '@/types'
import { api } from '@/services/api'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

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

const MAX_SYNC_FAILURES = 3
const MIN_SYNC_INTERVAL = 30000 // 30 seconds minimum between syncs

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(createEmptyProgress())
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncFailureCount, setSyncFailureCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState(0)
  const { user, isAuthenticated } = useAuth()
  
  const isSyncingRef = useRef(false)

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
        console.log('[PROGRESS] loadFromCloud - Raw favorites from backend:', response.progress.favorites)
        console.log('[PROGRESS] loadFromCloud - Raw mistakes from backend:', response.progress.mistakes)
        console.log('[PROGRESS] loadFromCloud - Raw dailyXP from backend:', response.progress.dailyXP)
        
        // Create new progress object from cloud data - replaces existing state entirely
        const loadedProgress: UserProgress = {
          xp: response.progress.profile?.xp ?? 0,
          streak: response.progress.profile?.streak ?? 0,
          lastStudyDate: response.progress.profile?.last_study_date ?? null,
          completedLessons: [...(response.progress.completedLessons || [])],
          favoriteWords: [...(response.progress.favorites || [])],
          quizMistakes: [...(response.progress.mistakes || [])],
          lessonProgress: {},
          achievements: [...(response.progress.achievements?.map((a: { achievement_id: string }) => a.achievement_id) || [])],
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

        // Direct state replacement - this ensures we don't append to existing mistakes
        setProgress(prev => {
          console.log('[PROGRESS] loadFromCloud - Replacing state, old mistakes count:', prev.quizMistakes.length)
          console.log('[PROGRESS] loadFromCloud - New mistakes count:', loadedProgress.quizMistakes.length)
          return loadedProgress
        })
        
        console.log('[PROGRESS] loadFromCloud - Successfully loaded from cloud for user:', userId)
        console.log('[PROGRESS] loadFromCloud - Loaded dailyXP:', Object.keys(loadedProgress.dailyXP))
        console.log('[PROGRESS] loadFromCloud - Loaded completedLessons:', loadedProgress.completedLessons)
        console.log('[PROGRESS] loadFromCloud - Loaded lessonProgress:', Object.keys(loadedProgress.lessonProgress))
      } else {
        console.log('[PROGRESS] loadFromCloud - No progress in cloud, starting fresh')
        setProgress(createEmptyProgress())
      }
    } catch (error) {
      console.error('[PROGRESS] loadFromCloud - Failed for user:', userId, error)
      toast.error('Failed to load progress from cloud')
      setProgress(createEmptyProgress())
    } finally {
      setIsSyncing(false)
    }
  }, [isAuthenticated, user?.id])

  const syncToCloud = useCallback(async (force = false) => {
    if (!isAuthenticated || !user?.id) return

    // Rate limiting - don't sync more often than MIN_SYNC_INTERVAL unless forced
    const now = Date.now()
    if (!force && now - lastSyncTime < MIN_SYNC_INTERVAL) {
      console.log('[PROGRESS] syncToCloud - Skipping sync, too soon since last sync')
      return
    }

    // Prevent simultaneous sync calls
    if (isSyncingRef.current) {
      console.log('[PROGRESS] syncToCloud - Skipping sync, already syncing')
      return
    }

    const userId = user.id
    isSyncingRef.current = true
    setIsSyncing(true)
    
    try {
      await api.progress.syncProgress({
        xp: progress.xp,
        streak: progress.streak,
        lastStudyDate: progress.lastStudyDate,
        completedLessons: [...progress.completedLessons],
        lessonProgress: { ...progress.lessonProgress },
        achievements: [...progress.achievements],
        dailyXP: { ...progress.dailyXP },
        favoriteWords: [...progress.favoriteWords],
        quizMistakes: [...progress.quizMistakes],
      })
      
      console.log('[PROGRESS] syncToCloud - Synced progress for user:', userId)
      console.log('[PROGRESS] syncToCloud - Synced items:', {
        xp: progress.xp,
        streak: progress.streak,
        completedLessons: progress.completedLessons.length,
        lessonProgress: Object.keys(progress.lessonProgress).length,
        achievements: progress.achievements.length,
        dailyXP: Object.keys(progress.dailyXP).length,
        favoriteWords: progress.favoriteWords.length,
        quizMistakes: progress.quizMistakes.length,
      })
      
      // Reset failure count on success
      setSyncFailureCount(0)
      setLastSyncTime(now)
    } catch (error) {
      const newFailureCount = syncFailureCount + 1
      setSyncFailureCount(newFailureCount)
      console.error('[PROGRESS] syncToCloud - Failed for user:', userId, error)
      console.error('[PROGRESS] syncToCloud - Failure count:', newFailureCount)
      
      // Only show error to user after multiple consecutive failures
      if (newFailureCount >= MAX_SYNC_FAILURES) {
        toast.error('Failed to sync progress to cloud after multiple attempts')
      } else {
        console.log('[PROGRESS] syncToCloud - Silently retrying...')
      }
    } finally {
      isSyncingRef.current = false
      setIsSyncing(false)
    }
  }, [isAuthenticated, user?.id, progress, lastSyncTime, syncFailureCount])

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
    }, MIN_SYNC_INTERVAL)

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
