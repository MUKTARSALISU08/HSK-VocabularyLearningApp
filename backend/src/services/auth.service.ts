import jwt, { type Secret } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabase } from '../utils/supabase'
import type { User, Profile } from '../types'

const JWT_SECRET = (process.env.JWT_SECRET || 'default_secret') as Secret
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const authService = {
  async signup(email: string, password: string, username: string) {
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        email_verified: false,
      })
      .select()
      .single()

    if (userError) {
      throw new Error(userError.message)
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        username,
        avatar_url: null,
        xp: 0,
        streak: 0,
        last_study_date: null,
        current_level: 'HSK 1',
      })
      .select()
      .single()

    if (profileError) {
      await supabase.from('users').delete().eq('id', user.id)
      throw new Error(profileError.message)
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)

    return { user, profile, token }
  },

  async login(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, password')
      .eq('email', email)
      .single()

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const token = jwt.sign({ userId: user.id }, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)

    return { user: { ...user, ...profile }, token }
  },

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      
      const { data: user } = await supabase
        .from('users')
        .select('id, email, email_verified')
        .eq('id', decoded.userId)
        .single()

      if (!user) {
        throw new Error('User not found')
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      return { user: { ...user, ...profile } }
    } catch {
      throw new Error('Invalid token')
    }
  },

  async forgotPassword(email: string) {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const resetToken = jwt.sign({ userId: user.id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '1h' })
    
    console.log(`Password reset token for ${email}: ${resetToken}`)

    return { message: 'Password reset email sent' }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; purpose: string }
      
      if (decoded.purpose !== 'reset') {
        throw new Error('Invalid token')
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)

      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', decoded.userId)

      if (error) {
        throw new Error(error.message)
      }

      return { message: 'Password reset successful' }
    } catch {
      throw new Error('Invalid or expired token')
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return { message: 'Password changed successfully' }
  },
}
