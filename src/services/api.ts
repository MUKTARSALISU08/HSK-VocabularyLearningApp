const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  }
}

// Helper function to handle user not found errors
const handleUserNotFound = () => {
  localStorage.removeItem('token')
  // Trigger a page reload to reset state
  window.location.href = '/login'
}

export const api = {
  auth: {
    signup: async (data: { email: string; password: string; confirmPassword: string; username: string }) => {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    login: async (data: { email: string; password: string; rememberMe?: boolean }) => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    logout: async () => {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      return response.json()
    },

    forgotPassword: async (data: { email: string }) => {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    resetPassword: async (password: string, _confirmPassword: string, token: string) => {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      return response.json()
    },

    changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const response = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return response.json()
    },

    uploadAvatar: async (data: { avatarBase64: string }) => {
      const response = await fetch(`${BASE_URL}/auth/avatar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return response.json()
    },

    getProfile: async () => {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return response.json()
    },
  },

  progress: {
    getProgress: async () => {
      const response = await fetch(`${BASE_URL}/progress`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const result = await response.json()
      // Handle user not found error
      if (result.message && result.message.includes('does not exist in auth.users')) {
        handleUserNotFound()
      }
      return result
    },

    syncProgress: async (data: any) => {
      const response = await fetch(`${BASE_URL}/progress/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      const result = await response.json()
      // Handle user not found error
      if (result.message && result.message.includes('does not exist in auth.users')) {
        handleUserNotFound()
      }
      return result
    },

    getFavorites: async () => {
      const response = await fetch(`${BASE_URL}/favorites`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return response.json()
    },

    addFavorite: async (data: { chinese: string; pinyin: string | null; english: string; level: string }) => {
      const response = await fetch(`${BASE_URL}/favorites`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return response.json()
    },

    removeFavorite: async (chinese: string) => {
      const response = await fetch(`${BASE_URL}/favorites/${encodeURIComponent(chinese)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return response.json()
    },

    updateProfile: async (data: { xp?: number; streak?: number; last_study_date?: string | null; current_level?: string }) => {
      const response = await fetch(`${BASE_URL}/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return response.json()
    },
  },

  quiz: {
    getMistakes: async () => {
      const response = await fetch(`${BASE_URL}/quiz/mistakes`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return response.json()
    },

    addMistake: async (mistake: any) => {
      const response = await fetch(`${BASE_URL}/quiz/mistakes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(mistake),
      })
      return response.json()
    },

    clearMistakes: async () => {
      const response = await fetch(`${BASE_URL}/quiz/mistakes`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return response.json()
    },
  },
}
