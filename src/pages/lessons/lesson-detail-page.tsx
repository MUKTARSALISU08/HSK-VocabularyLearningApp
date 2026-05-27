import { useState, useCallback } from 'react'
import { useParams, Link } from 'wouter'
import { useProgress } from '@/contexts/progress-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import {
  Volume2,
  Heart,
  ArrowLeft,
  BookOpen,
  Shuffle,
  CheckCircle2,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { speak } from '@/lib/utils'
import { hsk1Lessons } from '@/data/hsk1'
import { hsk2Lessons } from '@/data/hsk2'
import { hsk3Lessons } from '@/data/hsk3'

import { toast } from 'sonner'

const allLessons = [...hsk1Lessons, ...hsk2Lessons, ...hsk3Lessons]

export function LessonDetailPage() {
  const params = useParams<{ id: string }>()
  const lessonId = params.id
  const lesson = allLessons.find(l => l.id === lessonId)
  const { progress, addFavorite, removeFavorite, isFavorite, markLessonComplete, addXp, updateLessonProgress, updateStreak } = useProgress()

  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedWords, setLearnedWords] = useState<Set<number>>(new Set())

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl md:text-2xl font-bold">Lesson not found</h2>
        <Link href="/lessons">
          <Button className="mt-4">Back to Lessons</Button>
        </Link>
      </div>
    )
  }

  const currentWord = lesson.words[currentWordIndex]
  const isCurrentFavorite = isFavorite(currentWord.chinese)
  const showPinyin = lesson.level !== 'HSK3'
  const isLessonComplete = progress.completedLessons.includes(lesson.id)

  const handleSpeak = useCallback((text: string) => {
    speak(text)
  }, [])

  const handleFavorite = () => {
    if (isCurrentFavorite) {
      removeFavorite(currentWord.chinese)
      toast.success('Removed from favorites')
    } else {
      addFavorite({
        chinese: currentWord.chinese,
        pinyin: currentWord.pinyin,
        english: currentWord.english,
        level: lesson.level,
        lessonId: lesson.id,
        addedAt: new Date().toISOString(),
      })
      toast.success('Added to favorites')
    }
  }

  const markWordLearned = () => {
    const newLearned = new Set(learnedWords)
    newLearned.add(currentWordIndex)
    setLearnedWords(newLearned)
    updateLessonProgress(lesson.id, newLearned.size, lesson.words.length)
    updateStreak()
    addXp(5)
    toast.success('+5 XP')

    if (currentWordIndex < lesson.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }

  const handleFlashcard = () => {
    if (learnedWords.size === lesson.words.length) {
      markLessonComplete(lesson.id)
      toast.success('Lesson completed! +50 XP')
      addXp(50)
    }
  }

  const shuffleIndex = () => {
    const remainingIndices = lesson.words
      .map((_, i) => i)
      .filter(i => !learnedWords.has(i))
    if (remainingIndices.length > 0) {
      const randomIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)]
      setCurrentWordIndex(randomIndex)
      setIsFlipped(false)
    }
  }

  const progressPercent = lesson.words.length > 0 ? Math.round((learnedWords.size / lesson.words.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lessons">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">{lesson.level} - Lesson {lesson.lessonNumber}</h1>
          <p className="text-muted-foreground text-sm">{lesson.words.length} vocabulary words</p>
        </div>
        {isLessonComplete && <Badge variant="success">Completed</Badge>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Lesson Progress</span>
          <span className="font-medium">{learnedWords.size}/{lesson.words.length} words ({progressPercent}%)</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <Tabs defaultValue="vocabulary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vocabulary" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="flashcard" className="gap-2">
            <Shuffle className="h-4 w-4" />
            Flashcard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lesson.words.map((word, index) => (
              <Card
                key={index}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  learnedWords.has(index) && 'border-green-500/50 bg-green-500/5',
                  currentWordIndex === index && 'ring-2 ring-primary'
                )}
                onClick={() => {
                  setCurrentWordIndex(index)
                  setIsFlipped(false)
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{index + 1}</span>
                    {learnedWords.has(index) && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <CardTitle className="text-2xl md:text-3xl chinese">{word.chinese}</CardTitle>
                  {showPinyin && word.pinyin && (
                    <p className="text-base md:text-lg pinyin text-muted-foreground">{word.pinyin}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{word.english}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flashcard" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <Card
              className={cn(
                'w-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px] cursor-pointer transition-all duration-500',
                isFlipped && 'scale-105'
              )}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <CardContent className="p-6 md:p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="space-y-4">
                  {isFlipped ? (
                    <div className="space-y-4">
                      <p className="text-6xl md:text-7xl lg:text-8xl chinese">{currentWord.chinese}</p>
                      {showPinyin && currentWord.pinyin && (
                        <p className="text-xl md:text-2xl lg:text-3xl pinyin text-primary">{currentWord.pinyin}</p>
                      )}
                      <p className="text-lg md:text-xl lg:text-2xl">{currentWord.english}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-6xl md:text-7xl lg:text-8xl chinese">{currentWord.chinese}</p>
                      {showPinyin && currentWord.pinyin && (
                        <p className="text-xl md:text-2xl lg:text-3xl pinyin text-muted-foreground">{currentWord.pinyin}</p>
                      )}
                      <p className="text-base md:text-lg text-muted-foreground">Click to reveal</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSpeak(currentWord.chinese)
                    }}
                    className="h-10 w-10"
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {lesson.words.map((_, index) => (
              <Button
                key={index}
                variant={learnedWords.has(index) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCurrentWordIndex(index)
                  setIsFlipped(false)
                }}
                className={cn(
                  currentWordIndex === index && 'ring-2 ring-primary'
                )}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={shuffleIndex}
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </Button>
            <Button
              onClick={markWordLearned}
              className="gap-2"
              disabled={learnedWords.has(currentWordIndex)}
            >
              <CheckCircle2 className="h-4 w-4" />
              {learnedWords.has(currentWordIndex) ? 'Learned' : 'Mark as Learned'}
            </Button>
            <Link href={`/quiz/${lesson.id}`}>
              <Button
                onClick={handleFlashcard}
                disabled={learnedWords.size < lesson.words.length}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Take Quiz
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-3">
            <span>Example Sentences</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSpeak(currentWord.chinese)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant={isCurrentFavorite ? 'default' : 'outline'}
                size="icon"
                onClick={handleFavorite}
              >
                <Heart className={cn('h-4 w-4', isCurrentFavorite && 'fill-current')} />
              </Button>
            </div>
          </CardTitle>
          <div className="mt-2">
            <p className="text-xl md:text-2xl chinese">{currentWord.chinese}</p>
            {showPinyin && currentWord.pinyin && (
              <p className="text-base md:text-lg pinyin text-primary">{currentWord.pinyin}</p>
            )}
            <p className="text-muted-foreground">{currentWord.english}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {currentWord.sentences.map((sentence, index) => (
              <AccordionItem key={index} value={`sentence-${index}`}>
                <AccordionTrigger className="text-left">
                  <span className="text-sm font-medium">Example {index + 1}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-2">
                    <div className="flex items-start gap-3">
                      <p className="text-base md:text-lg chinese flex-1">{sentence.chinese}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSpeak(sentence.chinese)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {showPinyin && sentence.pinyin && (
                      <p className="text-sm md:text-base pinyin text-muted-foreground">{sentence.pinyin}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{sentence.english}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}