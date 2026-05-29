import { Router } from 'express'
import { progressController } from '../controllers/progress.controller'
import { authenticate } from '../middleware/auth.middleware'

export const progressRouter = Router()

progressRouter.get('/progress', authenticate, progressController.getProgress)
progressRouter.post('/progress/sync', authenticate, progressController.syncProgress)
progressRouter.get('/progress/lessons', authenticate, progressController.getLessonProgress)
progressRouter.post('/progress/lessons', authenticate, progressController.saveLessonProgress)
progressRouter.get('/favorites', authenticate, progressController.getFavorites)
progressRouter.post('/favorites', authenticate, progressController.addFavorite)
progressRouter.delete('/favorites/:chinese', authenticate, progressController.removeFavorite)
progressRouter.get('/quiz-history', authenticate, progressController.getQuizHistory)
progressRouter.post('/quiz-history', authenticate, progressController.saveQuizHistory)
progressRouter.get('/achievements', authenticate, progressController.getAchievements)
progressRouter.post('/achievements', authenticate, progressController.addAchievement)
progressRouter.get('/statistics', authenticate, progressController.getStatistics)
progressRouter.post('/statistics', authenticate, progressController.updateStatistics)
progressRouter.get('/mistakes', authenticate, progressController.getMistakes)
progressRouter.post('/mistakes', authenticate, progressController.addMistake)
progressRouter.delete('/mistakes', authenticate, progressController.deleteAllMistakes)

// Alias routes for quiz API
progressRouter.get('/quiz/mistakes', authenticate, progressController.getMistakes)
progressRouter.post('/quiz/mistakes', authenticate, progressController.addMistake)
progressRouter.delete('/quiz/mistakes', authenticate, progressController.deleteAllMistakes)
progressRouter.get('/recently-learned', authenticate, progressController.getRecentlyLearned)
progressRouter.post('/recently-learned', authenticate, progressController.addRecentlyLearned)
progressRouter.put('/profile', authenticate, progressController.updateProfile)
