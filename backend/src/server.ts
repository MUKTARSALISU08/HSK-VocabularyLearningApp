import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth.routes'
import { progressRouter } from './routes/progress.routes'

dotenv.config()

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'https://hsk-vocabulary-learning-ap.vercel.app'],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api', progressRouter)

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
