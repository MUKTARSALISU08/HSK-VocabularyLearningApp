import { Route, Switch } from 'wouter'
import { Layout } from '@/components/layout/layout'
import { AppProvider } from '@/components/providers/app-provider'
import { ProtectedRoute } from '@/components/protected-route'
import { Dashboard } from '@/pages/dashboard/dashboard'
import { LessonsPage } from '@/pages/lessons/lessons-page'
import { LessonDetailPage } from '@/pages/lessons/lesson-detail-page'
import { QuizPage } from '@/pages/quiz/quiz-page'
import { ChallengePage } from '@/pages/challenge/challenge-page'
import { StatsPage } from '@/pages/stats/stats-page'
import { FavoritesPage } from '@/pages/favorites/favorites-page'
import { SearchPage } from '@/pages/search/search-page'
import { SignupPage } from '@/pages/auth/signup-page'
import { LoginPage } from '@/pages/auth/login-page'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password-page'
import { ResetPasswordPage } from '@/pages/auth/reset-password-page'
import { ProfilePage } from '@/pages/profile/profile-page'

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AppProvider>
      <Switch>
        <Route path="/signup" component={SignupPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        
        <Route path="/search">
          <ProtectedLayout>
            <SearchPage />
          </ProtectedLayout>
        </Route>
        
        <Route path="/lessons/:id">
          <ProtectedLayout>
            <LessonDetailPage />
          </ProtectedLayout>
        </Route>
        
        <Route path="/lessons">
          <ProtectedLayout>
            <LessonsPage />
          </ProtectedLayout>
        </Route>
        
        <Route path="/quiz/:lessonId?">
          <ProtectedLayout>
            <QuizPage />
          </ProtectedLayout>
        </Route>
        
        <Route path="/challenge">
          <ProtectedLayout>
            <ChallengePage />
          </ProtectedLayout>
        </Route>
        
        <Route path="/stats">
          <ProtectedLayout>
            <StatsPage />
          </ProtectedLayout>
        </Route>
        
        <Route path="/favorites">
          <ProtectedLayout>
            <FavoritesPage />
          </ProtectedLayout>
        </Route>
        
        <Route path="/profile">
          <ProtectedLayout>
            <ProfilePage />
          </ProtectedLayout>
        </Route>
        
        <Route path="/">
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        </Route>
      </Switch>
    </AppProvider>
  )
}

export default App
