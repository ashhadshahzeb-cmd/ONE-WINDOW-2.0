-- Add blocking functionality columns to department_users_settings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'department_users_settings' AND column_name = 'is_blocked') THEN
        ALTER TABLE public.department_users_settings ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'department_users_settings' AND column_name = 'enforce_attendance') THEN
        ALTER TABLE public.department_users_settings ADD COLUMN enforce_attendance BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
