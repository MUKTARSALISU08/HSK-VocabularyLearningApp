import { supabase, supabaseAuth } from '../utils/supabase';
// Helper function to verify user exists in auth.users
async function verifyUserExists(userId) {
    try {
        const { data, error } = await supabaseAuth.auth.admin.getUserById(userId);
        if (error || !data.user) {
            console.log(`[PROGRESS] verifyUserExists - User not found in auth.users: ${userId}`);
            return false;
        }
        console.log(`[PROGRESS] verifyUserExists - User found in auth.users: ${userId}`);
        return true;
    }
    catch (error) {
        console.error(`[PROGRESS] verifyUserExists - Error checking user:`, error);
        return false;
    }
}
export const progressService = {
    // ===== LESSON PROGRESS =====
    async saveLessonProgress(userId, progress) {
        console.log(`[PROGRESS] saveLessonProgress - User ID: ${userId}`);
        console.log(`[PROGRESS] saveLessonProgress - Progress data:`, JSON.stringify(progress));
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
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
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
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
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
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
    async unlockAchievement(userId, achievementId) {
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
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
            .eq('user_id', userId)
            .order('unlocked_at', { ascending: false });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== STUDY STATISTICS =====
    async saveStudyStatistics(userId, stats) {
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
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
    async saveQuizMistake(userId, mistake) {
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
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
    // ===== RECENTLY LEARNED =====
    async addRecentlyLearned(userId, word) {
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
        const { data, error } = await supabase
            .from('recently_learned')
            .upsert({
            user_id: userId,
            ...word,
            learned_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,word_chinese'
        })
            .select();
        if (error) {
            throw new Error(error.message);
        }
        return data?.[0] || data;
    },
    async getRecentlyLearned(userId) {
        const { data, error } = await supabase
            .from('recently_learned')
            .select('*')
            .eq('user_id', userId)
            .order('learned_at', { ascending: false })
            .limit(20);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    // ===== DAILY XP =====
    async saveDailyXP(userId, date, xpAmount) {
        console.log(`[PROGRESS] saveDailyXP - User ID: ${userId}, Date: ${date}, XP: ${xpAmount}`);
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
        const { data, error } = await supabase
            .from('daily_xp')
            .upsert({
            user_id: userId,
            date: date,
            xp_amount: xpAmount,
        }, {
            onConflict: 'user_id,date'
        })
            .select();
        if (error) {
            console.error(`[PROGRESS] saveDailyXP - Error:`, error.message);
            throw new Error(error.message);
        }
        console.log(`[PROGRESS] saveDailyXP - Success, data:`, JSON.stringify(data?.[0] || data));
        return data?.[0] || data;
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
    // ===== PROFILE =====
    async updateProfile(userId, updates) {
        console.log(`[PROGRESS] updateProfile - User ID: ${userId}, updates:`, JSON.stringify(updates));
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
        // First, try to update existing profile
        const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        if (fetchError) {
            console.error(`[PROGRESS] updateProfile - Error fetching profile:`, fetchError.message);
            throw new Error(fetchError.message);
        }
        if (existingProfile) {
            // Update existing profile
            const { data, error } = await supabase
                .from('profiles')
                .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
                .eq('user_id', userId)
                .select()
                .maybeSingle();
            if (error) {
                console.error(`[PROGRESS] updateProfile - Error updating profile:`, error.message);
                throw new Error(error.message);
            }
            console.log(`[PROGRESS] updateProfile - Updated profile:`, JSON.stringify(data));
            return data;
        }
        else {
            // Create new profile
            console.log(`[PROGRESS] updateProfile - Profile not found, creating new one for user: ${userId}`);
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                user_id: userId,
                ...updates,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .select()
                .maybeSingle();
            if (error) {
                console.error(`[PROGRESS] updateProfile - Failed to create profile:`, error.message);
                throw new Error(error.message);
            }
            console.log(`[PROGRESS] updateProfile - Created profile:`, JSON.stringify(data));
            return data;
        }
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
    // ===== FULL PROGRESS SYNC =====
    async syncProgress(userId, progressData) {
        console.log(`[SYNC] Starting progress sync for user: ${userId}`);
        console.log(`[SYNC] Progress data:`, JSON.stringify(progressData));
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
        try {
            // Update profile (xp, streak, last_study_date)
            if (progressData.xp !== undefined || progressData.streak !== undefined || progressData.lastStudyDate) {
                const profileUpdates = {};
                if (progressData.xp !== undefined) {
                    profileUpdates.xp = progressData.xp;
                    console.log(`[SYNC] Updating XP: ${progressData.xp}`);
                }
                if (progressData.streak !== undefined) {
                    profileUpdates.streak = progressData.streak;
                    console.log(`[SYNC] Updating streak: ${progressData.streak}`);
                }
                if (progressData.lastStudyDate) {
                    profileUpdates.last_study_date = progressData.lastStudyDate;
                    console.log(`[SYNC] Updating last study date: ${progressData.lastStudyDate}`);
                }
                await this.updateProfile(userId, profileUpdates);
                console.log(`[SYNC] Updated profile:`, Object.keys(profileUpdates));
            }
            // Save lesson progress
            if (progressData.lessonProgress) {
                const lessonEntries = Object.entries(progressData.lessonProgress);
                console.log(`[SYNC] Processing ${lessonEntries.length} lesson progress entries`);
                for (const [lessonId, progress] of lessonEntries) {
                    try {
                        await this.saveLessonProgress(userId, {
                            lesson_id: lessonId,
                            words_learned: progress.wordsLearned || 0,
                            total_words: progress.totalWords || 0,
                            is_completed: progress.isCompleted || false,
                            quiz_score: progress.quizScore || null,
                            last_studied: progress.lastStudied || null,
                        });
                        console.log(`[SYNC] Saved lesson progress for ${lessonId}`);
                    }
                    catch (error) {
                        console.error(`[SYNC] Failed to save lesson progress for ${lessonId}:`, error);
                        throw error;
                    }
                }
            }
            // Save daily XP
            if (progressData.dailyXP) {
                const dailyXPEntries = Object.entries(progressData.dailyXP);
                console.log(`[SYNC] Processing ${dailyXPEntries.length} daily XP entries`);
                for (const [date, xp] of dailyXPEntries) {
                    try {
                        await this.saveDailyXP(userId, date, xp);
                        console.log(`[SYNC] Saved daily XP for ${date}: ${xp}`);
                    }
                    catch (error) {
                        console.error(`[SYNC] Failed to save daily XP for ${date}:`, error);
                        throw error;
                    }
                }
            }
            // Save achievements
            if (progressData.achievements && progressData.achievements.length > 0) {
                console.log(`[SYNC] Processing ${progressData.achievements.length} achievements`);
                for (const achievementId of progressData.achievements) {
                    try {
                        await this.unlockAchievement(userId, achievementId);
                        console.log(`[SYNC] Saved achievement: ${achievementId}`);
                    }
                    catch (error) {
                        console.error(`[SYNC] Failed to save achievement ${achievementId}:`, error);
                        // Don't throw error for achievements, just log it
                    }
                }
            }
            // Save favorite words
            if (progressData.favoriteWords && progressData.favoriteWords.length > 0) {
                console.log(`[SYNC] Processing ${progressData.favoriteWords.length} favorite words`);
                for (const word of progressData.favoriteWords) {
                    try {
                        await this.addFavoriteWord(userId, {
                            chinese: word.chinese,
                            pinyin: word.pinyin || null,
                            english: word.english,
                            level: word.level,
                        });
                        console.log(`[SYNC] Saved favorite word: ${word.chinese}`);
                    }
                    catch (error) {
                        console.error(`[SYNC] Failed to save favorite word ${word.chinese}:`, error);
                        // Don't throw error for favorites, just log it
                    }
                }
            }
            // Save quiz mistakes
            if (progressData.quizMistakes && progressData.quizMistakes.length > 0) {
                console.log(`[SYNC] Processing ${progressData.quizMistakes.length} quiz mistakes`);
                for (const mistake of progressData.quizMistakes) {
                    try {
                        await this.saveQuizMistake(userId, {
                            lesson_id: mistake.lessonId,
                            word_chinese: mistake.word.chinese,
                            word_pinyin: mistake.word.pinyin || null,
                            word_english: mistake.word.english,
                            your_answer: mistake.yourAnswer,
                            correct_answer: mistake.correctAnswer,
                            level: mistake.level,
                        });
                        console.log(`[SYNC] Saved quiz mistake for: ${mistake.word.chinese}`);
                    }
                    catch (error) {
                        console.error(`[SYNC] Failed to save quiz mistake for ${mistake.word.chinese}:`, error);
                        // Don't throw error for mistakes, just log it
                    }
                }
            }
            console.log(`[SYNC] Progress sync completed successfully for user: ${userId}`);
            return { success: true };
        }
        catch (error) {
            console.error(`[SYNC] Progress sync failed for user ${userId}:`, error);
            throw error;
        }
    },
    // ===== LOAD FULL PROGRESS =====
    async loadFullProgress(userId) {
        console.log(`[PROGRESS] Loading full progress for user: ${userId}`);
        // Verify user exists in auth.users
        const userExists = await verifyUserExists(userId);
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in auth.users. Please logout and login again.`);
        }
        try {
            // Get profile
            const profile = await this.getProfile(userId);
            // Get lesson progress
            const lessonProgress = await this.getLessonProgress(userId);
            // Get daily XP
            const dailyXP = await this.getDailyXP(userId);
            // Get achievements
            const achievements = await this.getAchievements(userId);
            // Get favorite words
            const favoriteWords = await this.getFavoriteWords(userId);
            // Get recently learned
            const recentlyLearned = await this.getRecentlyLearned(userId);
            // Get quiz history
            const quizHistory = await this.getQuizHistory(userId);
            // Get quiz mistakes
            const quizMistakes = await this.getQuizMistakes(userId);
            // Get study statistics
            const studyStatistics = await this.getStudyStatistics(userId);
            console.log(`[PROGRESS] Loaded full progress for user: ${userId}`);
            // Transform lessonProgress from array to object keyed by lesson_id
            const lessonProgressObj = {};
            for (const lp of lessonProgress) {
                lessonProgressObj[lp.lesson_id] = {
                    lessonId: lp.lesson_id,
                    wordsLearned: lp.words_learned,
                    totalWords: lp.total_words,
                    isCompleted: lp.is_completed,
                    quizScore: lp.quiz_score,
                    lastStudied: lp.last_studied,
                };
            }
            // Extract completed lessons from lessonProgress
            const completedLessons = lessonProgress
                .filter(lp => lp.is_completed)
                .map(lp => lp.lesson_id);
            // Transform dailyXP from array to object keyed by date (format matching frontend's toDateString())
            const dailyXPObj = {};
            for (const xp of dailyXP) {
                const dateStr = new Date(xp.date).toDateString();
                dailyXPObj[dateStr] = xp.xp_amount;
            }
            console.log(`[PROGRESS] loadFullProgress - dailyXP transformed:`, JSON.stringify(dailyXPObj));
            // Transform favorite words to match frontend FavoriteWord interface
            const transformedFavorites = favoriteWords.map(fw => ({
                chinese: fw.chinese,
                pinyin: fw.pinyin,
                english: fw.english,
                level: fw.level,
                lessonId: fw.lesson_id || '',
                addedAt: fw.created_at || new Date().toISOString(),
            }));
            // Transform quiz mistakes to match frontend QuizMistake interface
            const transformedMistakes = quizMistakes.map(qm => ({
                word: {
                    chinese: qm.word_chinese,
                    pinyin: qm.word_pinyin,
                    english: qm.word_english,
                },
                yourAnswer: qm.your_answer,
                correctAnswer: qm.correct_answer,
                level: qm.level,
                lessonId: qm.lesson_id,
                date: qm.created_at || new Date().toISOString(),
            }));
            console.log(`[PROGRESS] loadFullProgress - Transformed favorites count: ${transformedFavorites.length}`);
            console.log(`[PROGRESS] loadFullProgress - Transformed mistakes count: ${transformedMistakes.length}`);
            return {
                profile,
                lessonProgress: lessonProgressObj,
                dailyXP: dailyXPObj,
                completedLessons,
                achievements,
                favorites: transformedFavorites,
                mistakes: transformedMistakes,
                recentlyLearned,
                quizHistory,
                quizMistakes: transformedMistakes,
                studyStatistics,
            };
        }
        catch (error) {
            console.error(`[PROGRESS] Failed to load progress for user ${userId}:`, error);
            throw error;
        }
    },
};
