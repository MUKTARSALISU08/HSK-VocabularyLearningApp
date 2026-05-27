import { useProgress } from '@/contexts/progress-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Flame, Zap, Trophy, BookOpen, Target, TrendingUp, Calendar, Star } from 'lucide-react'
import { Link } from 'wouter'
import { hsk1Lessons } from '@/data/hsk1'
import { hsk2Lessons } from '@/data/hsk2'
import { hsk3Lessons } from '@/data/hsk3'

export function Dashboard() {
  const { progress, isSyncing } = useProgress()
  const { user, isAuthenticated } = useAuth()

  const totalLessons = hsk1Lessons.length + hsk2Lessons.length + hsk3Lessons.length
  const completedCount = progress.completedLessons.length
  const completionPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

  const wordsLearned = Object.values(progress.lessonProgress).reduce(
    (acc, curr) => acc + (curr?.wordsLearned || 0),
    0
  )
  const totalWords = hsk1Lessons.reduce((acc, l) => acc + l.words.length, 0) +
    hsk2Lessons.reduce((acc, l) => acc + l.words.length, 0) +
    hsk3Lessons.reduce((acc, l) => acc + l.words.length, 0)

  const currentLevel = progress.xp < 500 ? 'HSK 1' : progress.xp < 1500 ? 'HSK 2' : 'HSK 3'
  const xpToNextLevel = progress.xp < 500 ? 500 - progress.xp : progress.xp < 1500 ? 1500 - progress.xp : 3000 - progress.xp

  const recentLessons = progress.completedLessons.slice(-3).map(id => {
    const allLessons = [...hsk1Lessons, ...hsk2Lessons, ...hsk3Lessons]
    return allLessons.find(l => l.id === id)
  }).filter(Boolean)

  const allLessons = [...hsk1Lessons, ...hsk2Lessons, ...hsk3Lessons]
  const inProgressLessons = allLessons
    .filter(l => progress.lessonProgress[l.id] && !progress.completedLessons.includes(l.id))
    .slice(0, 3)

  const getWeeklyXP = () => {
    const today = new Date()
    let total = 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      total += progress.dailyXP[dateStr] || 0
    }
    return total
  }

  const getDailyGoal = () => {
    const today = new Date().toDateString()
    return progress.dailyXP[today] || 0
  }

  const dailyGoal = 100
  const dailyProgress = Math.min((getDailyGoal() / dailyGoal) * 100, 100)

  const weeklyXP = getWeeklyXP()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isAuthenticated ? `${getGreeting()}, ${user?.username || 'Learner'}!` : 'Welcome Back!'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAuthenticated 
              ? "Here's your learning summary for today" 
              : 'Continue your Chinese learning journey'}
          </p>
        </div>
        {isSyncing && (
          <Badge variant="outline" className="text-xs">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-1" />
            Syncing...
          </Badge>
        )}
      </div>

      {isAuthenticated && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">Daily Goal: {getDailyGoal()} / {dailyGoal} XP</span>
              </div>
              <Progress value={dailyProgress} className="h-2 flex-1 min-w-[200px]" />
              {dailyProgress >= 100 && (
                <Badge variant="success" className="gap-1">
                  <Star className="h-3 w-3" />
                  Goal achieved!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-500">Daily Streak</CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{progress.streak}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{progress.xp.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated && user?.xp ? `+${progress.xp - user.xp} today` : currentLevel} Level
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Lessons Done</CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{completedCount}/{totalLessons}</div>
            <Progress value={completionPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Words Learned</CardTitle>
            <BookOpen className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{wordsLearned}/{totalWords}</div>
            <p className="text-xs text-muted-foreground">vocabulary words</p>
          </CardContent>
        </Card>
      </div>

      {isAuthenticated && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-500">Weekly XP</CardTitle>
              <Calendar className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyXP.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">last 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">This Week</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(weeklyXP / 7)}</div>
              <p className="text-xs text-muted-foreground">avg XP per day</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-pink-500">Favorites</CardTitle>
              <Star className="h-5 w-5 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.favoriteWords.length}</div>
              <p className="text-xs text-muted-foreground">saved words</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-cyan-500">Mistakes</CardTitle>
              <BookOpen className="h-5 w-5 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.quizMistakes.length}</div>
              <p className="text-xs text-muted-foreground">to review</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressLessons.length > 0 ? (
              inProgressLessons.map((lesson) => lesson && (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-medium truncate">{lesson.level} - Lesson {lesson.lessonNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {progress.lessonProgress[lesson.id]?.wordsLearned || 0}/{lesson.words.length} words
                      </p>
                    </div>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                </Link>
              ))
            ) : recentLessons.length > 0 ? (
              recentLessons.map((lesson) => lesson && (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-medium truncate">{lesson.level} - Lesson {lesson.lessonNumber}</p>
                      <p className="text-sm text-muted-foreground">{lesson.words.length} words</p>
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <Link href="/lessons">
                <div className="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium truncate">Start your journey</p>
                    <p className="text-sm text-muted-foreground">Begin with HSK 1 Lesson 1</p>
                  </div>
                  <Badge>Start</Badge>
                </div>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/lessons">
              <div className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer">
                <BookOpen className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Continue Lessons</p>
                  <p className="text-sm text-muted-foreground">Learn new vocabulary</p>
                </div>
              </div>
            </Link>
            <Link href="/challenge">
              <div className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer">
                <Target className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Take a Quiz</p>
                  <p className="text-sm text-muted-foreground">Test your knowledge</p>
                </div>
              </div>
            </Link>
            <Link href="/favorites">
              <div className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer">
                <Star className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Review Favorites</p>
                  <p className="text-sm text-muted-foreground">{progress.favoriteWords.length} saved words</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">{currentLevel}</span>
                <span className="text-muted-foreground">{progress.xp} / {progress.xp < 1500 ? 1500 : 3000} XP</span>
              </div>
              <Progress value={(progress.xp % 1000) / 10} className="h-3" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                {xpToNextLevel} XP needed to {progress.xp < 500 ? 'reach HSK 2' : progress.xp < 1500 ? 'reach HSK 3' : 'max level'}
              </p>
              {progress.achievements.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  {progress.achievements.length} Achievements
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
