import { supabase } from '../utils/supabase'
import type { LessonProgress, QuizHistory, FavoriteWord, Achievement, StudyStatistic, QuizMistake, RecentlyLearned } from '../types'

export const progressService = {
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
    
    const promises: Promise<any>[] = []

    if (progress.xp !== undefined) {
      console.log(`[SYNC] Updating XP: ${progress.xp}`)
      promises.push(this.updateProfile(userId, { xp: progress.xp }).catch(e => {
        console.error(`[SYNC] Failed to update XP:`, e.message)
        throw e
      }))
    }

    if (progress.streak !== undefined) {
      console.log(`[SYNC] Updating streak: ${progress.streak}`)
      promises.push(this.updateProfile(userId, { streak: progress.streak }).catch(e => {
        console.error(`[SYNC] Failed to update streak:`, e.message)
        throw e
      }))
    }

    if (progress.lastStudyDate !== undefined) {
      console.log(`[SYNC] Updating last study date: ${progress.lastStudyDate}`)
      promises.push(this.updateProfile(userId, { last_study_date: progress.lastStudyDate }).catch(e => {
        console.error(`[SYNC] Failed to update last study date:`, e.message)
        throw e
      }))
    }

    if (progress.completedLessons && progress.completedLessons.length > 0) {
      console.log(`[SYNC] Processing ${progress.completedLessons.length} completed lessons`)
      // Create lesson progress entries for completed lessons
      progress.completedLessons.forEach(lessonId => {
        const lessonProgressData = {
          lesson_id: lessonId,
          words_learned: 10, // Default value
          total_words: 10, // Default value
          is_completed: true,
          quiz_score: null,
          last_studied: new Date().toISOString(),
        }
        promises.push(this.saveLessonProgress(userId, lessonProgressData).catch(e => {
          console.error(`[SYNC] Failed to save lesson progress for ${lessonId}:`, e.message)
          throw e
        }))
      })
    }

    if (progress.lessonProgress) {
      console.log(`[SYNC] Processing ${Object.keys(progress.lessonProgress).length} lesson progress entries`)
      Object.values(progress.lessonProgress).forEach(p => {
        const lessonProgressData = {
          lesson_id: p.lessonId || p.lesson_id,
          words_learned: p.wordsLearned || p.words_learned || 0,
          total_words: p.totalWords || p.total_words || 0,
          is_completed: p.isCompleted || p.is_completed || false,
          quiz_score: p.quizScore || p.quiz_score || null,
          last_studied: p.lastStudied || p.last_studied || null,
        }
        if (lessonProgressData.lesson_id) {
          promises.push(this.saveLessonProgress(userId, lessonProgressData).catch(e => {
            console.error(`[SYNC] Failed to save lesson progress for ${lessonProgressData.lesson_id}:`, e.message)
            throw e
          }))
        }
      })
    }

    if (progress.achievements && progress.achievements.length > 0) {
      console.log(`[SYNC] Processing ${progress.achievements.length} achievements`)
      progress.achievements.forEach(a => {
        promises.push(this.addAchievement(userId, a).catch(e => {
          console.error(`[SYNC] Failed to add achievement ${a}:`, e.message)
          throw e
        }))
      })
    }

    try {
      await Promise.all(promises)
      console.log(`[SYNC] Progress sync completed successfully for user: ${userId}`)
      return { success: true }
    } catch (error) {
      console.error(`[SYNC] Progress sync failed for user ${userId}:`, (error as Error).message)
      throw error
    }
  },

  async getFullProgress(userId: string) {
    const [
      profileResult,
      lessonProgress,
      favorites,
      quizHistory,
      achievements,
      statistics,
      mistakes,
      recentlyLearned,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('lesson_progress').select('*').eq('user_id', userId),
      supabase.from('favorite_words').select('*').eq('user_id', userId),
      supabase.from('quiz_history').select('*').eq('user_id', userId).order('completed_at', { ascending: false }),
      supabase.from('achievements').select('*').eq('user_id', userId),
      supabase.from('study_statistics').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('quiz_mistakes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('recently_learned').select('*').eq('user_id', userId).order('learned_at', { ascending: false }).limit(10),
    ])

    // Handle profile being null
    const profile = profileResult

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

    return {
      profile: profile.data,
      lessonProgress: lessonProgressObj,
      completedLessons,
      favorites: favorites.data,
      quizHistory: quizHistory.data,
      achievements: achievements.data,
      statistics: statistics.data,
      mistakes: mistakes.data,
      recentlyLearned: recentlyLearned.data,
    }
  },
}
