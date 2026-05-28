import { supabase } from '../utils/supabase'
import type { LessonProgress, QuizHistory, FavoriteWord, Achievement, StudyStatistic, QuizMistake, RecentlyLearned } from '../types'

export const progressService = {
  // ===== LESSON PROGRESS =====
  async saveLessonProgress(userId: string, progress: Omit<LessonProgress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: userId,
        ...progress,
      }, {
        onConflict: 'user_id,lesson_id'
      })
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || data
  },

  async getLessonProgress(userId: string) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // ===== QUIZ HISTORY =====
  async saveQuizHistory(userId: string, history: Omit<QuizHistory, 'id' | 'user_id' | 'completed_at'>) {
    const { data, error } = await supabase
      .from('quiz_history')
      .insert({
        user_id: userId,
        ...history,
        completed_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || data
  },

  async getQuizHistory(userId: string) {
    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // ===== FAVORITE WORDS =====
  async addFavoriteWord(userId: string, word: Omit<FavoriteWord, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('favorite_words')
      .insert({
        user_id: userId,
        ...word,
      })
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || data
  },

  async removeFavoriteWord(userId: string, chinese: string) {
    const { error } = await supabase
      .from('favorite_words')
      .delete()
      .eq('user_id', userId)
      .eq('chinese', chinese)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  },

  async getFavoriteWords(userId: string) {
    const { data, error } = await supabase
      .from('favorite_words')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // ===== ACHIEVEMENTS =====
  async addAchievement(userId: string, achievementId: string) {
    const { data: existing } = await supabase
      .from('achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .maybeSingle()

    if (existing) {
      return existing
    }

    const { data, error } = await supabase
      .from('achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || data
  },

  async getAchievements(userId: string) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // ===== STUDY STATISTICS =====
  async updateStudyStatistics(userId: string, stats: Omit<StudyStatistic, 'id' | 'user_id'>) {
    const today = new Date().toDateString()
    
    const { data: existing } = await supabase
      .from('study_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('study_statistics')
        .update({
          xp_earned: existing.xp_earned + stats.xp_earned,
          words_learned: existing.words_learned + stats.words_learned,
          lessons_completed: existing.lessons_completed + stats.lessons_completed,
          quiz_attempts: existing.quiz_attempts + stats.quiz_attempts,
        })
        .eq('id', existing.id)
        .select()

      if (error) {
        throw new Error(error.message)
      }

      return data?.[0] || data
    }

    const { data, error } = await supabase
      .from('study_statistics')
      .insert({
        user_id: userId,
        ...stats,
        date: today,
      })
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || data
  },

  async getStudyStatistics(userId: string) {
    const { data, error } = await supabase
      .from('study_statistics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // ===== QUIZ MISTAKES =====
  async addQuizMistake(userId: string, mistake: Omit<QuizMistake, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quiz_mistakes')
      .insert({
        user_id: userId,
        ...mistake,
      })
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || data
  },

  async getQuizMistakes(userId: string) {
    const { data, error } = await supabase
      .from('quiz_mistakes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // ===== RECENTLY LEARNED =====
  async addRecentlyLearned(userId: string, word: Omit<RecentlyLearned, 'id' | 'user_id' | 'learned_at'>) {
    const { data: existing } = await supabase
      .from('recently_learned')
      .select('id')
      .eq('user_id', userId)
      .eq('word_chinese', word.word_chinese)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('recently_learned')
        .update({ learned_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()

      if (error) {
        throw new Error(error.message)
      }

      return data?.[0] || data
    }

    const { data, error } = await supabase
      .from('recently_learned')
      .insert({
        user_id: userId,
        ...word,
        learned_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || data
  },

  async getRecentlyLearned(userId: string) {
    const { data, error } = await supabase
      .from('recently_learned')
      .select('*')
      .eq('user_id', userId)
      .order('learned_at', { ascending: false })
      .limit(10)

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // ===== PROFILE =====
  async updateProfile(userId: string, updates: Partial<{ xp: number; streak: number; last_study_date: string | null; current_level: string }>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || data
  },

  // ===== DAILY XP =====
  async saveDailyXP(userId: string, dailyXP: Record<string, number>) {
    for (const [date, xpAmount] of Object.entries(dailyXP)) {
      const { error } = await supabase
        .from('daily_xp')
        .upsert({
          user_id: userId,
          date: date,
          xp_amount: xpAmount,
        }, {
          onConflict: 'user_id,date'
        })

      if (error) {
        console.error(`[PROGRESS] Failed to save daily XP for ${date}:`, error.message)
      }
    }

    return { success: true }
  },

  // ===== SYNC PROGRESS (SIMPLIFIED) =====
  async syncProgress(userId: string, progress: {
    xp?: number
    streak?: number
    lastStudyDate?: string | null
    completedLessons?: string[]
    lessonProgress?: Record<string, any>
    achievements?: string[]
    dailyXP?: Record<string, number>
  }) {
    console.log(`[SYNC] Starting progress sync for user: ${userId}`)
    console.log(`[SYNC] Progress data:`, JSON.stringify(progress))

    try {
      // Update profile fields
      const profileUpdates: Partial<{ xp: number; streak: number; last_study_date: string | null }> = {}
      if (progress.xp !== undefined) profileUpdates.xp = progress.xp
      if (progress.streak !== undefined) profileUpdates.streak = progress.streak
      if (progress.lastStudyDate !== undefined) profileUpdates.last_study_date = progress.lastStudyDate

      if (Object.keys(profileUpdates).length > 0) {
        await this.updateProfile(userId, profileUpdates)
        console.log(`[SYNC] Updated profile:`, Object.keys(profileUpdates))
      }

      // Handle completed lessons
      if (progress.completedLessons && progress.completedLessons.length > 0) {
        for (const lessonId of progress.completedLessons) {
          await this.saveLessonProgress(userId, {
            lesson_id: lessonId,
            words_learned: 10,
            total_words: 10,
            is_completed: true,
            quiz_score: null,
            last_studied: new Date().toISOString(),
          })
        }
        console.log(`[SYNC] Saved ${progress.completedLessons.length} completed lessons`)
      }

      // Handle detailed lesson progress
      if (progress.lessonProgress) {
        for (const [lessonId, lp] of Object.entries(progress.lessonProgress)) {
          await this.saveLessonProgress(userId, {
            lesson_id: lp.lessonId || lp.lesson_id || lessonId,
            words_learned: lp.wordsLearned || lp.words_learned || 0,
            total_words: lp.totalWords || lp.total_words || 0,
            is_completed: lp.isCompleted || lp.is_completed || false,
            quiz_score: lp.quizScore || lp.quiz_score || null,
            last_studied: lp.lastStudied || lp.last_studied || null,
          })
        }
        console.log(`[SYNC] Saved ${Object.keys(progress.lessonProgress).length} lesson progress entries`)
      }

      // Handle achievements
      if (progress.achievements && progress.achievements.length > 0) {
        for (const achievementId of progress.achievements) {
          await this.addAchievement(userId, achievementId)
        }
        console.log(`[SYNC] Added ${progress.achievements.length} achievements`)
      }

      // Handle daily XP
      if (progress.dailyXP && Object.keys(progress.dailyXP).length > 0) {
        await this.saveDailyXP(userId, progress.dailyXP)
        console.log(`[SYNC] Saved ${Object.keys(progress.dailyXP).length} daily XP entries`)
      }

      console.log(`[SYNC] Progress sync completed successfully for user: ${userId}`)
      return { success: true }

    } catch (error) {
      console.error(`[SYNC] Progress sync failed for user ${userId}:`, (error as Error).message)
      throw error
    }
  },

  // ===== GET FULL PROGRESS =====
  async getFullProgress(userId: string) {
    console.log(`[PROGRESS] Loading full progress for user: ${userId}`)
    
    try {
      const [
        profileResult,
        lessonProgress,
        favorites,
        quizHistory,
        achievements,
        statistics,
        mistakes,
        recentlyLearned,
        dailyXP,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('lesson_progress').select('*').eq('user_id', userId),
        supabase.from('favorite_words').select('*').eq('user_id', userId),
        supabase.from('quiz_history').select('*').eq('user_id', userId).order('completed_at', { ascending: false }),
        supabase.from('achievements').select('*').eq('user_id', userId),
        supabase.from('study_statistics').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('quiz_mistakes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('recently_learned').select('*').eq('user_id', userId).order('learned_at', { ascending: false }).limit(10),
        supabase.from('daily_xp').select('*').eq('user_id', userId),
      ])

      // Convert lessonProgress array to object for frontend
      const lessonProgressObj: Record<string, any> = {}
      if (lessonProgress.data) {
        lessonProgress.data.forEach((lp: any) => {
          const key = lp.lesson_id || lp.lessonId || lp.id
          if (key) {
            lessonProgressObj[key] = lp
          }
        })
      }

      // Extract completed lessons from lessonProgress
      const completedLessons = lessonProgress.data
        ? lessonProgress.data
            .filter((lp: any) => lp.is_completed || lp.isCompleted)
            .map((lp: any) => lp.lesson_id || lp.lessonId || lp.id)
        : []

      // Convert dailyXP array to object for frontend
      const dailyXPObj: Record<string, number> = {}
      if (dailyXP.data) {
        dailyXP.data.forEach((entry: any) => {
          dailyXPObj[entry.date] = entry.xp_amount || entry.xp || 0
        })
      }

      console.log(`[PROGRESS] Loaded full progress for user: ${userId}`)
      return {
        profile: profileResult.data,
        lessonProgress: lessonProgressObj,
        completedLessons,
        favorites: favorites.data,
        quizHistory: quizHistory.data,
        achievements: achievements.data,
        statistics: statistics.data,
        mistakes: mistakes.data,
        recentlyLearned: recentlyLearned.data,
        dailyXP: dailyXPObj,
      }

    } catch (error) {
      console.error(`[PROGRESS] Failed to load full progress for user ${userId}:`, (error as Error).message)
      throw error
    }
  },
}
