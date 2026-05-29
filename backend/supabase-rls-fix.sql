-- Fix RLS Policies for Service Role Access
-- Run this in Supabase SQL Editor to update policies

-- 1. Create helper function to check if current role is service_role
CREATE OR REPLACE FUNCTION public.is_service_role() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN current_setting('role') = 'service_role';
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Update Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" ON public.users
    FOR ALL USING (auth.uid() = id OR public.is_service_role());

-- 3. Update Profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- 4. Update Lesson Progress table policies
DROP POLICY IF EXISTS "Users can view their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can insert their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can delete their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can manage their own lesson progress" ON public.lesson_progress
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- 5. Update Quiz History table policies
DROP POLICY IF EXISTS "Users can view their own quiz history" ON public.quiz_history;
CREATE POLICY "Users can view their own quiz history" ON public.quiz_history
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can insert their own quiz history" ON public.quiz_history;
CREATE POLICY "Users can manage their own quiz history" ON public.quiz_history
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- 6. Update Favorite Words table policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorite_words;
CREATE POLICY "Users can view their own favorites" ON public.favorite_words
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorite_words;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorite_words;
CREATE POLICY "Users can manage their own favorites" ON public.favorite_words
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- 7. Update Achievements table policies
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.achievements;
CREATE POLICY "Users can view their own achievements" ON public.achievements
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.achievements;
CREATE POLICY "Users can manage their own achievements" ON public.achievements
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- 8. Update Study Statistics table policies
DROP POLICY IF EXISTS "Users can view their own statistics" ON public.study_statistics;
CREATE POLICY "Users can view their own statistics" ON public.study_statistics
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can insert their own statistics" ON public.study_statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON public.study_statistics;
CREATE POLICY "Users can manage their own statistics" ON public.study_statistics
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- 9. Update Quiz Mistakes table policies
DROP POLICY IF EXISTS "Users can view their own mistakes" ON public.quiz_mistakes;
CREATE POLICY "Users can view their own mistakes" ON public.quiz_mistakes
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can insert their own mistakes" ON public.quiz_mistakes;
DROP POLICY IF EXISTS "Users can delete their own mistakes" ON public.quiz_mistakes;
CREATE POLICY "Users can manage their own mistakes" ON public.quiz_mistakes
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- 10. Update Recently Learned table policies
DROP POLICY IF EXISTS "Users can view their own recently learned" ON public.recently_learned;
CREATE POLICY "Users can view their own recently learned" ON public.recently_learned
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can insert their own recently learned" ON public.recently_learned;
DROP POLICY IF EXISTS "Users can update their own recently learned" ON public.recently_learned;
CREATE POLICY "Users can manage their own recently learned" ON public.recently_learned
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- 11. Update Daily XP table policies
DROP POLICY IF EXISTS "Users can view their own daily XP" ON public.daily_xp;
CREATE POLICY "Users can view their own daily XP" ON public.daily_xp
    FOR SELECT USING (auth.uid() = user_id OR public.is_service_role());

DROP POLICY IF EXISTS "Users can insert their own daily XP" ON public.daily_xp;
DROP POLICY IF EXISTS "Users can update their own daily XP" ON public.daily_xp;
CREATE POLICY "Users can manage their own daily XP" ON public.daily_xp
    FOR ALL USING (auth.uid() = user_id OR public.is_service_role());

-- Verify the changes
SELECT 'RLS policies updated successfully' AS result;