import { supabase } from '../utils/supabase'
import type { User, Profile } from '../types'

export const authService = {
  async signup(email: string, password: string, username: string) {
    // Check if user already exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      throw new Error('User already exists with this email')
    }

    // Create new user in Supabase Auth (trigger will auto-create profile)
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authUser.user) {
      throw new Error('Failed to create user')
    }

    const userId = authUser.user.id

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

    // Get Supabase session
    const { data: session } = await supabase.auth.getSession()

    return { 
      user: { id: userId, email }, 
      profile: updatedProfile, 
      token: session?.session?.access_token 
    }
  },

  async login(email: string, password: string) {
    // Use Supabase Auth for login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      throw new Error(`Invalid email or password: ${authError.message}`)
    }

    const userId = authData.user.id
    const token = authData.session?.access_token

    // Get profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    return { 
      user: { id: userId, email: authData.user.email, ...profile }, 
      token 
    }
  },

  async verifyToken(token: string) {
    // Verify token using Supabase Auth
    const { data: user, error } = await supabase.auth.getUser(token)

    if (error || !user.user) {
      throw new Error('Invalid token')
    }

    const userId = user.user.id

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    return { user: { id: userId, email: user.user.email, ...profile } }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    return { message: 'Logout successful' }
  },

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    
    if (error) {
      throw new Error(`Failed to send reset email: ${error.message}`)
    }

    return { message: 'Password reset email sent' }
  },

  async resetPassword(token: string, newPassword: string) {
    // Verify token first
    try {
      const { data: user } = await supabase.auth.getUser(token)
      
      if (!user.user) {
        throw new Error('Invalid token')
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw new Error(error.message)
      }

      return { message: 'Password reset successful' }
    } catch {
      throw new Error('Invalid or expired token')
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user email first
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    
    if (!userData.user?.email) {
      throw new Error('User not found')
    }

    // Verify current password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    })

    if (signInError) {
      throw new Error('Current password is incorrect')
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(error.message)
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

  async getProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      throw new Error('Profile not found')
    }

    const { data: user } = await supabase.auth.admin.getUserById(userId)

    return {
      user: {
        id: userId,
        email: user.user?.email || '',
        ...profile,
      },
    }
  },
}
