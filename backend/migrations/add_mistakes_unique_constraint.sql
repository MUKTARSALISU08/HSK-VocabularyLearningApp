-- Migration: Add unique constraint to quiz_mistakes table
-- This prevents duplicate mistakes for the same user, word, and answer

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'quiz_mistakes_user_id_word_chinese_your_answer_key'
    ) THEN
        -- Add the unique constraint
        ALTER TABLE public.quiz_mistakes 
        ADD CONSTRAINT quiz_mistakes_user_id_word_chinese_your_answer_key 
        UNIQUE (user_id, word_chinese, your_answer);
        
        RAISE NOTICE 'Unique constraint added successfully';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;
