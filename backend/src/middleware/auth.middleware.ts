import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { user } = await authService.verifyToken(token)
    
    req.user = user
    
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }
}
