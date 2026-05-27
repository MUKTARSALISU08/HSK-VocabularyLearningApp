import { useState, useEffect, useCallback, useRef } from 'react'
import { useProgress } from '@/contexts/progress-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Volume2,
  ArrowRight,
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

function generateRandomQuestions(count: number): QuizQuestion[] {
  const words: { chinese: string; pinyin?: string; english: string; level: string; sentences: { chinese: string; english: string }[] }[] = []

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

  for (let i = 0; i < count; i++) {
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

export function ChallengePage() {
  const { addXp } = useProgress()

  const [challengeType, setChallengeType] = useState<'none' | 'timed' | 'endless'>('none')
  const [questionCount, setQuestionCount] = useState(10)
  const [timeLimit, setTimeLimit] = useState(180)
  const [timeLeft, setTimeLeft] = useState(180)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [challengeComplete, setChallengeComplete] = useState(false)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [challengeStarted, setChallengeStarted] = useState(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startTimedChallenge = useCallback((count: number, seconds: number) => {
    const newQuestions = generateRandomQuestions(count)
    setQuestions(newQuestions)
    setQuestionCount(count)
    setTimeLimit(seconds)
    setTimeLeft(seconds)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setResults([])
    setShowResult(false)
    setChallengeComplete(false)
    setCombo(0)
    setMaxCombo(0)
    setChallengeType(seconds === 99999 ? 'endless' : 'timed')
    setChallengeStarted(true)

    if (seconds !== 99999) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            handleChallengeEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [])

  const handleChallengeEnd = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setChallengeComplete(true)

    const correctCount = results.filter(r => r.isCorrect).length
    const xpEarned = correctCount * 10 + maxCombo * 5 + (challengeType === 'timed' && timeLeft > 0 ? Math.round(timeLeft / 10) : 0)
    addXp(xpEarned)

    toast.success(`Challenge complete! +${xpEarned} XP`)
  }, [results, maxCombo, challengeType, timeLeft, addXp])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return

    setSelectedAnswer(answer)
    const correct = answer === questions[currentQuestion].correctAnswer
    setIsCorrect(correct)

    if (correct) {
      setCombo(prev => {
        const newCombo = prev + 1
        setMaxCombo(max => Math.max(max, newCombo))
        return newCombo
      })
    } else {
      setCombo(0)
    }

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
        handleChallengeEnd()
      }
    }, 1000)
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const correctCount = results.filter(r => r.isCorrect).length

  if (!challengeStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Challenge Mode</h1>
          <p className="text-muted-foreground mt-1">Test your knowledge under pressure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <CardTitle>Time Challenge</CardTitle>
                  <CardDescription>Race against the clock</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Answer questions as fast as you can before time runs out!
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => startTimedChallenge(10, 60)}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl font-bold">10</span>
                  <span className="text-xs">1 minute</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startTimedChallenge(10, 180)}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl font-bold">10</span>
                  <span className="text-xs">3 minutes</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startTimedChallenge(20, 120)}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl font-bold">20</span>
                  <span className="text-xs">2 minutes</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startTimedChallenge(20, 300)}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl font-bold">20</span>
                  <span className="text-xs">5 minutes</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Quick Fire</CardTitle>
                  <CardDescription>No time limit, just focus</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Answer as many questions as you can at your own pace.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => startTimedChallenge(5, 99999)}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl font-bold">5</span>
                  <span className="text-xs">questions</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startTimedChallenge(10, 99999)}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl font-bold">10</span>
                  <span className="text-xs">questions</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startTimedChallenge(20, 99999)}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl font-bold">20</span>
                  <span className="text-xs">questions</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startTimedChallenge(50, 99999)}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl font-bold">50</span>
                  <span className="text-xs">questions</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Challenge Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Build combos by answering correctly in a row</li>
              <li>• Each combo adds +5 bonus XP</li>
              <li>• Time challenges give bonus XP for remaining time</li>
              <li>• Focus on accuracy - wrong answers break your combo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (challengeComplete) {
    const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

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
          <h2 className="text-2xl md:text-3xl font-bold">Challenge Complete!</h2>
          <p className="text-4xl md:text-5xl font-bold">{scorePercent}%</p>
          <p className="text-muted-foreground">
            {correctCount} out of {questions.length} correct • {maxCombo} max combo
          </p>
          {challengeType === 'timed' && timeLimit !== 99999 && (
            <p className="text-sm text-muted-foreground">
              Time remaining: {formatTime(timeLeft)}
            </p>
          )}
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{correctCount * 10}</p>
                <p className="text-sm text-muted-foreground">Correct XP</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{maxCombo * 5}</p>
                <p className="text-sm text-muted-foreground">Combo XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" onClick={() => setChallengeStarted(false)} className="gap-2">
            <Home className="h-4 w-4" />
            Back to Challenges
          </Button>
          <Button onClick={() => startTimedChallenge(questionCount, timeLimit)} className="gap-2">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {timeLimit !== 99999 && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full',
              timeLeft <= 30 ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'
            )}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}
          <Badge variant="secondary">
            <Zap className="h-3 w-3 mr-1" />
            Combo: {combo}
          </Badge>
        </div>
        <Badge>
          {currentQuestion + 1}/{questions.length}
        </Badge>
      </div>

      <Progress
        value={((currentQuestion + 1) / questions.length) * 100}
        className={cn(
          "h-2",
          timeLeft <= 30 && timeLimit !== 99999 ? "bg-red-500" : ""
        )}
      />

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
        <div className="flex flex-wrap justify-between gap-4">
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

      {combo >= 3 && (
        <div className="text-center">
          <Badge variant="success" className="text-lg px-4 py-2">
            <Zap className="h-4 w-4 mr-1" />
            {combo} Combo Streak!
          </Badge>
        </div>
      )}
    </div>
  )
}