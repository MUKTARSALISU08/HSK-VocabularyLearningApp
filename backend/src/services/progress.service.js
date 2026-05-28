import { supabase } from '../utils/supabase';
export const progressService = {
    async saveLessonProgress(userId, progress) {
        const { data, error } = await supabase
            .from('lesson_progress')
            .upsert({
            user_id: userId,
            ...progress,
        })
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
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
    async saveQuizHistory(userId, history) {
        const { data, error } = await supabase
            .from('quiz_history')
            .insert({
            user_id: userId,
            ...history,
            completed_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
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
    async addFavoriteWord(userId, word) {
        const { data, error } = await supabase
            .from('favorite_words')
            .insert({
            user_id: userId,
            ...word,
        })
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
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
            .eq('user_id', userId);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async addAchievement(userId, achievementId) {
        const { data: existing } = await supabase
            .from('achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('achievement_id', achievementId)
            .single();
        if (existing) {
            return existing;
        }
        const { data, error } = await supabase
            .from('achievements')
            .insert({
            user_id: userId,
            achievement_id: achievementId,
            unlocked_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
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
    async updateStudyStatistics(userId, stats) {
        const today = new Date().toDateString();
        const { data: existing } = await supabase
            .from('study_statistics')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();
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
                .single();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        }
        const { data, error } = await supabase
            .from('study_statistics')
            .insert({
            user_id: userId,
            ...stats,
            date: today,
        })
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
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
    async addQuizMistake(userId, mistake) {
        const { data, error } = await supabase
            .from('quiz_mistakes')
            .insert({
            user_id: userId,
            ...mistake,
        })
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
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
    async addRecentlyLearned(userId, word) {
        const { data: existing } = await supabase
            .from('recently_learned')
            .select('id')
            .eq('user_id', userId)
            .eq('word_chinese', word.word_chinese)
            .single();
        if (existing) {
            const { data, error } = await supabase
                .from('recently_learned')
                .update({ learned_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        }
        const { data, error } = await supabase
            .from('recently_learned')
            .insert({
            user_id: userId,
            ...word,
            learned_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async getRecentlyLearned(userId) {
        const { data, error } = await supabase
            .from('recently_learned')
            .select('*')
            .eq('user_id', userId)
            .order('learned_at', { ascending: false })
            .limit(10);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async syncProgress(userId, progress) {
        const promises = [];
        if (progress.xp !== undefined) {
            promises.push(this.updateProfile(userId, { xp: progress.xp }));
        }
        if (progress.streak !== undefined) {
            promises.push(this.updateProfile(userId, { streak: progress.streak }));
        }
        if (progress.lastStudyDate !== undefined) {
            promises.push(this.updateProfile(userId, { last_study_date: progress.lastStudyDate }));
        }
        if (progress.lessonProgress) {
            progress.lessonProgress.forEach(p => {
                promises.push(this.saveLessonProgress(userId, p));
            });
        }
        if (progress.favorites) {
            progress.favorites.forEach(f => {
                promises.push(this.addFavoriteWord(userId, f));
            });
        }
        if (progress.quizHistory) {
            progress.quizHistory.forEach(q => {
                promises.push(this.saveQuizHistory(userId, q));
            });
        }
        if (progress.achievements) {
            progress.achievements.forEach(a => {
                promises.push(this.addAchievement(userId, a));
            });
        }
        if (progress.quizMistakes) {
            progress.quizMistakes.forEach(m => {
                promises.push(this.addQuizMistake(userId, m));
            });
        }
        if (progress.recentlyLearned) {
            progress.recentlyLearned.forEach(r => {
                promises.push(this.addRecentlyLearned(userId, r));
            });
        }
        await Promise.all(promises);
        return { success: true };
    },
    async getFullProgress(userId) {
        const [profile, lessonProgress, favorites, quizHistory, achievements, statistics, mistakes, recentlyLearned,] = await Promise.all([
            supabase.from('profiles').select('*').eq('user_id', userId).single(),
            supabase.from('lesson_progress').select('*').eq('user_id', userId),
            supabase.from('favorite_words').select('*').eq('user_id', userId),
            supabase.from('quiz_history').select('*').eq('user_id', userId).order('completed_at', { ascending: false }),
            supabase.from('achievements').select('*').eq('user_id', userId),
            supabase.from('study_statistics').select('*').eq('user_id', userId).order('date', { ascending: false }),
            supabase.from('quiz_mistakes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('recently_learned').select('*').eq('user_id', userId).order('learned_at', { ascending: false }).limit(10),
        ]);
        return {
            profile: profile.data,
            lessonProgress: lessonProgress.data,
            favorites: favorites.data,
            quizHistory: quizHistory.data,
            achievements: achievements.data,
            statistics: statistics.data,
            mistakes: mistakes.data,
            recentlyLearned: recentlyLearned.data,
        };
    },
};
