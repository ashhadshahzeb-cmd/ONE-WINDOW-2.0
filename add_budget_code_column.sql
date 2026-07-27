-- Migration: Add budget_code column to file_tracking_records table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.file_tracking_records
ADD COLUMN IF NOT EXISTS budget_code TEXT;

-- Optional: Add comment for clarity
COMMENT ON COLUMN public.file_tracking_records.budget_code IS 'Budget Code associated with the file (e.g. BC-2024-001)';
