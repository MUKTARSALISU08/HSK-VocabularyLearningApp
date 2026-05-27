import { progressService } from '../services/progress.service';
export const progressController = {
    async getProgress(req, res) {
        try {
            const userId = req.user?.id;
            const progress = await progressService.getFullProgress(userId);
            res.json({ success: true, progress });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async syncProgress(req, res) {
        try {
            const userId = req.user?.id;
            await progressService.syncProgress(userId, req.body);
            res.json({ success: true, message: 'Progress synced successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getLessonProgress(req, res) {
        try {
            const userId = req.user?.id;
            const progress = await progressService.getLessonProgress(userId);
            res.json({ success: true, progress });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async saveLessonProgress(req, res) {
        try {
            const userId = req.user?.id;
            const progress = await progressService.saveLessonProgress(userId, req.body);
            res.json({ success: true, progress });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getFavorites(req, res) {
        try {
            const userId = req.user?.id;
            const favorites = await progressService.getFavoriteWords(userId);
            res.json({ success: true, favorites });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async addFavorite(req, res) {
        try {
            const userId = req.user?.id;
            const favorite = await progressService.addFavoriteWord(userId, req.body);
            res.json({ success: true, favorite });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async removeFavorite(req, res) {
        try {
            const userId = req.user?.id;
            const chinese = req.params.chinese;
            await progressService.removeFavoriteWord(userId, chinese);
            res.json({ success: true, message: 'Favorite removed' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getQuizHistory(req, res) {
        try {
            const userId = req.user?.id;
            const history = await progressService.getQuizHistory(userId);
            res.json({ success: true, history });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async saveQuizHistory(req, res) {
        try {
            const userId = req.user?.id;
            const history = await progressService.saveQuizHistory(userId, req.body);
            res.json({ success: true, history });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getAchievements(req, res) {
        try {
            const userId = req.user?.id;
            const achievements = await progressService.getAchievements(userId);
            res.json({ success: true, achievements });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async addAchievement(req, res) {
        try {
            const userId = req.user?.id;
            const achievementId = req.body.achievementId;
            const achievement = await progressService.addAchievement(userId, achievementId);
            res.json({ success: true, achievement });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getStatistics(req, res) {
        try {
            const userId = req.user?.id;
            const statistics = await progressService.getStudyStatistics(userId);
            res.json({ success: true, statistics });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async updateStatistics(req, res) {
        try {
            const userId = req.user?.id;
            const statistics = await progressService.updateStudyStatistics(userId, req.body);
            res.json({ success: true, statistics });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getMistakes(req, res) {
        try {
            const userId = req.user?.id;
            const mistakes = await progressService.getQuizMistakes(userId);
            res.json({ success: true, mistakes });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async addMistake(req, res) {
        try {
            const userId = req.user?.id;
            const mistake = await progressService.addQuizMistake(userId, req.body);
            res.json({ success: true, mistake });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getRecentlyLearned(req, res) {
        try {
            const userId = req.user?.id;
            const recentlyLearned = await progressService.getRecentlyLearned(userId);
            res.json({ success: true, recentlyLearned });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async addRecentlyLearned(req, res) {
        try {
            const userId = req.user?.id;
            const learned = await progressService.addRecentlyLearned(userId, req.body);
            res.json({ success: true, learned });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            const profile = await progressService.updateProfile(userId, req.body);
            res.json({ success: true, profile });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};
