import { type ReactNode } from 'react'
import { ProgressProvider } from '@/contexts/progress-context'
import { AuthProvider } from '@/contexts/auth-context'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </AuthProvider>
  )
}
