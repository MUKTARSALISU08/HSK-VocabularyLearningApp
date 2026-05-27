import express from 'express'
import cors from 'cors'
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const JWT_SECRET = (process.env.JWT_SECRET || 'mock_secret_for_testing_only_12345') as Secret
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

interface Sentence {
  chinese: string
  pinyin?: string
  english: string
}

interface VocabularyWord {
  chinese: string
  pinyin?: string
  english: string
  sentences: Sentence[]
}

interface LessonProgress {
  lessonId: string
  wordsLearned: number
  totalWords: number
  isCompleted: boolean
  quizScore?: number
  lastStudied: string | null
}

interface FavoriteWord {
  chinese: string
  pinyin?: string
  english: string
  level: string
  lessonId: string
  addedAt: string
}

interface QuizMistake {
  word: VocabularyWord
  yourAnswer: string
  correctAnswer: string
  level: string
  lessonId: string
  date: string
}

interface UserProgress {
  xp: number
  streak: number
  lastStudyDate: string | null
  completedLessons: string[]
  favoriteWords: FavoriteWord[]
  quizMistakes: QuizMistake[]
  lessonProgress: Record<string, LessonProgress>
  achievements: string[]
  dailyXP: Record<string, number>
}

interface MockUser {
  id: string
  email: string
  password: string
  username: string
  avatar_url: string | null
  xp: number
  streak: number
  last_study_date: string | null
}

interface ProgressStorage {
  users: Record<string, UserProgress>
}

const STORAGE_FILE = path.join(__dirname, '../data/users.json')
const PROGRESS_FILE = path.join(__dirname, '../data/progress.json')

const createEmptyProgress = (): UserProgress => ({
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  completedLessons: [],
  favoriteWords: [],
  quizMistakes: [],
  lessonProgress: {},
  achievements: [],
  dailyXP: {},
})

const loadUsers = (): MockUser[] => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading users:', error)
  }
  return []
}

const saveUsers = (users: MockUser[]) => {
  try {
    const dir = path.dirname(STORAGE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

const loadProgress = (): ProgressStorage => {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading progress:', error)
  }
  return { users: {} }
}

const saveProgress = (progressData: ProgressStorage) => {
  try {
    const dir = path.dirname(PROGRESS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progressData, null, 2))
    console.log(`[PROGRESS] Saved progress for ${Object.keys(progressData.users).length} users`)
  } catch (error) {
    console.error('Error saving progress:', error)
  }
}

let mockUsers: MockUser[] = loadUsers()
let progressData: ProgressStorage = loadProgress()

console.log(`Loaded ${mockUsers.length} users from storage`)
console.log(`Loaded progress for ${Object.keys(progressData.users).length} users`)

const generateId = () => Math.random().toString(36).substring(2, 15)

const saveUsersAsync = () => {
  saveUsers(mockUsers)
  console.log(`Saved ${mockUsers.length} users to storage`)
}

const getUserProgress = (userId: string): UserProgress => {
  if (!progressData.users[userId]) {
    progressData.users[userId] = JSON.parse(JSON.stringify(createEmptyProgress()))
  }
  return progressData.users[userId]
}

const saveUserProgress = (userId: string, progress: UserProgress) => {
  progressData.users[userId] = JSON.parse(JSON.stringify(progress))
  saveProgress(progressData)
  console.log(`[PROGRESS] Saved progress for user ${userId}: XP=${progress.xp}, Streak=${progress.streak}, Completed=${progress.completedLessons.length}`)
}

const verifyToken = (req: express.Request): { userId: string } | null => {
  const authHeader = req.headers.authorization
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const decoded = verifyToken(req)
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }
  (req as any).userId = decoded.userId
  next()
}

