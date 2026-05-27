import { Request, Response } from 'express'
import { z } from 'zod'
import { authService } from '../services/auth.service'
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../schemas/auth'

export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const validated = signupSchema.parse(req.body)
      
      const result = await authService.signup(validated.email, validated.password, validated.username)
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.profile.username,
          avatarUrl: result.profile.avatar_url,
          xp: result.profile.xp,
          streak: result.profile.streak,
          currentLevel: result.profile.current_level,
        },
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : (error as Error).message,
      })
    }
  },

  async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body)
      
      const result = await authService.login(validated.email, validated.password)
      
      const expiresIn = validated.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
      
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: expiresIn,
      })
      
      res.json({
        success: true,
        message: 'Login successful',
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          avatarUrl: result.user.avatar_url,
          xp: result.user.xp,
          streak: result.user.streak,
          currentLevel: result.user.current_level,
        },
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : (error as Error).message,
      })
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('token')
    res.json({ success: true, message: 'Logout successful' })
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const validated = forgotPasswordSchema.parse(req.body)
      
      await authService.forgotPassword(validated.email)
      
      res.json({ success: true, message: 'Password reset email sent' })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : (error as Error).message,
      })
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const validated = resetPasswordSchema.parse(req.body)
      const token = req.query.token as string
      
      await authService.resetPassword(token, validated.password)
      
      res.json({ success: true, message: 'Password reset successful' })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : (error as Error).message,
      })
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const validated = changePasswordSchema.parse(req.body)
      const userId = req.user?.id as string
      
      await authService.changePassword(userId, validated.currentPassword, validated.newPassword)
      
      res.json({ success: true, message: 'Password changed successfully' })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : (error as Error).message,
      })
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string
      
      const { user } = await authService.verifyToken(req.headers.authorization?.split(' ')[1] || '')
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatar_url,
          xp: user.xp,
          streak: user.streak,
          currentLevel: user.current_level,
          lastStudyDate: user.last_study_date,
        },
      })
    } catch (error) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
    }
  },
}
