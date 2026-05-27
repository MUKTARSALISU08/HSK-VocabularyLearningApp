import { useProgress } from '@/contexts/progress-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Trophy,
  Flame,
  Zap,
  BookOpen,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { hsk1Lessons } from '@/data/hsk1'
import { hsk2Lessons } from '@/data/hsk2'
import { hsk3Lessons } from '@/data/hsk3'
import { cn } from '@/lib/utils'

const totalLessons = hsk1Lessons.length + hsk2Lessons.length + hsk3Lessons.length
const totalWords = hsk1Lessons.reduce((acc, l) => acc + l.words.length, 0) +
  hsk2Lessons.reduce((acc, l) => acc + l.words.length, 0) +
  hsk3Lessons.reduce((acc, l) => acc + l.words.length, 0)

export function StatsPage() {
  const { progress } = useProgress()

  const wordsLearned = Object.values(progress.lessonProgress).reduce(
    (acc, curr) => acc + (curr?.wordsLearned || 0),
    0
  )

  const completedHSK1 = hsk1Lessons.filter(l => progress.completedLessons.includes(l.id)).length
  const completedHSK2 = hsk2Lessons.filter(l => progress.completedLessons.includes(l.id)).length
  const completedHSK3 = hsk3Lessons.filter(l => progress.completedLessons.includes(l.id)).length

  const pieData = [
    { name: 'HSK 1', value: completedHSK1, fill: 'hsl(248 90% 66%)' },
    { name: 'HSK 2', value: completedHSK2, fill: 'hsl(248 90% 66% / 0.6)' },
    { name: 'HSK 3', value: completedHSK3, fill: 'hsl(248 90% 66% / 0.3)' },
  ].filter(d => d.value > 0)

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const weeklyData = []
    const dailyXP = progress.dailyXP || {}
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      const dayName = days[date.getDay()]
      weeklyData.push({
        day: dayName,
        xp: dailyXP[dateStr] || 0,
      })
    }
    
    return weeklyData
  }

  const weeklyData = getWeeklyData()

  const achievements = [
    { id: 'first-lesson', name: 'First Steps', desc: 'Complete your first lesson', icon: BookOpen, unlocked: progress.completedLessons.length >= 1 },
    { id: 'streak-3', name: 'On Fire', desc: 'Maintain a 3-day streak', icon: Flame, unlocked: progress.streak >= 3 },
    { id: 'streak-7', name: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: Flame, unlocked: progress.streak >= 7 },
    { id: 'hsk1-complete', name: 'HSK 1 Graduate', desc: 'Complete all HSK 1 lessons', icon: Trophy, unlocked: completedHSK1 === hsk1Lessons.length },
    { id: 'hsk2-complete', name: 'HSK 2 Graduate', desc: 'Complete all HSK 2 lessons', icon: Trophy, unlocked: completedHSK2 === hsk2Lessons.length },
    { id: '100-words', name: 'Centurion', desc: 'Learn 100 words', icon: BookOpen, unlocked: wordsLearned >= 100 },
    { id: '500-xp', name: 'Rising Star', desc: 'Earn 500 XP', icon: Zap, unlocked: progress.xp >= 500 },
    { id: '1000-xp', name: 'XP Master', desc: 'Earn 1000 XP', icon: Zap, unlocked: progress.xp >= 1000 },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-1">Track your learning progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-500">Daily Streak</CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress.streak}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress.xp.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">experience points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Lessons Done</CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress.completedLessons.length}/{totalLessons}</div>
            <Progress value={(progress.completedLessons.length / totalLessons) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Words Learned</CardTitle>
            <BookOpen className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{wordsLearned}/{totalWords}</div>
            <p className="text-xs text-muted-foreground">vocabulary words</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Trophy className="h-4 w-4" />
            Achievements ({unlockedCount}/{achievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Completion</CardTitle>
                <CardDescription>Your progress across all levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">HSK 1</span>
                      <span className="text-muted-foreground">{completedHSK1}/{hsk1Lessons.length}</span>
                    </div>
                    <Progress value={(completedHSK1 / hsk1Lessons.length) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">HSK 2</span>
                      <span className="text-muted-foreground">{completedHSK2}/{hsk2Lessons.length}</span>
                    </div>
                    <Progress value={(completedHSK2 / hsk2Lessons.length) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">HSK 3</span>
                      <span className="text-muted-foreground">{completedHSK3}/{hsk3Lessons.length}</span>
                    </div>
                    <Progress value={(completedHSK3 / hsk3Lessons.length) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>XP Distribution</CardTitle>
                <CardDescription>XP earned by level</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Complete lessons to see your progress
                  </div>
                )}
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Your XP earnings this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar dataKey="xp" fill="hsl(248 90% 66%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={cn(
                  'transition-all',
                  achievement.unlocked
                    ? 'border-primary/50 bg-primary/5'
                    : 'opacity-60'
                )}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      achievement.unlocked ? 'bg-primary/20' : 'bg-muted'
                    )}
                  >
                    <achievement.icon
                      className={cn(
                        'h-6 w-6',
                        achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{achievement.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{achievement.desc}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {achievement.unlocked ? (
                    <Badge variant="success">Unlocked</Badge>
                  ) : (
                    <Badge variant="secondary">Locked</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}