app.post('/api/auth/signup', async (req, res) => {
  const { email, username, password } = req.body

  const existingUser = mockUsers.find(u => u.email === email)
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const newUser: MockUser = {
    id: generateId(),
    email,
    password: hashedPassword,
    username,
    avatar_url: null,
    xp: 0,
    streak: 0,
    last_study_date: null,
  }

  mockUsers.push(newUser)
  saveUsersAsync()

  progressData.users[newUser.id] = JSON.parse(JSON.stringify(createEmptyProgress()))
  saveProgress(progressData)

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions)

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      avatarUrl: newUser.avatar_url,
      xp: 0,
      streak: 0,
      currentLevel: 'HSK 1',
      lastStudyDate: null,
    },
    token,
  })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body

  const user = mockUsers.find(u => u.email === email)
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions)

  const userProgress = getUserProgress(user.id)

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatar_url,
      xp: userProgress.xp,
      streak: userProgress.streak,
      currentLevel: 'HSK 1',
      lastStudyDate: userProgress.lastStudyDate,
    },
    token,
    rememberMe,
  })
})

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' })
})

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body
  const user = mockUsers.find(u => u.email === email)

  if (user) {
    const resetToken = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '1h' })
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`
    console.log(`Password reset link for ${email}: ${resetLink}`)
    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      resetLink: resetLink
    })
  } else {
    res.json({ success: true, message: 'If this email exists, you will receive a password reset link' })
  }
})

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    const user = mockUsers.find(u => u.id === decoded.userId)

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' })
    }

    user.password = bcrypt.hashSync(newPassword, 12)
    saveUsersAsync()

    res.json({ success: true, message: 'Password reset successful' })
  } catch {
    res.status(400).json({ success: false, message: 'Invalid or expired token' })
  }
})

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const userId = (req as any).userId
  const { currentPassword, newPassword } = req.body

  const user = mockUsers.find(u => u.id === userId)
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' })
  }

  const isPasswordValid = bcrypt.compareSync(currentPassword, user.password)
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' })
  }

  user.password = bcrypt.hashSync(newPassword, 12)
  saveUsersAsync()

  res.json({ success: true, message: 'Password changed successfully' })
})

app.get('/api/auth/profile', requireAuth, (req, res) => {
  const userId = (req as any).userId
  const user = mockUsers.find(u => u.id === userId)

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' })
  }

  const userProgress = getUserProgress(userId)

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatar_url,
      xp: userProgress.xp,
      streak: userProgress.streak,
      currentLevel: 'HSK 1',
      lastStudyDate: userProgress.lastStudyDate,
    },
  })
})

app.post('/api/auth/avatar', requireAuth, (req, res) => {
  const userId = (req as any).userId
  const { avatarBase64 } = req.body

  const user = mockUsers.find(u => u.id === userId)
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' })
  }

  user.avatar_url = avatarBase64
  saveUsersAsync()

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    avatarUrl: avatarBase64
  })
})

app.get('/api/progress', requireAuth, (req, res) => {
  const userId = (req as any).userId
  
  const userProgress = getUserProgress(userId)

  console.log(`[PROGRESS] Fetching progress for user ${userId}:`, {
    xp: userProgress.xp,
    streak: userProgress.streak,
    completedLessons: userProgress.completedLessons.length,
    favorites: userProgress.favoriteWords.length,
  })

  res.json({
    success: true,
    progress: {
      profile: {
        xp: userProgress.xp,
        streak: userProgress.streak,
        last_study_date: userProgress.lastStudyDate,
      },
      completedLessons: [...userProgress.completedLessons],
      lessonProgress: { ...userProgress.lessonProgress },
      achievements: [...userProgress.achievements],
      favoriteWords: [...userProgress.favoriteWords],
      quizMistakes: [...userProgress.quizMistakes],
      dailyXP: { ...userProgress.dailyXP },
    },
  })
})

app.post('/api/progress/sync', requireAuth, (req, res) => {
  const userId = (req as any).userId
  const body = req.body

  const userProgress = getUserProgress(userId)

  if (body.xp !== undefined) userProgress.xp = body.xp
  if (body.streak !== undefined) userProgress.streak = body.streak
  if (body.lastStudyDate !== undefined) userProgress.lastStudyDate = body.lastStudyDate
  if (body.completedLessons !== undefined) userProgress.completedLessons = [...body.completedLessons]
  if (body.lessonProgress !== undefined) userProgress.lessonProgress = { ...body.lessonProgress }
  if (body.achievements !== undefined) userProgress.achievements = [...body.achievements]
  if (body.dailyXP !== undefined) userProgress.dailyXP = { ...body.dailyXP }

  saveUserProgress(userId, userProgress)

  res.json({ success: true, message: 'Progress synced successfully' })
})

app.post('/api/progress/profile', requireAuth, (req, res) => {
  const userId = (req as any).userId

  const userProgress = getUserProgress(userId)

  if (req.body.xp !== undefined) userProgress.xp = req.body.xp
  if (req.body.streak !== undefined) userProgress.streak = req.body.streak
  if (req.body.last_study_date !== undefined) userProgress.lastStudyDate = req.body.last_study_date

  saveUserProgress(userId, userProgress)

  res.json({ success: true, message: 'Profile updated successfully' })
})

app.get('/api/favorites', requireAuth, (req, res) => {
  const userId = (req as any).userId

  const userProgress = getUserProgress(userId)

  res.json({
    success: true,
    favorites: [...userProgress.favoriteWords],
  })
})

app.post('/api/favorites', requireAuth, (req, res) => {
  const userId = (req as any).userId
  const { chinese, pinyin, english, level, lessonId } = req.body

  const userProgress = getUserProgress(userId)

  const exists = userProgress.favoriteWords.some(w => w.chinese === chinese)
  if (!exists) {
    userProgress.favoriteWords.push({
      chinese,
      pinyin,
      english,
      level,
      lessonId,
      addedAt: new Date().toISOString(),
    })
    saveUserProgress(userId, userProgress)
  }

  res.json({ success: true, message: 'Favorite added' })
})

app.delete('/api/favorites/:chinese', requireAuth, (req, res) => {
  const userId = (req as any).userId
  const chineseToRemove = decodeURIComponent(req.params.chinese)

  const userProgress = getUserProgress(userId)

  userProgress.favoriteWords = userProgress.favoriteWords.filter(w => w.chinese !== chineseToRemove)
  saveUserProgress(userId, userProgress)

  res.json({ success: true, message: 'Favorite removed' })
})

app.get('/api/quiz/mistakes', requireAuth, (req, res) => {
  const userId = (req as any).userId

  const userProgress = getUserProgress(userId)

  res.json({
    success: true,
    mistakes: [...userProgress.quizMistakes],
  })
})

app.post('/api/quiz/mistakes', requireAuth, (req, res) => {
  const userId = (req as any).userId
  const mistake = req.body

  const userProgress = getUserProgress(userId)

  userProgress.quizMistakes.push(mistake)
  saveUserProgress(userId, userProgress)

  res.json({ success: true, message: 'Mistake added' })
})

app.delete('/api/quiz/mistakes', requireAuth, (req, res) => {
  const userId = (req as any).userId

  const userProgress = getUserProgress(userId)
  userProgress.quizMistakes = []
  saveUserProgress(userId, userProgress)

  res.json({ success: true, message: 'Mistakes cleared' })
})

app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`)
  console.log(`Users loaded: ${mockUsers.length}`)
  console.log(`Progress data loaded for: ${Object.keys(progressData.users).length} users`)
})
