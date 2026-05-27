-- HSK Vocabulary Learning App - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_study_date TIMESTAMPTZ,
    current_level TEXT DEFAULT 'HSK 1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT NOT NULL,
    words_learned INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    quiz_score INTEGER,
    last_studied TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Quiz History table
CREATE TABLE IF NOT EXISTS public.quiz_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorite Words table
CREATE TABLE IF NOT EXISTS public.favorite_words (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chinese TEXT NOT NULL,
    pinyin TEXT,
    english TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, chinese)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Study Statistics table
CREATE TABLE IF NOT EXISTS public.study_statistics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    quiz_attempts INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Quiz Mistakes table
CREATE TABLE IF NOT EXISTS public.quiz_mistakes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT NOT NULL,
    word_chinese TEXT NOT NULL,
    word_pinyin TEXT,
    word_english TEXT NOT NULL,
    your_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recently Learned table
CREATE TABLE IF NOT EXISTS public.recently_learned (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    word_chinese TEXT NOT NULL,
    word_pinyin TEXT,
    word_english TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    learned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word_chinese)
);

-- Daily XP tracking table
CREATE TABLE IF NOT EXISTS public.daily_xp (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    xp_amount INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_user_id ON public.quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_words_user_id ON public.favorite_words(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_study_statistics_user_id ON public.study_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_mistakes_user_id ON public.quiz_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_learned_user_id ON public.recently_learned(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_xp_user_id ON public.daily_xp(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_learned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_xp ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for lesson_progress table
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson progress" ON public.lesson_progress
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quiz_history table
CREATE POLICY "Users can view their own quiz history" ON public.quiz_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz history" ON public.quiz_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for favorite_words table
CREATE POLICY "Users can view their own favorites" ON public.favorite_words
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.favorite_words
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorite_words
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for achievements table
CREATE POLICY "Users can view their own achievements" ON public.achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_statistics table
CREATE POLICY "Users can view their own statistics" ON public.study_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON public.study_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON public.study_statistics
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for quiz_mistakes table
CREATE POLICY "Users can view their own mistakes" ON public.quiz_mistakes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mistakes" ON public.quiz_mistakes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mistakes" ON public.quiz_mistakes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recently_learned table
CREATE POLICY "Users can view their own recently learned" ON public.recently_learned
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recently learned" ON public.recently_learned
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recently learned" ON public.recently_learned
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for daily_xp table
CREATE POLICY "Users can view their own daily XP" ON public.daily_xp
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily XP" ON public.daily_xp
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily XP" ON public.daily_xp
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'User'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
