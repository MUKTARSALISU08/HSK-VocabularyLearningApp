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

    // Create new user in Supabase Auth (trigger will auto-create profile)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
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
      throw new Error(`Failed to create user: ${userError.message}`)
    }

    // Wait for trigger to create profile, then fetch it
    let profile: Profile | null = null
    let attempts = 0
    const maxAttempts = 10
    
    while (!profile && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      const { data: fetchedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      profile = fetchedProfile || null
      attempts++
    }

    if (!profile) {
      await supabase.auth.admin.deleteUser(userId)
      await supabase.from('users').delete().eq('id', userId)
      throw new Error('Failed to create profile')
    }

    // Update profile with username (trigger creates empty profile)
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions)

    return { user, profile: updatedProfile, token }
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
      throw new Error('User not found in database')
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

  async uploadAvatar(userId: string, avatarBase64: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarBase64 })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update avatar: ${error.message}`)
    }

    return { data, error: null }
  },
}
