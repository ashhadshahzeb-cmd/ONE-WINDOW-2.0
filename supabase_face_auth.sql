-- Run this in your Supabase SQL Editor

-- Check if the face_descriptor column exists, and add it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hrms_employees' AND column_name = 'face_descriptor') THEN
        ALTER TABLE public.hrms_employees ADD COLUMN face_descriptor TEXT;
    END IF;
END $$;
