import { Request, Response } from 'express'
import { progressService } from '../services/progress.service'

export const progressController = {
  async getProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const progress = await progressService.getFullProgress(userId)
      
      res.json({ success: true, progress })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async syncProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      await progressService.syncProgress(userId, req.body)
      
      res.json({ success: true, message: 'Progress synced successfully' })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async getLessonProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const progress = await progressService.getLessonProgress(userId)
      
      res.json({ success: true, progress })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async saveLessonProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const progress = await progressService.saveLessonProgress(userId, req.body)
      
      res.json({ success: true, progress })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async getFavorites(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const favorites = await progressService.getFavoriteWords(userId)
      
      res.json({ success: true, favorites })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async addFavorite(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const favorite = await progressService.addFavoriteWord(userId, req.body)
      
      res.json({ success: true, favorite })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async removeFavorite(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const chinese = req.params.chinese
      await progressService.removeFavoriteWord(userId, chinese)
      
      res.json({ success: true, message: 'Favorite removed' })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async getQuizHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const history = await progressService.getQuizHistory(userId)
      
      res.json({ success: true, history })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async saveQuizHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const history = await progressService.saveQuizHistory(userId, req.body)
      
      res.json({ success: true, history })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async getAchievements(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const achievements = await progressService.getAchievements(userId)
      
      res.json({ success: true, achievements })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async addAchievement(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const achievementId = req.body.achievementId
      const achievement = await progressService.addAchievement(userId, achievementId)
      
      res.json({ success: true, achievement })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async getStatistics(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const statistics = await progressService.getStudyStatistics(userId)
      
      res.json({ success: true, statistics })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async updateStatistics(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const statistics = await progressService.updateStudyStatistics(userId, req.body)
      
      res.json({ success: true, statistics })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async getMistakes(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const mistakes = await progressService.getQuizMistakes(userId)
      
      res.json({ success: true, mistakes })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async addMistake(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const mistake = await progressService.addQuizMistake(userId, req.body)
      
      res.json({ success: true, mistake })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async getRecentlyLearned(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const recentlyLearned = await progressService.getRecentlyLearned(userId)
      
      res.json({ success: true, recentlyLearned })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async addRecentlyLearned(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const learned = await progressService.addRecentlyLearned(userId, req.body)
      
      res.json({ success: true, learned })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      const profile = await progressService.updateProfile(userId, req.body)
      
      res.json({ success: true, profile })
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  },
}
