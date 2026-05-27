import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'wouter'
import { useProgress } from '@/contexts/progress-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  Volume2,
  RotateCcw,
  Home,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { speak } from '@/lib/utils'
import { hsk1Lessons } from '@/data/hsk1'
import { hsk2Lessons } from '@/data/hsk2'
import { hsk3Lessons } from '@/data/hsk3'
import type { QuizQuestion, QuizResult } from '@/types'
import { toast } from 'sonner'

const allLessons = [...hsk1Lessons, ...hsk2Lessons, ...hsk3Lessons]

function generateQuiz(lessonId: string | undefined, questionCount: number = 10): QuizQuestion[] {
  let words: { chinese: string; pinyin?: string; english: string; level: string; sentences: { chinese: string; pinyin?: string; english: string }[] }[] = []

  if (lessonId) {
    const lesson = allLessons.find(l => l.id === lessonId)
    if (lesson) {
      words = lesson.words.map(w => ({
        chinese: w.chinese,
        pinyin: w.pinyin,
        english: w.english,
        level: lesson.level,
        sentences: w.sentences,
      }))
    }
  } else {
    allLessons.forEach(lesson => {
      lesson.words.forEach(w => {
        words.push({
          chinese: w.chinese,
          pinyin: w.pinyin,
          english: w.english,
          level: lesson.level,
          sentences: w.sentences,
        })
      })
    })
  }

  if (words.length === 0) return []

  const questions: QuizQuestion[] = []
  const questionTypes: QuizQuestion['type'][] = [
    'chinese-to-english',
    'english-to-chinese',
    'pinyin-to-chinese',
    'sentence-meaning',
    'fill-in-blank',
    'match-meaning',
  ]

  for (let i = 0; i < questionCount; i++) {
    const word = words[Math.floor(Math.random() * words.length)]
    const availableTypes = word.level === 'HSK3' 
      ? questionTypes.filter(t => t !== 'pinyin-to-chinese')
      : questionTypes
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)]

    let question: QuizQuestion = {
      id: `q-${i}-${Date.now()}`,
      type,
      question: '',
      questionText: '',
      options: [],
      correctAnswer: '',
      relatedWord: word.chinese,
    }

    const wrongOptions = words
      .filter(w => w.chinese !== word.chinese)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    switch (type) {
      case 'chinese-to-english':
        question.question = word.chinese
        question.questionText = 'What is the English meaning of this word?'
        question.options = [word.english, ...wrongOptions.map(w => w.english)].sort(() => Math.random() - 0.5)
        question.correctAnswer = word.english
        break
      case 'english-to-chinese':
        question.question = word.english
        question.questionText = 'Choose the correct Chinese character'
        question.options = [word.chinese, ...wrongOptions.map(w => w.chinese)].sort(() => Math.random() - 0.5)
        question.correctAnswer = word.chinese
        break
      case 'pinyin-to-chinese':
        if (!word.pinyin) {
          question.type = 'chinese-to-english'
          question.question = word.chinese
          question.questionText = 'What is the English meaning of this word?'
          question.options = [word.english, ...wrongOptions.map(w => w.english)].sort(() => Math.random() - 0.5)
          question.correctAnswer = word.english
        } else {
          question.question = word.pinyin
          question.questionText = 'Select the correct Chinese word for this pinyin'
          question.options = [word.chinese, ...wrongOptions.map(w => w.chinese)].sort(() => Math.random() - 0.5)
          question.correctAnswer = word.chinese
        }
        break
      case 'sentence-meaning':
        const sentence = word.sentences.length > 0 
          ? word.sentences[Math.floor(Math.random() * word.sentences.length)] 
          : { chinese: word.chinese, english: word.english }
        question.question = sentence.chinese
        question.questionText = 'What does this sentence mean?'
        question.options = [sentence.english, ...wrongOptions.map(w => w.english)].sort(() => Math.random() - 0.5)
        question.correctAnswer = sentence.english
        break
      case 'fill-in-blank':
        const fbSentence = word.sentences.length > 0 
          ? word.sentences[Math.floor(Math.random() * word.sentences.length)] 
          : { chinese: word.chinese, english: word.english }
        question.question = fbSentence.chinese.replace(word.chinese, '____')
        question.questionText = `Fill in the blank: "${question.question}"`
        question.options = [word.chinese, ...wrongOptions.map(w => w.chinese)].sort(() => Math.random() - 0.5)
        question.correctAnswer = word.chinese
        break
      case 'match-meaning':
        question.question = word.chinese
        question.questionText = 'Which English word matches this Chinese character?'
        question.options = [word.english, ...wrongOptions.map(w => w.english)].sort(() => Math.random() - 0.5)
        question.correctAnswer = word.english
        break
    }

    questions.push(question)
  }

  return questions
}

