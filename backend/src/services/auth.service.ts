import { supabaseAuth, supabase } from '../utils/supabase'
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
    const { data: authUser, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (authError) {
      // Handle rate limiting error
      if (authError.message.includes('request this after')) {
        throw new Error('Too many signup attempts. Please try again later.')
      }
      throw new Error(`Failed to create account: ${authError.message}`)
    }

    // Wait for user to be available (handle async user creation)
    let userId: string | null = authUser.user?.id || null
    let userCheckAttempts = 0
    
    while (!userId && userCheckAttempts < 5) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const { data: sessionData } = await supabaseAuth.auth.getSession()
      userId = sessionData?.session?.user.id || null
      userCheckAttempts++
    }

    if (!userId) {
      throw new Error('Failed to create user')
    }

    // NOTE: Email verification is required - do NOT auto-confirm emails
    // Users must verify their email before logging in
    // Supabase will send verification email automatically

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
        .maybeSingle()
      profile = fetchedProfile || null
      attempts++
    }

    if (!profile) {
      await supabaseAuth.auth.admin.deleteUser(userId)
      throw new Error('Failed to create profile')
    }

    // Update profile with username (trigger creates empty profile)
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('user_id', userId)
      .select()
      .maybeSingle()

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    // Get Supabase session - but this will be null since email isn't confirmed yet
    const { data: session } = await supabaseAuth.auth.getSession()

    // Return success but NO token - user must verify email first
    return { 
      user: { id: userId, email }, 
      profile: updatedProfile, 
      token: null // Do not return token - email must be verified first
    }
  },

  async login(email: string, password: string): Promise<{ user: { id: string; email: string; [key: string]: any }; token: string | undefined }> {
    let authData = await supabaseAuth.auth.signInWithPassword({ email, password })
    
    // Handle email not confirmed error - SECURITY: Do NOT auto-confirm emails
    // Users must verify their email before logging in
    if (authData.error && authData.error.message.includes('Email not confirmed')) {
      throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.')
    }

    // Check for errors after retry
    if (authData.error) {
      throw new Error(`Invalid email or password: ${authData.error.message}`)
    }

    const userId = authData.data.user.id
    const token = authData.data.session?.access_token

    // Get profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    // Destructure profile to exclude its id field, keeping only auth user id
    const { id: _profileId, ...profileData } = profile
    return { 
      user: { id: userId, email: authData.data.user.email, ...profileData }, 
      token 
    }
  },

  async verifyToken(token: string) {
    // Verify token using Supabase Auth
    const { data: user, error } = await supabaseAuth.auth.getUser(token)

    if (error || !user.user) {
      throw new Error('Invalid token')
    }

    const userId = user.user.id

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    // Destructure profile to exclude its id field, keeping only auth user id
    const { id: _profileId, ...profileData } = profile
    return { user: { id: userId, email: user.user.email, ...profileData } }
  },

  async logout() {
    const { error } = await supabaseAuth.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    return { message: 'Logout successful' }
  },

  async forgotPassword(email: string) {
    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email)
    
    if (error) {
      throw new Error(`Failed to send reset email: ${error.message}`)
    }

    return { message: 'Password reset email sent' }
  },

  async resetPassword(token: string, newPassword: string) {
    // Verify token first
    try {
      const { data: user } = await supabaseAuth.auth.getUser(token)
      
      if (!user.user) {
        throw new Error('Invalid token')
      }

      // Update password
      const { error } = await supabaseAuth.auth.updateUser({
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
    const { data: userData } = await supabaseAuth.auth.admin.getUserById(userId)
    
    if (!userData.user?.email) {
      throw new Error('User not found')
    }

    // Verify current password by signing in
    const { error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    })

    if (signInError) {
      throw new Error('Current password is incorrect')
    }

    // Update password
    const { error } = await supabaseAuth.auth.updateUser({
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
      .maybeSingle()

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
      .maybeSingle()

    if (error || !profile) {
      throw new Error('Profile not found')
    }

    const { data: user } = await supabaseAuth.auth.admin.getUserById(userId)

    // Destructure profile to exclude its id field, keeping only auth user id
    const { id: _profileId, ...profileData } = profile
    return {
      user: {
        id: userId,
        email: user.user?.email || '',
        ...profileData,
      },
    }
  },
}
