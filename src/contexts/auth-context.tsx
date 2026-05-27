import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../services/api'

export interface User {
  id: string
  email: string
  username: string
  avatarUrl: string | null
  xp: number
  streak: number
  currentLevel: string
  lastStudyDate: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>
  signup: (email: string, password: string, confirmPassword: string, username: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (password: string, confirmPassword: string, token: string) => Promise<{ success: boolean; message: string }>
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadUserFromStorage = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await api.auth.getProfile()
        if (response.success) {
          setUser(response.user)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('token')
        }
      } catch {
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadUserFromStorage()
  }, [loadUserFromStorage])

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await api.auth.login({ email, password, rememberMe })
    if (response.success) {
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
    }
    return { success: response.success, message: response.message }
  }

  const signup = async (email: string, password: string, confirmPassword: string, username: string) => {
    const response = await api.auth.signup({ email, password, confirmPassword, username })
    if (response.success) {
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
    }
    return { success: response.success, message: response.message }
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch {}
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const forgotPassword = async (email: string) => {
    const response = await api.auth.forgotPassword({ email })
    return { success: response.success, message: response.message }
  }

  const resetPassword = async (password: string, confirmPassword: string, token: string) => {
    const response = await api.auth.resetPassword(password, confirmPassword, token)
    return { success: response.success, message: response.message }
  }

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const response = await api.auth.changePassword({ currentPassword, newPassword, confirmPassword })
    return { success: response.success, message: response.message }
  }

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
