import { useState } from 'react'
import { useProgress } from '@/contexts/progress-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, CheckCircle2, PlayCircle } from 'lucide-react'
import { Link } from 'wouter'
import { hsk1Lessons } from '@/data/hsk1'
import { hsk2Lessons } from '@/data/hsk2'
import { hsk3Lessons } from '@/data/hsk3'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/types'

function LessonCard({ lesson, isCompleted, progress }: { lesson: Lesson; isCompleted: boolean; progress?: number }) {
  return (
    <Link href={`/lessons/${lesson.id}`}>
      <Card className={cn(
        'transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        isCompleted && 'border-green-500/50 bg-green-500/5'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant={isCompleted ? 'success' : 'secondary'}>
              {isCompleted ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <PlayCircle className="h-3 w-3" /> Start
                </span>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {lesson.words.length} words
            </span>
          </div>
          <CardTitle className="text-lg md:text-xl mt-2">Lesson {lesson.lessonNumber}</CardTitle>
          <CardDescription>
            {lesson.level} vocabulary with examples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{isCompleted ? 100 : progress || 0}%</span>
            </div>
            <Progress value={isCompleted ? 100 : progress || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function LessonsPage() {
  const { progress } = useProgress()
  const [activeTab, setActiveTab] = useState('hsk1')

  const allLessons = {
    hsk1: hsk1Lessons,
    hsk2: hsk2Lessons,
    hsk3: hsk3Lessons,
  }

  const completedByLevel = {
    hsk1: hsk1Lessons.filter(l => progress.completedLessons.includes(l.id)).length,
    hsk2: hsk2Lessons.filter(l => progress.completedLessons.includes(l.id)).length,
    hsk3: hsk3Lessons.filter(l => progress.completedLessons.includes(l.id)).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Lessons</h1>
        <p className="text-muted-foreground mt-1">Master Chinese vocabulary step by step</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hsk1" className="gap-2 text-sm md:text-base">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">HSK 1</span>
            <Badge variant="secondary" className="ml-1">{completedByLevel.hsk1}/{hsk1Lessons.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="hsk2" className="gap-2 text-sm md:text-base">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">HSK 2</span>
            <Badge variant="secondary" className="ml-1">{completedByLevel.hsk2}/{hsk2Lessons.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="hsk3" className="gap-2 text-sm md:text-base">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">HSK 3</span>
            <Badge variant="secondary" className="ml-1">{completedByLevel.hsk3}/{hsk3Lessons.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {(['hsk1', 'hsk2', 'hsk3'] as const).map((level) => (
          <TabsContent key={level} value={level} className="mt-6">
            <div className="mb-6 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold text-base md:text-lg">
                {level === 'hsk1' ? 'HSK 1 - Beginner' : level === 'hsk2' ? 'HSK 2 - Elementary' : 'HSK 3 - Intermediate'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {level === 'hsk1' && '150 words • 10 lessons • Pinyin included'}
                {level === 'hsk2' && '150 words • 10 lessons • Pinyin included'}
                {level === 'hsk3' && '300 words • 20 lessons • Chinese characters only'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allLessons[level].map((lesson) => {
                const isCompleted = progress.completedLessons.includes(lesson.id)
                const lessonProgress = progress.lessonProgress[lesson.id]
                const wordsLearned = lessonProgress?.wordsLearned || 0
                const progressPercent = lesson.words.length > 0 ? Math.round((wordsLearned / lesson.words.length) * 100) : 0

                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isCompleted={isCompleted}
                    progress={progressPercent}
                  />
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}