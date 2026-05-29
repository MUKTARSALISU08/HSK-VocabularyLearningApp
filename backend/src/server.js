import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';
import { progressRouter } from './routes/progress.routes';
// Only load dotenv in development (when not on Render)
if (!process.env.RENDER) {
    dotenv.config();
}
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'https://hsk-vocabulary-learning-app.vercel.app', 'https://hsk-vocabulary-learning-lbvg4jvwvv.vercel.app'],
    credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api', progressRouter);
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
