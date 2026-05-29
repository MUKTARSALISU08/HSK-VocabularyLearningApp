import { supabase } from '../utils/supabase';
export const progressService = {
    // ===== LESSON PROGRESS =====
    async saveLessonProgress(userId, progress) {
        console.log(`[PROGRESS] saveLessonProgress - User ID: ${userId}`);
        console.log(`[PROGRESS] saveLessonProgress - Progress data:`, JSON.stringify(progress));
        const { data, error } = await supabase
            .from('lesson_progress')
            .upsert({
            user_id: userId,
            ...progress,
        }, {
            onConflict: 'user_id,lesson_id'
        })
            .select();
        if (error) {
            console.error(`[PROGRESS] saveLessonProgress - Error:`, error.message);
            console.error(`[PROGRESS] saveLessonProgress - Error details:`, JSON.stringify(error));
            throw new Error(error.message);
        }
        console.log(`[PROGRESS] saveLessonProgress - Success, data:`, JSON.stringify(data?.[0] || data));
        return data?.[0] || data;
    },
    async getLessonProgress(userId) {
        const { data, error } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== QUIZ HISTORY =====
    async saveQuizHistory(userId, history) {
        const { data, error } = await supabase
            .from('quiz_history')
            .insert({
            user_id: userId,
            ...history,
            completed_at: new Date().toISOString(),
        })
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data?.[0] || data;
    },
    async getQuizHistory(userId) {
        const { data, error } = await supabase
            .from('quiz_history')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== FAVORITE WORDS =====
    async addFavoriteWord(userId, word) {
        const { data, error } = await supabase
            .from('favorite_words')
            .insert({
            user_id: userId,
            ...word,
        })
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data?.[0] || data;
    },
    async removeFavoriteWord(userId, chinese) {
        const { error } = await supabase
            .from('favorite_words')
            .delete()
            .eq('user_id', userId)
            .eq('chinese', chinese);
        if (error) {
            throw new Error(error.message);
        }
        return { success: true };
    },
    async getFavoriteWords(userId) {
        const { data, error } = await supabase
            .from('favorite_words')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== ACHIEVEMENTS =====
    async addAchievement(userId, achievementId) {
        const { data, error } = await supabase
            .from('achievements')
            .insert({
            user_id: userId,
            achievement_id: achievementId,
        })
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data?.[0] || data;
    },
    async getAchievements(userId) {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', userId);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== STUDY STATISTICS =====
    async updateStudyStatistics(userId, stats) {
        const { data, error } = await supabase
            .from('study_statistics')
            .upsert({
            user_id: userId,
            ...stats,
        }, {
            onConflict: 'user_id,date'
        })
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data?.[0] || data;
    },
    async getStudyStatistics(userId) {
        const { data, error } = await supabase
            .from('study_statistics')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== QUIZ MISTAKES =====
    async addQuizMistake(userId, mistake) {
        const { data, error } = await supabase
            .from('quiz_mistakes')
            .insert({
            user_id: userId,
            ...mistake,
        })
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data?.[0] || data;
    },
    async getQuizMistakes(userId) {
        const { data, error } = await supabase
            .from('quiz_mistakes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async removeQuizMistake(userId, mistakeId) {
        const { error } = await supabase
            .from('quiz_mistakes')
            .delete()
            .eq('user_id', userId)
            .eq('id', mistakeId);
        if (error) {
            throw new Error(error.message);
        }
        return { success: true };
    },
    // ===== RECENTLY LEARNED =====
    async addRecentlyLearned(userId, learned) {
        const { data, error } = await supabase
            .from('recently_learned')
            .insert({
            user_id: userId,
            ...learned,
        })
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data?.[0] || data;
    },
    async getRecentlyLearned(userId, limit = 10) {
        const { data, error } = await supabase
            .from('recently_learned')
            .select('*')
            .eq('user_id', userId)
            .order('learned_at', { ascending: false })
            .limit(limit);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== PROFILE =====
    async updateProfile(userId, updates) {
        console.log(`[PROGRESS] updateProfile - User ID: ${userId}, updates:`, JSON.stringify(updates));
        // First try to update existing profile
        const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
            .eq('user_id', userId)
            .select()
            .maybeSingle();
        // If profile doesn't exist, create it
        if (updateError || !updateData) {
            console.log(`[PROGRESS] updateProfile - Profile not found, creating new one for user: ${userId}`);
            const { data: insertData, error: insertError } = await supabase
                .from('profiles')
                .insert({
                user_id: userId,
                username: `user_${userId.substring(0, 8)}`,
                ...updates,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .select()
                .single();
            if (insertError) {
                console.error(`[PROGRESS] updateProfile - Failed to create profile:`, insertError.message);
                throw new Error(`Failed to create profile: ${insertError.message}`);
            }
            console.log(`[PROGRESS] updateProfile - Created new profile:`, JSON.stringify(insertData));
            return insertData;
        }
        console.log(`[PROGRESS] updateProfile - Success:`, JSON.stringify(updateData));
        return updateData;
    },
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== DAILY XP =====
    async saveDailyXP(userId, dailyXP) {
        console.log(`[PROGRESS] saveDailyXP - Saving ${Object.keys(dailyXP).length} entries for user: ${userId}`);
        for (const [date, xpAmount] of Object.entries(dailyXP)) {
            console.log(`[PROGRESS] saveDailyXP - Saving xp_amount: ${xpAmount} for date: ${date}`);
            const { error } = await supabase
                .from('daily_xp')
                .upsert({
                user_id: userId,
                date: date,
                xp_amount: xpAmount,
            }, {
                onConflict: 'user_id,date'
            });
            if (error) {
                console.error(`[PROGRESS] Failed to save daily XP for ${date}:`, error.message);
            }
        }
        return { success: true };
    },
    async getDailyXP(userId) {
        const { data, error } = await supabase
            .from('daily_xp')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== SYNC PROGRESS (SIMPLIFIED) =====
    async syncProgress(userId, progress) {
        console.log(`[SYNC] Starting progress sync for user: ${userId}`);
        console.log(`[SYNC] Progress data:`, JSON.stringify(progress));
        try {
            // Update profile fields
            const profileUpdates = {};
            if (progress.xp !== undefined)
                profileUpdates.xp = progress.xp;
            if (progress.streak !== undefined)
                profileUpdates.streak = progress.streak;
            if (progress.lastStudyDate !== undefined)
                profileUpdates.last_study_date = progress.lastStudyDate;
            if (Object.keys(profileUpdates).length > 0) {
                await this.updateProfile(userId, profileUpdates);
                console.log(`[SYNC] Updated profile:`, Object.keys(profileUpdates));
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
                    });
                }
                console.log(`[SYNC] Saved ${progress.completedLessons.length} completed lessons`);
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
                    });
                }
                console.log(`[SYNC] Saved ${Object.keys(progress.lessonProgress).length} lesson progress entries`);
            }
            // Handle achievements
            if (progress.achievements && progress.achievements.length > 0) {
                for (const achievementId of progress.achievements) {
                    await this.addAchievement(userId, achievementId);
                }
                console.log(`[SYNC] Added ${progress.achievements.length} achievements`);
            }
            // Handle daily XP
            if (progress.dailyXP && Object.keys(progress.dailyXP).length > 0) {
                await this.saveDailyXP(userId, progress.dailyXP);
                console.log(`[SYNC] Saved ${Object.keys(progress.dailyXP).length} daily XP entries`);
            }
            console.log(`[SYNC] Progress sync completed successfully for user: ${userId}`);
            return { success: true };
        }
        catch (error) {
            console.error(`[SYNC] Progress sync failed for user ${userId}:`, error.message);
            throw error;
        }
    },
    // ===== GET FULL PROGRESS =====
    async getFullProgress(userId) {
        console.log(`[PROGRESS] Loading full progress for user: ${userId}`);
        try {
            const [profile, lessonProgressData, dailyXPData, achievementsData, favoritesData, mistakesData, recentlyLearnedData,] = await Promise.all([
                this.getProfile(userId),
                this.getLessonProgress(userId),
                this.getDailyXP(userId),
                this.getAchievements(userId),
                this.getFavoriteWords(userId),
                this.getQuizMistakes(userId),
                this.getRecentlyLearned(userId),
            ]);
            console.log(`[PROGRESS] Loaded full progress for user: ${userId}`);
            return {
                profile,
                lessonProgress: lessonProgressData,
                dailyXP: dailyXPData,
                achievements: achievementsData,
                favorites: favoritesData,
                mistakes: mistakesData,
                recentlyLearned: recentlyLearnedData,
            };
        }
        catch (error) {
            console.error(`[PROGRESS] Failed to load progress for user ${userId}:`, error.message);
            throw error;
        }
    },
};