export function QuizPage() {
  const params = useParams<{ lessonId?: string }>()
  const lessonId = params.lessonId
  const { addXp, markLessonComplete, addQuizMistake, updateStreak } = useProgress()

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [showResult, setShowResult] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  const lesson = lessonId ? allLessons.find(l => l.id === lessonId) : null

  useEffect(() => {
    if (lessonId && !quizStarted) {
      const newQuestions = generateQuiz(lessonId, 10)
      setQuestions(newQuestions)
    }
  }, [lessonId, quizStarted])

  const handleStartQuiz = useCallback(() => {
    const newQuestions = generateQuiz(lessonId, 10)
    setQuestions(newQuestions)
    setQuizStarted(true)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setResults([])
    setShowResult(false)
    setQuizComplete(false)
    setIsCorrect(false)
  }, [lessonId])

  const handleStartRandomQuiz = useCallback((count: number) => {
    const newQuestions = generateQuiz(undefined, count)
    setQuestions(newQuestions)
    setQuizStarted(true)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setResults([])
    setShowResult(false)
    setQuizComplete(false)
    setIsCorrect(false)
  }, [])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return

    setSelectedAnswer(answer)
    const correct = answer === questions[currentQuestion].correctAnswer
    setIsCorrect(correct)

    if (!correct && lesson) {
      const currentWord = lesson.words.find(w => w.chinese === questions[currentQuestion].relatedWord)
      if (currentWord) {
        addQuizMistake({
          word: currentWord,
          yourAnswer: answer,
          correctAnswer: questions[currentQuestion].correctAnswer,
          level: lesson.level,
          lessonId: lesson.id,
          date: new Date().toISOString(),
        })
      }
    }

    updateStreak()
    setShowResult(true)

    setTimeout(() => {
      const newResults = [...results, {
        questionId: questions[currentQuestion].id,
        selectedAnswer: answer,
        correctAnswer: questions[currentQuestion].correctAnswer,
        isCorrect: correct,
      }]
      setResults(newResults)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setIsCorrect(false)
      } else {
        setQuizComplete(true)
        const correctCount = [...newResults, { isCorrect: correct }].filter(r => r.isCorrect).length
        const xpEarned = correctCount * 10
        addXp(xpEarned)

        if (lessonId && correctCount >= 7) {
          markLessonComplete(lessonId, Math.round((correctCount / questions.length) * 100))
        }

        toast.success(`Quiz complete! +${xpEarned} XP`)
      }
    }, 1500)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsCorrect(false)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsCorrect(false)
    }
  }

  const handleSpeak = (text: string) => {
    speak(text)
  }

  const correctCount = results.filter(r => r.isCorrect).length
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

  if (!quizStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{lesson ? 'Lesson Quiz' : 'Test Your Knowledge'}</h1>
          <p className="text-muted-foreground mt-1">
            {lesson ? `${lesson.level} - Lesson ${lesson.lessonNumber}` : 'Choose a quiz mode'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => handleStartQuiz()}
          >
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Lesson Quiz</CardTitle>
              <CardDescription>10 questions from the current lesson</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{lesson?.level || 'HSK 1'} Lesson {lesson?.lessonNumber || 1}</Badge>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => handleStartRandomQuiz(5)}
          >
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Quick Quiz</CardTitle>
              <CardDescription>5 random questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">All Levels</Badge>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => handleStartRandomQuiz(10)}
          >
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Standard Quiz</CardTitle>
              <CardDescription>10 random questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">All Levels</Badge>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => handleStartRandomQuiz(20)}
          >
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Extended Quiz</CardTitle>
              <CardDescription>20 random questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">All Levels</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (quizComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className={cn(
          'w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center',
          scorePercent >= 70 ? 'bg-green-500/20' : 'bg-orange-500/20'
        )}>
          <Trophy className={cn(
            'h-10 w-10 md:h-12 md:w-12',
            scorePercent >= 70 ? 'text-green-500' : 'text-orange-500'
          )} />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">Quiz Complete!</h2>
          <p className="text-4xl md:text-5xl font-bold">{scorePercent}%</p>
          <p className="text-muted-foreground">
            {correctCount} out of {questions.length} correct
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {results.map((result, index) => {
                const question = questions.find(q => q.id === result.questionId)
                return (
                  <div key={index} className="flex items-center gap-3">
                    {result.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm flex-1 truncate">
                      {question?.question}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/lessons">
              <Home className="h-4 w-4 mr-2" />
              Back to Lessons
            </Link>
          </Button>
          <Button onClick={handleStartQuiz} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const showPinyin = question.type === 'pinyin-to-chinese'

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold truncate">Question {currentQuestion + 1} of {questions.length}</h1>
          <p className="text-sm text-muted-foreground">
            {lesson ? `${lesson.level} Quiz` : 'Random Quiz'}
          </p>
        </div>
        <Badge variant={scorePercent >= 70 ? 'success' : 'secondary'}>
          Score: {correctCount}/{currentQuestion}
        </Badge>
      </div>

      <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />

      <Card>
        <CardHeader className="text-center">
          <p className="text-sm font-medium text-primary mb-2">{question.questionText}</p>
          <CardTitle className="text-2xl md:text-3xl chinese">
            {question.question}
          </CardTitle>
          {showPinyin && (
            <p className="text-lg md:text-xl pinyin text-primary mt-2">{question.question}</p>
          )}
          {(question.type === 'chinese-to-english' || question.type === 'sentence-meaning') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSpeak(question.question)}
              className="mx-auto mt-2"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  'w-full justify-start text-left h-auto py-4 whitespace-normal transition-all',
                  selectedAnswer === option && isCorrect && option === question.correctAnswer && 'bg-green-500/20 border-green-500 text-green-500',
                  selectedAnswer === option && !isCorrect && option === selectedAnswer && 'bg-red-500/20 border-red-500 text-red-500',
                  selectedAnswer && option === question.correctAnswer && !isCorrect && 'border-green-500 text-green-500',
                  !selectedAnswer && 'hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
              >
                <span className="mr-3 font-bold opacity-50 flex-shrink-0">{String.fromCharCode(65 + index)}.</span>
                <span className={cn(question.type === 'english-to-chinese' && 'chinese')}>{option}</span>
                {selectedAnswer && option === question.correctAnswer && (
                  <CheckCircle2 className="h-5 w-5 ml-auto flex-shrink-0" />
                )}
                {selectedAnswer === option && !isCorrect && (
                  <XCircle className="h-5 w-5 ml-auto flex-shrink-0" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showResult && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentQuestion === questions.length - 1}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}