import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabase } from '../utils/supabase'
import type { User, Profile } from '../types'

const JWT_SECRET = (process.env.JWT_SECRET || 'default_secret') as Secret
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const authService = {
  async signup(email: string, password: string, username: string) {
    // Check if user already exists in our custom users table first
    const { data: existingCustomUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingCustomUser) {
      throw new Error('User already exists with this email')
    }

    // Create user in Supabase auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    const userId = authUser.user.id
    
    // Insert into our custom users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password: await bcrypt.hash(password, 12),
        email_verified: false,
      })
      .select()
      .single()

    if (userError) {
      await supabase.auth.admin.deleteUser(userId)
      throw new Error(userError.message)
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
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
      await supabase.auth.admin.deleteUser(userId)
      await supabase.from('users').delete().eq('id', userId)
      throw new Error(profileError.message)
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions)

    return { user, profile, token }
  },

  async login(email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      throw new Error('Invalid email or password')
    }

    const userId = authData.user.id

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions)

    return { user: { ...user, ...profile }, token }
  },

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, email_verified')
        .eq('id', decoded.userId)
        .single()

      if (userError || !user) {
        throw new Error('User not found')
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Profile not found')
      }

      return { user: { ...user, ...profile } }
    } catch {
      throw new Error('Invalid token')
    }
  },

  async forgotPassword(email: string) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !user) {
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

      const { error: authError } = await supabase.auth.admin.updateUserById(decoded.userId, {
        password: newPassword,
      })

      if (authError) {
        throw new Error(authError.message)
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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (authError) {
      throw new Error(authError.message)
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
